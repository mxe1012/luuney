// @vitest-environment jsdom
import { describe, it, expect, afterEach, vi } from "vitest";
import { formatTime, getDurationSum, isOnline } from "./helpers";
import { makePlaylist, makeTrack } from "../test/fixtures";

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

    it("does not roll minutes over into hours", () => {
        expect(formatTime(3661)).toBe("61:01");
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
