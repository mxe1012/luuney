// @vitest-environment jsdom
import { useState } from "react";
import { render, cleanup, fireEvent, screen, act } from "@testing-library/react";
import { describe, it, expect, afterEach, vi, beforeEach } from "vitest";
import AudioPlayer from "../../../ui/dashboard_components/AudioPlayer";
import SnackbarProvider from "../../../hooks/SnackbarContext";
import type { AudioPlayerProps, TrackObject } from "../../../utils/types";
import { makeTrack, makeTracks } from "../../fixtures";

// Web Audio / canvas are covered by Visualizer's own tests.
vi.mock("../../../ui/dashboard_components/audioplayer_components/Visualizer", () => ({ default: () => null }));

type Spies = {
    onSetCurrentTrackIndex: ReturnType<typeof vi.fn<(i: number) => void>>;
    onIsPlaying: ReturnType<typeof vi.fn<(v: boolean) => void>>;
    onHandleFetch: ReturnType<typeof vi.fn<(id: number) => Promise<void>>>;
};

type HarnessProps = Partial<Omit<AudioPlayerProps, "currentTrackIndex" | "onSetCurrentTrackIndex" | "isPlaying" | "onIsPlaying">> & {
    initialIndex?: number;
    spies: Spies;
};

// Owns currentTrackIndex / isPlaying the way Dashboard does so index changes
// made by the player (shuffle, track end) feed back into it.
function Harness({ initialIndex = 0, spies, ...rest }: HarnessProps) {
    const [index, setIndex] = useState(initialIndex);
    const [isPlaying, setIsPlaying] = useState(false);
    const tracks = rest.tracks ?? [];

    return (
        <AudioPlayer
            track={tracks[index] ?? makeTrack(1)}
            tracks={tracks}
            playlists={[]}
            isFavorited={false}
            onHandleCreatePlaylist={vi.fn()}
            onHandleAddToPlaylist={vi.fn()}
            onAddToFavorites={vi.fn()}
            {...rest}
            currentTrackIndex={index}
            onSetCurrentTrackIndex={(v) => {
                const next = typeof v === "function" ? v(index) : v;
                spies.onSetCurrentTrackIndex(next);
                setIndex(next);
            }}
            isPlaying={isPlaying}
            onIsPlaying={(v) => {
                const next = typeof v === "function" ? v(isPlaying) : v;
                spies.onIsPlaying(next);
                setIsPlaying(next);
            }}
            onHandleFetch={spies.onHandleFetch}
        />
    );
}

// jsdom does not implement media playback, so give the <audio> element a
// small controllable fake for the properties the player reads and writes.
function fakeMedia(audio: HTMLAudioElement) {
    const state = { paused: true, currentTime: 0, duration: 0, volume: 1, muted: false };

    Object.defineProperties(audio, {
        paused: { configurable: true, get: () => state.paused },
        currentTime: { configurable: true, get: () => state.currentTime, set: (v: number) => (state.currentTime = v) },
        duration: { configurable: true, get: () => state.duration },
        volume: { configurable: true, get: () => state.volume, set: (v: number) => (state.volume = v) },
        muted: { configurable: true, get: () => state.muted, set: (v: boolean) => (state.muted = v) },
    });

    const play = vi.fn(async () => {
        state.paused = false;
    });
    const pause = vi.fn(() => {
        state.paused = true;
    });
    audio.play = play;
    audio.pause = pause;

    return { state, play, pause };
}

function setup(props: Partial<HarnessProps> = {}) {
    const spies: Spies = {
        onSetCurrentTrackIndex: vi.fn(),
        onIsPlaying: vi.fn(),
        onHandleFetch: vi.fn().mockResolvedValue(undefined),
    };
    const utils = render(<Harness spies={spies} {...props} />, { wrapper: SnackbarProvider });
    const audio = utils.container.querySelector("audio") as HTMLAudioElement;
    const media = fakeMedia(audio);
    return { ...utils, spies, audio, media };
}

function snackbarText() {
    return document.getElementById("snackbar")?.textContent;
}

// The main and mini players render the same controls; use the main one.
function mainButton(name: string) {
    return screen.getAllByRole("button", { name })[0];
}

function mainSlider(label: string) {
    return screen.getAllByLabelText(label)[0] as HTMLInputElement;
}

describe("AudioPlayer", () => {
    beforeEach(() => {
        vi.spyOn(console, "error").mockImplementation(() => {});
    });

    afterEach(() => {
        cleanup();
        vi.restoreAllMocks();
    });

    describe("audio element", () => {
        it("streams the current track's url and autoplays", () => {
            const { audio } = setup({ tracks: [makeTrack(1)] });

            expect(audio.getAttribute("src")).toBe("https://example.com/stream/1");
            expect(audio.autoplay).toBe(true);
        });

        it("omits src when the track has no url", () => {
            const { audio } = setup({ tracks: [makeTrack(1, { url: "" })] });

            expect(audio.hasAttribute("src")).toBe(false);
        });

        it("reports play and pause events through onIsPlaying", () => {
            const { audio, spies } = setup({ tracks: [makeTrack(1)] });

            fireEvent.play(audio);
            expect(spies.onIsPlaying).toHaveBeenLastCalledWith(true);

            fireEvent.pause(audio);
            expect(spies.onIsPlaying).toHaveBeenLastCalledWith(false);
        });

        it("shows duration after loading and the current time on timeupdate", () => {
            const { audio, media } = setup({ tracks: [makeTrack(1)] });

            media.state.duration = 200;
            fireEvent.loadedData(audio);
            media.state.currentTime = 65;
            fireEvent.timeUpdate(audio);

            expect(screen.getByText("3:20")).toBeTruthy();
            expect(screen.getByText("1:05")).toBeTruthy();
            expect(mainSlider("Seek").style.getPropertyValue("--progress")).toBe("32.5%");
        });
    });

    describe("play / pause", () => {
        it("plays when paused", async () => {
            const { media } = setup({ tracks: [makeTrack(1)] });

            await act(async () => {
                fireEvent.click(mainButton("Play"));
            });

            expect(media.play).toHaveBeenCalledTimes(1);
        });

        it("pauses when playing", async () => {
            const { media } = setup({ tracks: [makeTrack(1)] });
            media.state.paused = false;

            await act(async () => {
                fireEvent.click(mainButton("Play"));
            });

            expect(media.pause).toHaveBeenCalledTimes(1);
            expect(media.play).not.toHaveBeenCalled();
        });

        it("shows a snackbar when playback is rejected", async () => {
            const { media } = setup({ tracks: [makeTrack(1)] });
            media.play.mockRejectedValueOnce(new Error("NotAllowedError"));

            await act(async () => {
                fireEvent.click(mainButton("Play"));
            });

            expect(snackbarText()).toBe("Playback failed!");
        });

        it("the button label follows the element's play state", () => {
            const { audio } = setup({ tracks: [makeTrack(1)] });

            fireEvent.play(audio);

            expect(screen.getAllByRole("button", { name: "Pause" })).toHaveLength(2);
        });
    });

    describe("seeking", () => {
        it("seeks the audio element via the slider", () => {
            const { audio, media } = setup({ tracks: [makeTrack(1)] });
            // The slider's max is the duration, so load one first.
            media.state.duration = 100;
            fireEvent.loadedData(audio);

            fireEvent.change(mainSlider("Seek"), { target: { value: "42" } });

            expect(media.state.currentTime).toBe(42);
        });

        it("fast forward skips 10s and the display is capped at the duration", () => {
            const { audio, media } = setup({ tracks: [makeTrack(1)] });
            media.state.duration = 100;
            fireEvent.loadedData(audio);
            media.state.currentTime = 95;

            fireEvent.click(mainButton("Fast Forward"));

            expect(media.state.currentTime).toBe(105);
            expect(screen.getAllByText("1:40")).toHaveLength(2); // current time == duration
        });

        it("rewind goes back 10s and the display is floored at 0", () => {
            const { media } = setup({ tracks: [makeTrack(1)] });
            media.state.currentTime = 4;

            fireEvent.click(mainButton("Rewind"));

            expect(media.state.currentTime).toBe(-6);
            expect(screen.getAllByText("0:00").length).toBeGreaterThan(0);
        });
    });

    describe("volume", () => {
        it("sets the element volume and reports it", () => {
            const { media } = setup({ tracks: [makeTrack(1)] });

            fireEvent.change(mainSlider("Volume"), { target: { value: "0.5" } });

            expect(media.state.volume).toBe(0.5);
            expect(snackbarText()).toBe("Volume: 50");
        });

        it("raising the volume unmutes", () => {
            const { media } = setup({ tracks: [makeTrack(1)] });
            media.state.muted = true;

            fireEvent.change(mainSlider("Volume"), { target: { value: "0.3" } });

            expect(media.state.muted).toBe(false);
        });

        it("toggles mute on the element", () => {
            const { audio, media } = setup({ tracks: [makeTrack(1)] });

            fireEvent.click(mainButton("Mute"));
            expect(media.state.muted).toBe(true);
            expect(snackbarText()).toBe("Audio muted!");

            // The UI updates from the element's volumechange event.
            fireEvent.volumeChange(audio);
            expect(screen.getAllByRole("button", { name: "Unmute" })).toHaveLength(2);
            expect(mainSlider("Volume").value).toBe("0");

            fireEvent.click(mainButton("Unmute"));
            expect(media.state.muted).toBe(false);
            expect(snackbarText()).toBe("Audio unmuted!");
        });

        it("unmuting from volume 0 restores a usable volume", () => {
            const { media } = setup({ tracks: [makeTrack(1)] });
            media.state.muted = true;
            media.state.volume = 0;

            fireEvent.click(mainButton("Mute"));

            expect(media.state.volume).toBe(0.5);
            expect(media.state.muted).toBe(false);
        });
    });

    describe("repeat", () => {
        it("cycles off → one → all → off", () => {
            const { audio } = setup({ tracks: [makeTrack(1)] });

            expect(audio.loop).toBe(false);

            fireEvent.click(mainButton("Repeat off"));
            expect(snackbarText()).toBe("Repeat, one");
            expect(audio.loop).toBe(true);

            fireEvent.click(mainButton("Repeat one"));
            expect(snackbarText()).toBe("Repeat, all");
            expect(audio.loop).toBe(false);

            fireEvent.click(mainButton("Repeat all"));
            expect(snackbarText()).toBe("Repeat, off");
            // Only the main player has this control.
            expect(screen.getAllByRole("button", { name: "Repeat off" })).toHaveLength(1);
        });
    });

    describe("when a track ends", () => {
        it("plays the next track in the queue", () => {
            const { audio, spies } = setup({ tracks: makeTracks(3), initialIndex: 0 });

            fireEvent.ended(audio);

            expect(spies.onSetCurrentTrackIndex).toHaveBeenCalledWith(1);
            expect(spies.onHandleFetch).toHaveBeenCalledWith(2);
        });

        it("stops at the end of the queue when repeat is off", () => {
            const { audio, spies } = setup({ tracks: makeTracks(3), initialIndex: 2 });

            fireEvent.ended(audio);

            expect(spies.onIsPlaying).toHaveBeenLastCalledWith(false);
            expect(spies.onHandleFetch).not.toHaveBeenCalled();
        });

        it("wraps to the start when repeat is all", () => {
            const { audio, spies } = setup({ tracks: makeTracks(3), initialIndex: 2 });
            fireEvent.click(mainButton("Repeat off"));
            fireEvent.click(mainButton("Repeat one"));

            fireEvent.ended(audio);

            expect(spies.onSetCurrentTrackIndex).toHaveBeenCalledWith(0);
            expect(spies.onHandleFetch).toHaveBeenCalledWith(1);
        });

        it("replays a single-track queue when repeat is all", () => {
            const { audio, media, spies } = setup({ tracks: [makeTrack(1)] });
            fireEvent.click(mainButton("Repeat off"));
            fireEvent.click(mainButton("Repeat one"));

            fireEvent.ended(audio);

            expect(media.play).toHaveBeenCalledTimes(1);
            expect(spies.onHandleFetch).not.toHaveBeenCalled();
        });
    });

    describe("shuffle", () => {
        // tracks 1..4, currently playing track 2 (index 1)
        function setupShuffle() {
            const tracks = makeTracks(4);
            // One random sort key per non-playing track [1, 3, 4] → order [4, 3, 1].
            vi.spyOn(Math, "random").mockReturnValueOnce(0.9).mockReturnValueOnce(0.5).mockReturnValueOnce(0.1);
            const utils = setup({ tracks, initialIndex: 1 });
            fireEvent.click(mainButton("Shuffle Off"));
            return { ...utils, tracks };
        }

        it("enabling puts the playing track first and resets the index", () => {
            const { spies } = setupShuffle();

            expect(spies.onSetCurrentTrackIndex).toHaveBeenLastCalledWith(0);
            expect(snackbarText()).toBe("Shuffle Enabled!");
            // Only the main player has this control.
            expect(screen.getAllByRole("button", { name: "Shuffle On" })).toHaveLength(1);
        });

        it("advances through the shuffled order when tracks end", () => {
            const { audio, spies } = setupShuffle();

            fireEvent.ended(audio);
            expect(spies.onHandleFetch).toHaveBeenLastCalledWith(4);

            fireEvent.ended(audio);
            expect(spies.onHandleFetch).toHaveBeenLastCalledWith(3);

            fireEvent.ended(audio);
            expect(spies.onHandleFetch).toHaveBeenLastCalledWith(1);
        });

        it("disabling restores the index of the playing track in the original order", () => {
            const { audio, spies } = setupShuffle();
            fireEvent.ended(audio); // now playing track 4 (shuffled index 1)

            fireEvent.click(mainButton("Shuffle On"));

            expect(spies.onSetCurrentTrackIndex).toHaveBeenLastCalledWith(3);
            expect(snackbarText()).toBe("Shuffle Disabled!");
        });

        it("reshuffles when a new queue is loaded while shuffle is on", () => {
            const spies: Spies = {
                onSetCurrentTrackIndex: vi.fn(),
                onIsPlaying: vi.fn(),
                onHandleFetch: vi.fn().mockResolvedValue(undefined),
            };
            const { rerender, container } = render(<Harness spies={spies} tracks={makeTracks(2)} />, {
                wrapper: SnackbarProvider,
            });
            fakeMedia(container.querySelector("audio") as HTMLAudioElement);
            fireEvent.click(mainButton("Shuffle Off"));
            spies.onSetCurrentTrackIndex.mockClear();

            const newQueue: TrackObject[] = makeTracks(3, 10);
            rerender(<Harness spies={spies} tracks={newQueue} />);

            expect(spies.onSetCurrentTrackIndex).toHaveBeenCalledWith(0);
        });
    });

    describe("skip next / previous", () => {
        function playFor(audio: HTMLAudioElement, media: ReturnType<typeof fakeMedia>, seconds: number) {
            media.state.currentTime = seconds;
            fireEvent.timeUpdate(audio);
        }

        describe("next", () => {
            it("plays the next track in the queue", () => {
                const { spies } = setup({ tracks: makeTracks(3), initialIndex: 0 });

                fireEvent.click(mainButton("Next"));

                expect(spies.onSetCurrentTrackIndex).toHaveBeenLastCalledWith(1);
                expect(spies.onHandleFetch).toHaveBeenLastCalledWith(2);
            });

            it("wraps from the last track to the first", () => {
                const { spies } = setup({ tracks: makeTracks(3), initialIndex: 2 });

                fireEvent.click(mainButton("Next"));

                expect(spies.onSetCurrentTrackIndex).toHaveBeenLastCalledWith(0);
                expect(spies.onHandleFetch).toHaveBeenLastCalledWith(1);
            });

            it("wraps even when repeat is off", () => {
                const { spies } = setup({ tracks: makeTracks(2), initialIndex: 1 });

                fireEvent.click(mainButton("Next"));

                expect(spies.onHandleFetch).toHaveBeenLastCalledWith(1);
            });

            it("advances through repeated presses", () => {
                const { spies } = setup({ tracks: makeTracks(3), initialIndex: 0 });

                fireEvent.click(mainButton("Next"));
                fireEvent.click(mainButton("Next"));
                fireEvent.click(mainButton("Next"));

                expect(spies.onHandleFetch.mock.calls.map(([id]) => id)).toEqual([2, 3, 1]);
            });

            it.each([
                ["empty", []],
                ["single-track", [makeTrack(1)]],
            ])("does nothing with an %s queue", (_, tracks) => {
                const { spies } = setup({ tracks });

                fireEvent.click(mainButton("Next"));

                expect(spies.onSetCurrentTrackIndex).not.toHaveBeenCalled();
                expect(spies.onHandleFetch).not.toHaveBeenCalled();
            });

            it("follows the shuffled order when shuffle is on", () => {
                // Sort keys for the non-playing tracks [1, 3, 4] → shuffled order [2, 4, 3, 1].
                vi.spyOn(Math, "random").mockReturnValueOnce(0.9).mockReturnValueOnce(0.5).mockReturnValueOnce(0.1);
                const { spies } = setup({ tracks: makeTracks(4), initialIndex: 1 });
                fireEvent.click(mainButton("Shuffle Off"));

                fireEvent.click(mainButton("Next"));

                expect(spies.onHandleFetch).toHaveBeenLastCalledWith(4);
            });
        });

        describe("previous", () => {
            it("plays the previous track when within the first 3 seconds", () => {
                const { audio, media, spies } = setup({ tracks: makeTracks(3), initialIndex: 2 });
                playFor(audio, media, 2);

                fireEvent.click(mainButton("Previous"));

                expect(spies.onSetCurrentTrackIndex).toHaveBeenLastCalledWith(1);
                expect(spies.onHandleFetch).toHaveBeenLastCalledWith(2);
            });

            it("still goes back at exactly 3 seconds", () => {
                const { audio, media, spies } = setup({ tracks: makeTracks(3), initialIndex: 2 });
                playFor(audio, media, 3);

                fireEvent.click(mainButton("Previous"));

                expect(spies.onHandleFetch).toHaveBeenLastCalledWith(2);
            });

            it("restarts the current track after 3 seconds instead of going back", () => {
                const { audio, media, spies } = setup({ tracks: makeTracks(3), initialIndex: 2 });
                playFor(audio, media, 45);

                fireEvent.click(mainButton("Previous"));

                expect(media.state.currentTime).toBe(0);
                expect(screen.getAllByText("0:00").length).toBeGreaterThan(0);
                expect(spies.onHandleFetch).not.toHaveBeenCalled();
                expect(spies.onSetCurrentTrackIndex).not.toHaveBeenCalled();
            });

            it("goes back on a second press after restarting", () => {
                const { audio, media, spies } = setup({ tracks: makeTracks(3), initialIndex: 2 });
                playFor(audio, media, 45);

                fireEvent.click(mainButton("Previous"));
                fireEvent.click(mainButton("Previous"));

                expect(spies.onHandleFetch).toHaveBeenCalledTimes(1);
                expect(spies.onHandleFetch).toHaveBeenLastCalledWith(2);
            });

            it("wraps from the first track to the last", () => {
                const { spies } = setup({ tracks: makeTracks(3), initialIndex: 0 });

                fireEvent.click(mainButton("Previous"));

                expect(spies.onSetCurrentTrackIndex).toHaveBeenLastCalledWith(2);
                expect(spies.onHandleFetch).toHaveBeenLastCalledWith(3);
            });

            it.each([
                ["empty", []],
                ["single-track", [makeTrack(1)]],
            ])("does nothing with an %s queue, even after 3 seconds", (_, tracks) => {
                const { audio, media, spies } = setup({ tracks });
                playFor(audio, media, 45);

                fireEvent.click(mainButton("Previous"));

                expect(media.state.currentTime).toBe(45);
                expect(spies.onSetCurrentTrackIndex).not.toHaveBeenCalled();
                expect(spies.onHandleFetch).not.toHaveBeenCalled();
            });

            it("follows the shuffled order when shuffle is on", () => {
                // Shuffled order [2, 4, 3, 1]; from the start, previous wraps to the end.
                vi.spyOn(Math, "random").mockReturnValueOnce(0.9).mockReturnValueOnce(0.5).mockReturnValueOnce(0.1);
                const { spies } = setup({ tracks: makeTracks(4), initialIndex: 1 });
                fireEvent.click(mainButton("Shuffle Off"));

                fireEvent.click(mainButton("Previous"));

                expect(spies.onSetCurrentTrackIndex).toHaveBeenLastCalledWith(3);
                expect(spies.onHandleFetch).toHaveBeenLastCalledWith(1);
            });
        });
    });

    describe("media session", () => {
        // jsdom has no Media Session API, so install a small fake on navigator.
        let handlers: Map<MediaSessionAction, MediaSessionActionHandler | null>;
        let mediaSession: {
            metadata: FakeMediaMetadata | null;
            setActionHandler: ReturnType<typeof vi.fn>;
            setPositionState: ReturnType<typeof vi.fn>;
        };
        let metadataCount: number;

        class FakeMediaMetadata {
            title?: string;
            artist?: string;
            artwork?: MediaImage[];

            constructor(init: MediaMetadataInit) {
                metadataCount++;
                Object.assign(this, init);
            }
        }

        beforeEach(() => {
            handlers = new Map();
            metadataCount = 0;
            mediaSession = {
                metadata: null,
                setActionHandler: vi.fn((action: MediaSessionAction, handler: MediaSessionActionHandler | null) => {
                    handlers.set(action, handler);
                }),
                setPositionState: vi.fn(),
            };
            Object.defineProperty(navigator, "mediaSession", { configurable: true, value: mediaSession });
            vi.stubGlobal("MediaMetadata", FakeMediaMetadata);
        });

        afterEach(() => {
            // Unmount first: the player's cleanup still needs navigator.mediaSession.
            cleanup();
            Reflect.deleteProperty(navigator, "mediaSession");
            vi.unstubAllGlobals();
        });

        // What a media key / lock screen button press does.
        async function press(action: MediaSessionAction, details: Partial<MediaSessionActionDetails> = {}) {
            await act(async () => {
                handlers.get(action)?.({ action, ...details });
            });
        }

        const ACTIONS: MediaSessionAction[] = [
            "play", "pause", "nexttrack", "previoustrack", "seekbackward", "seekforward", "seekto",
        ];

        describe("action handlers", () => {
            it("registers a handler for every supported action on mount", () => {
                setup({ tracks: [makeTrack(1)] });

                for (const action of ACTIONS) {
                    expect(handlers.get(action)).toEqual(expect.any(Function));
                }
            });

            it("removes every handler on unmount", () => {
                const { unmount } = setup({ tracks: [makeTrack(1)] });

                unmount();

                for (const action of ACTIONS) {
                    expect(handlers.get(action)).toBeNull();
                }
            });

            it("registers the handlers only once, not on every render", () => {
                const { audio, media } = setup({ tracks: [makeTrack(1)] });
                const callsAfterMount = mediaSession.setActionHandler.mock.calls.length;

                media.state.currentTime = 5;
                fireEvent.timeUpdate(audio);
                media.state.currentTime = 6;
                fireEvent.timeUpdate(audio);

                expect(mediaSession.setActionHandler).toHaveBeenCalledTimes(callsAfterMount);
            });

            it("play starts playback when paused", async () => {
                const { media } = setup({ tracks: [makeTrack(1)] });

                await press("play");

                expect(media.play).toHaveBeenCalledTimes(1);
            });

            it("pause stops playback when playing", async () => {
                const { media } = setup({ tracks: [makeTrack(1)] });
                media.state.paused = false;

                await press("pause");

                expect(media.pause).toHaveBeenCalledTimes(1);
            });

            it("nexttrack plays the next track", async () => {
                const { spies } = setup({ tracks: makeTracks(3), initialIndex: 0 });

                await press("nexttrack");

                expect(spies.onSetCurrentTrackIndex).toHaveBeenLastCalledWith(1);
                expect(spies.onHandleFetch).toHaveBeenLastCalledWith(2);
            });

            it("previoustrack plays the previous track", async () => {
                const { spies } = setup({ tracks: makeTracks(3), initialIndex: 2 });

                await press("previoustrack");

                expect(spies.onSetCurrentTrackIndex).toHaveBeenLastCalledWith(1);
                expect(spies.onHandleFetch).toHaveBeenLastCalledWith(2);
            });

            it("uses the latest queue position, not the one from the first render", async () => {
                const { spies } = setup({ tracks: makeTracks(3), initialIndex: 0 });

                await press("nexttrack");
                await press("nexttrack");

                expect(spies.onHandleFetch.mock.calls.map(([id]) => id)).toEqual([2, 3]);
            });

            it("seekbackward and seekforward skip 10 seconds", async () => {
                const { media } = setup({ tracks: [makeTrack(1)] });
                media.state.currentTime = 30;

                await press("seekforward");
                expect(media.state.currentTime).toBe(40);

                await press("seekbackward");
                expect(media.state.currentTime).toBe(30);
            });

            it("seekto jumps to the requested time", async () => {
                const { media } = setup({ tracks: [makeTrack(1)] });

                await press("seekto", { seekTime: 72 });

                expect(media.state.currentTime).toBe(72);
                expect(screen.getAllByText("1:12").length).toBeGreaterThan(0);
            });

            it("seekto without a seekTime does nothing", async () => {
                const { media } = setup({ tracks: [makeTrack(1)] });
                media.state.currentTime = 30;

                await press("seekto");

                expect(media.state.currentTime).toBe(30);
            });
        });

        describe("metadata", () => {
            it("shows the current track's title, artist and artwork", () => {
                setup({ tracks: [makeTrack(1)] });

                expect(mediaSession.metadata).toMatchObject({
                    title: "Track 1",
                    artist: "artist1",
                    artwork: [{ src: "https://example.com/art/1.jpg", sizes: "480x480" }],
                });
            });

            it("is not set for a track without a stream url", () => {
                setup({ tracks: [makeTrack(1, { url: "" })] });

                expect(mediaSession.metadata).toBeNull();
            });

            it("updates when the track changes", async () => {
                setup({ tracks: makeTracks(2), initialIndex: 0 });

                await press("nexttrack");

                expect(mediaSession.metadata?.title).toBe("Track 2");
                expect(mediaSession.metadata?.artist).toBe("artist2");
            });

            it("is not rebuilt while the track plays", () => {
                const { audio, media } = setup({ tracks: [makeTrack(1)] });
                const builtOnMount = metadataCount;

                media.state.currentTime = 5;
                fireEvent.timeUpdate(audio);
                media.state.currentTime = 6;
                fireEvent.timeUpdate(audio);

                expect(metadataCount).toBe(builtOnMount);
            });
        });

        describe("position state", () => {
            it("is not reported before the duration is known", () => {
                const { audio, media } = setup({ tracks: [makeTrack(1)] });

                media.state.currentTime = 5;
                fireEvent.timeUpdate(audio);

                expect(mediaSession.setPositionState).not.toHaveBeenCalled();
            });

            it("reports the duration and the current position as the track plays", () => {
                const { audio, media } = setup({ tracks: [makeTrack(1)] });
                media.state.duration = 200;
                fireEvent.loadedData(audio);

                media.state.currentTime = 65;
                fireEvent.timeUpdate(audio);

                expect(mediaSession.setPositionState).toHaveBeenLastCalledWith({ duration: 200, position: 65 });
            });

            it("keeps the position within the duration", () => {
                const { audio, media } = setup({ tracks: [makeTrack(1)] });
                media.state.duration = 100;
                fireEvent.loadedData(audio);

                media.state.currentTime = 150;
                fireEvent.timeUpdate(audio);

                expect(mediaSession.setPositionState).toHaveBeenLastCalledWith({ duration: 100, position: 100 });
            });

            it("is not reported for a non-finite duration", () => {
                const { audio, media } = setup({ tracks: [makeTrack(1)] });
                media.state.duration = Infinity;
                fireEvent.loadedData(audio);

                expect(mediaSession.setPositionState).not.toHaveBeenCalled();
            });
        });
    });

    describe("scrolling", () => {
        afterEach(() => {
            Reflect.deleteProperty(document.documentElement, "scrollTop");
        });

        function scrollTo(y: number) {
            Object.defineProperty(document.documentElement, "scrollTop", { configurable: true, value: y });
            fireEvent.scroll(window);
        }

        it("switches to the mini player after scrolling past the threshold", () => {
            const { container } = setup({ tracks: [makeTrack(1)] });

            scrollTo(556);
            expect(container.querySelector(".AudioPlayer")?.className).toBe("AudioPlayer hidden");
            expect(container.querySelector(".MiniAudioPlayer")?.className).toBe("MiniAudioPlayer");

            scrollTo(555);
            expect(container.querySelector(".AudioPlayer")?.className).toBe("AudioPlayer");
        });

        it("removes the scroll listener on unmount", () => {
            const removeSpy = vi.spyOn(window, "removeEventListener");
            const { unmount } = setup({ tracks: [makeTrack(1)] });

            unmount();

            expect(removeSpy).toHaveBeenCalledWith("scroll", expect.any(Function));
        });
    });
});
