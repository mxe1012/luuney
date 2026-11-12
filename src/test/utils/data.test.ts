import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
    fetchTrackById,
    fetchTrackByQuery,
    fetchTrackTrending,
    fetchTrackLatest,
    fetchUsers,
    fetchTracksByUser,
} from "../../utils/data";

const BASE = "https://api.audius.co/v1";

function okResponse(body: unknown) {
    return { ok: true, status: 200, json: async () => body } as Response;
}

function errorResponse(status: number) {
    return { ok: false, status, json: async () => ({}) } as Response;
}

describe("Audius data layer", () => {
    const fetchMock = vi.fn<typeof fetch>();

    beforeEach(() => {
        fetchMock.mockReset();
        vi.stubGlobal("fetch", fetchMock);
        // Each function logs failures; keep test output clean.
        vi.spyOn(console, "error").mockImplementation(() => {});
    });

    afterEach(() => {
        vi.unstubAllGlobals();
        vi.restoreAllMocks();
    });

    // Every fetcher shares the same contract, so run the same checks on each.
    const cases: Array<{ name: string; call: () => Promise<unknown>; url: string }> = [
        { name: "fetchTrackById", call: () => fetchTrackById(42), url: `${BASE}/tracks/42` },
        {
            name: "fetchTrackByQuery",
            call: () => fetchTrackByQuery("lofi beats"),
            url: `${BASE}/tracks/search?limit=1000&query=lofi%20beats`,
        },
        { name: "fetchTrackTrending", call: () => fetchTrackTrending(), url: `${BASE}/tracks/trending` },
        { name: "fetchTrackLatest", call: () => fetchTrackLatest(), url: `${BASE}/tracks/latest` },
        {
            name: "fetchUsers",
            call: () => fetchUsers("dj"),
            url: `${BASE}/users/search?limit=1000&query=dj`,
        },
        { name: "fetchTracksByUser", call: () => fetchTracksByUser(7), url: `${BASE}/users/7/tracks` },
    ];

    describe.each(cases)("$name", ({ call, url }) => {
        it("requests the correct endpoint", async () => {
            fetchMock.mockResolvedValue(okResponse({ data: [] }));

            await call();

            expect(fetchMock).toHaveBeenCalledTimes(1);
            expect(fetchMock).toHaveBeenCalledWith(url);
        });

        it("returns the parsed JSON body on success", async () => {
            const body = { data: [{ id: 1 }] };
            fetchMock.mockResolvedValue(okResponse(body));

            await expect(call()).resolves.toEqual(body);
        });

        it("throws with the status code when the response is not ok", async () => {
            fetchMock.mockResolvedValue(errorResponse(503));

            await expect(call()).rejects.toThrow("Failed with code 503");
            expect(console.error).toHaveBeenCalled();
        });

        it("rethrows network errors", async () => {
            const networkError = new TypeError("Failed to fetch");
            fetchMock.mockRejectedValue(networkError);

            await expect(call()).rejects.toBe(networkError);
            expect(console.error).toHaveBeenCalledWith(networkError);
        });
    });

    it("URL-encodes special characters in search queries", async () => {
        fetchMock.mockResolvedValue(okResponse({ data: [] }));

        await fetchTrackByQuery("a&b=c/d?#");
        await fetchUsers("björk & co");

        expect(fetchMock).toHaveBeenNthCalledWith(
            1,
            `${BASE}/tracks/search?limit=1000&query=a%26b%3Dc%2Fd%3F%23`,
        );
        expect(fetchMock).toHaveBeenNthCalledWith(
            2,
            `${BASE}/users/search?limit=1000&query=bj%C3%B6rk%20%26%20co`,
        );
    });
});
