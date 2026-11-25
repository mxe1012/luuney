// @vitest-environment jsdom
import { renderHook, act, cleanup } from "@testing-library/react";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { useMediaSession } from "../../hooks/useMediaSession";
import type { MediaSessionHandlers, TrackObject } from "../../utils/types";
import { makeTrack } from "../fixtures";

const ACTIONS: MediaSessionAction[] = [
    "play", "pause", "nexttrack", "previoustrack", "seekbackward", "seekforward", "seekto",
];

function makeHandlers(): MediaSessionHandlers {
    return {
        onTogglePlay: vi.fn(),
        onSkipNext: vi.fn(),
        onSkipPrev: vi.fn(),
        onRewind: vi.fn(),
        onFastForward: vi.fn(),
        onSeekTo: vi.fn(),
    };
}

describe("useMediaSession", () => {
    // jsdom has no Media Session API, so install a small fake on navigator.
    let actionHandlers: Map<MediaSessionAction, MediaSessionActionHandler | null>;
    let mediaSession: {
        metadata: FakeMediaMetadata | null;
        setActionHandler: ReturnType<typeof vi.fn>;
        setPositionState: ReturnType<typeof vi.fn>;
    };

    class FakeMediaMetadata {
        title?: string;
        artist?: string;
        artwork?: MediaImage[];

        constructor(init: MediaMetadataInit) {
            Object.assign(this, init);
        }
    }

    beforeEach(() => {
        actionHandlers = new Map();
        mediaSession = {
            metadata: null,
            setActionHandler: vi.fn((action: MediaSessionAction, handler: MediaSessionActionHandler | null) => {
                actionHandlers.set(action, handler);
            }),
            setPositionState: vi.fn(),
        };
        Object.defineProperty(navigator, "mediaSession", { configurable: true, value: mediaSession });
        vi.stubGlobal("MediaMetadata", FakeMediaMetadata);
    });

    afterEach(() => {
        // Unmount first: the hook's cleanup still needs navigator.mediaSession.
        cleanup();
        Reflect.deleteProperty(navigator, "mediaSession");
        vi.unstubAllGlobals();
    });

    function render(track: TrackObject = makeTrack(1), currentTime = 0, duration = 0, handlers = makeHandlers()) {
        const hook = renderHook(
            (props) => useMediaSession(props.track, props.currentTime, props.duration, props.handlers),
            { initialProps: { track, currentTime, duration, handlers } },
        );
        return { ...hook, handlers };
    }

    // What a media key / lock screen button press does.
    function press(action: MediaSessionAction, details: Partial<MediaSessionActionDetails> = {}) {
        act(() => {
            actionHandlers.get(action)?.({ action, ...details });
        });
    }

    describe("action handlers", () => {
        it("registers a handler for every supported action on mount, and removes them on unmount", () => {
            const { unmount } = render();

            for (const action of ACTIONS) expect(actionHandlers.get(action)).toEqual(expect.any(Function));

            unmount();

            for (const action of ACTIONS) expect(actionHandlers.get(action)).toBeNull();
        });

        it("registers the handlers only once, not on every render", () => {
            const { rerender, handlers } = render();
            const callsAfterMount = mediaSession.setActionHandler.mock.calls.length;

            rerender({ track: makeTrack(1), currentTime: 5, duration: 100, handlers });

            expect(mediaSession.setActionHandler).toHaveBeenCalledTimes(callsAfterMount);
        });

        it("play and pause both toggle playback", () => {
            const { handlers } = render();

            press("play");
            press("pause");

            expect(handlers.onTogglePlay).toHaveBeenCalledTimes(2);
        });

        it("maps the track and seek actions to their handlers", () => {
            const { handlers } = render();

            press("nexttrack");
            press("previoustrack");
            press("seekbackward");
            press("seekforward");

            expect(handlers.onSkipNext).toHaveBeenCalledTimes(1);
            expect(handlers.onSkipPrev).toHaveBeenCalledTimes(1);
            expect(handlers.onRewind).toHaveBeenCalledTimes(1);
            expect(handlers.onFastForward).toHaveBeenCalledTimes(1);
        });

        it("seekto passes the requested time, and does nothing without one", () => {
            const { handlers } = render();

            press("seekto", { seekTime: 72 });
            press("seekto");

            expect(handlers.onSeekTo).toHaveBeenCalledTimes(1);
            expect(handlers.onSeekTo).toHaveBeenCalledWith(72);
        });

        it("calls the latest handlers, not the ones from the first render", () => {
            const { rerender, handlers: first } = render();
            const latest = makeHandlers();

            rerender({ track: makeTrack(1), currentTime: 0, duration: 0, handlers: latest });
            press("nexttrack");

            expect(first.onSkipNext).not.toHaveBeenCalled();
            expect(latest.onSkipNext).toHaveBeenCalledTimes(1);
        });
    });

    describe("metadata", () => {
        it("shows the track's title, artist and artwork", () => {
            render(makeTrack(1));

            expect(mediaSession.metadata).toMatchObject({
                title: "Track 1",
                artist: "artist1",
                artwork: [{ src: "https://example.com/art/1.jpg", sizes: "480x480" }],
            });
        });

        it("is not set for a track without a stream url", () => {
            render(makeTrack(1, { url: "" }));

            expect(mediaSession.metadata).toBeNull();
        });

        it("updates when the track changes", () => {
            const { rerender, handlers } = render(makeTrack(1));

            rerender({ track: makeTrack(2), currentTime: 0, duration: 0, handlers });

            expect(mediaSession.metadata?.title).toBe("Track 2");
        });
    });

    describe("position state", () => {
        it("reports the duration and the position", () => {
            render(makeTrack(1), 65, 200);

            expect(mediaSession.setPositionState).toHaveBeenLastCalledWith({ duration: 200, position: 65 });
        });

        it("keeps the position within the duration", () => {
            render(makeTrack(1), 150, 100);

            expect(mediaSession.setPositionState).toHaveBeenLastCalledWith({ duration: 100, position: 100 });
        });

        it("is not reported before the duration is known, or for a non-finite duration", () => {
            const { rerender, handlers } = render(makeTrack(1), 5, 0);

            rerender({ track: makeTrack(1), currentTime: 5, duration: Infinity, handlers });
            rerender({ track: makeTrack(1), currentTime: 5, duration: NaN, handlers });

            expect(mediaSession.setPositionState).not.toHaveBeenCalled();
        });
    });

    it("does nothing in a browser without the Media Session API", () => {
        Reflect.deleteProperty(navigator, "mediaSession");

        expect(() => render(makeTrack(1), 5, 100).unmount()).not.toThrow();
    });
});
