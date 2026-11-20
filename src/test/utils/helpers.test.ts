// @vitest-environment jsdom
import { describe, it, expect, afterEach, vi } from "vitest";
import { formatTime, getDurationSum, isOnline, isSameEntry, shuffleWithPlayingFirst, switchVolumeIcon, toTrackObject, toTrackObjects } from "../../utils/helpers";
import type { ApiTrack } from "../../utils/types";
import { makeApiTrack, makePlaylist, makeTrack, makeTracks } from "../fixtures";

describe("formatTime", () => {
    it("formats zero as 0:00", () => {
        expect(formatTime(0)).toBe("0:00");
    });

    it("pads seconds to two digits", () => {
        expect(formatTime(5)).toBe("0:05");
        expect(formatTime(65)).toBe("1:05");
    });

    it("formats whole minutes", () => {
        expect(formatTime(60)).toBe("1:00");
        expect(formatTime(600)).toBe("10:00");
    });

    it("stays in minutes just under an hour", () => {
        expect(formatTime(3599)).toBe("59:59");
    });

    it("adds hours from one hour up, padding minutes and seconds", () => {
        expect(formatTime(3600)).toBe("1:00:00");
        expect(formatTime(3661)).toBe("1:01:01");
        expect(formatTime(36000)).toBe("10:00:00");
    });

    it("floors fractional seconds", () => {
        expect(formatTime(59.999)).toBe("0:59");
        expect(formatTime(61.5)).toBe("1:01");
    });

    it("returns 0:00 for non-finite input", () => {
        expect(formatTime(NaN)).toBe("0:00");
        expect(formatTime(Infinity)).toBe("0:00");
        expect(formatTime(-Infinity)).toBe("0:00");
    });
});

describe("getDurationSum", () => {
    it("returns 0 for an empty playlist", () => {
        expect(getDurationSum(makePlaylist("p", []))).toBe(0);
    });

    it("sums the durations of every track", () => {
        const playlist = makePlaylist("p", [
            makeTrack(1, { duration: 30 }),
            makeTrack(2, { duration: 45 }),
            makeTrack(3, { duration: 125 }),
        ]);

        expect(getDurationSum(playlist)).toBe(200);
    });
});

describe("isOnline", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("reflects navigator.onLine", () => {
        const spy = vi.spyOn(navigator, "onLine", "get");

        spy.mockReturnValue(true);
        expect(isOnline()).toBe(true);

        spy.mockReturnValue(false);
        expect(isOnline()).toBe(false);
    });
});

describe("isSameEntry", () => {
    it("compares tracks by track_id only", () => {
        expect(isSameEntry(makeTrack(1), makeTrack(1, { title: "Renamed" }))).toBe(true);
        expect(isSameEntry(makeTrack(1), makeTrack(2))).toBe(false);
    });
});

describe("toTrackObject", () => {
    it("maps an API track to a TrackObject", () => {
        expect(toTrackObject(makeApiTrack(1) as ApiTrack)).toEqual(makeTrack(1));
    });

    it("falls back to the placeholder artwork", () => {
        const track = toTrackObject(makeApiTrack(1, { artwork: null }) as ApiTrack);

        expect(track.artwork).toBe("/assets/placeholder-cover-purple.svg");
    });
});

describe("toTrackObjects", () => {
    it("maps every track and leaves out those without a stream URL", () => {
        const apiTracks = [makeApiTrack(1), makeApiTrack(2, { stream: {} }), makeApiTrack(3)] as ApiTrack[];

        expect(toTrackObjects(apiTracks)).toEqual([makeTrack(1), makeTrack(3)]);
    });
});

describe("shuffleWithPlayingFirst", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("puts the playing track first, followed by the rest in random order", () => {
        const tracks = makeTracks(4);
        // sort keys for tracks 1, 3, 4 (track 2 is playing): 4 sorts first, then 1, then 3
        vi.spyOn(Math, "random").mockReturnValueOnce(0.5).mockReturnValueOnce(0.9).mockReturnValueOnce(0.1);

        expect(shuffleWithPlayingFirst(tracks, tracks[1]).map((t) => t.track_id)).toEqual([2, 4, 1, 3]);
    });

    it("keeps every track exactly once", () => {
        const tracks = makeTracks(5);
        const result = shuffleWithPlayingFirst(tracks, tracks[2]);

        expect(result[0]).toBe(tracks[2]);
        expect([...result].sort((a, b) => a.track_id - b.track_id)).toEqual(tracks);
    });

    it("shuffles all tracks when nothing is playing", () => {
        const tracks = makeTracks(3);

        expect(shuffleWithPlayingFirst(tracks, undefined)).toHaveLength(3);
    });
});

describe("switchVolumeIcon", () => {
    const icon = (name: string) => `/assets/audio_player_icons/${name}.svg`;

    it("shows the silent icon only at exactly zero", () => {
        expect(switchVolumeIcon(0)).toBe(icon("volume-0"));
        expect(switchVolumeIcon(0.01)).toBe(icon("volume-1"));
    });

    it("shows one wave up to and including 0.34", () => {
        expect(switchVolumeIcon(0.34)).toBe(icon("volume-1"));
        expect(switchVolumeIcon(0.35)).toBe(icon("volume-2"));
    });

    it("shows two waves up to and including 0.67", () => {
        expect(switchVolumeIcon(0.67)).toBe(icon("volume-2"));
        expect(switchVolumeIcon(0.68)).toBe(icon("volume-3"));
    });

    it("shows three waves at full volume", () => {
        expect(switchVolumeIcon(1)).toBe(icon("volume-3"));
    });
});
