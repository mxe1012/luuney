// @vitest-environment jsdom
import { render, cleanup, fireEvent, screen, act } from "@testing-library/react";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import SearchListPane from "./SearchListPane";
import SnackbarProvider from "../../hooks/SnackbarContext";
import type { SearchListPaneProps } from "../../utils/types";
import { makeApiTrack, makeApiUser } from "../../test/fixtures";
import { fetchTrackByQuery, fetchTracksByUser, fetchUsers } from "../../utils/data";

vi.mock("../../utils/data", () => ({
    fetchTrackByQuery: vi.fn(),
    fetchUsers: vi.fn(),
    fetchTracksByUser: vi.fn(),
}));

const mockFetchTrackByQuery = vi.mocked(fetchTrackByQuery);
const mockFetchUsers = vi.mocked(fetchUsers);
const mockFetchTracksByUser = vi.mocked(fetchTracksByUser);

const DEBOUNCE_MS = 600;

function setup(overrides: Partial<SearchListPaneProps> = {}) {
    const props: SearchListPaneProps = {
        onHandleFetch: vi.fn().mockResolvedValue(undefined),
        isFavorited: () => false,
        onAddToFavorites: vi.fn(),
        onIsPlaying: vi.fn(),
        onSetCurrentTrackIndex: vi.fn(),
        onSetTrackQueue: vi.fn(),
        ...overrides,
    };
    const utils = render(<SearchListPane {...props} />, { wrapper: SnackbarProvider });
    return { ...utils, props };
}

function input() {
    return screen.getByRole("textbox") as HTMLInputElement;
}

function type(value: string) {
    fireEvent.change(input(), { target: { value } });
}

async function flushDebounce() {
    await act(async () => {
        await vi.advanceTimersByTimeAsync(DEBOUNCE_MS);
    });
}

function isSkeletonShown(container: HTMLElement) {
    return container.querySelector(".skeleton-search-list-button") !== null;
}

function snackbarText() {
    return document.getElementById("snackbar")?.textContent;
}

describe("SearchListPane", () => {
    beforeEach(() => {
        vi.useFakeTimers();
        mockFetchTrackByQuery.mockReset();
        mockFetchUsers.mockReset();
        mockFetchTracksByUser.mockReset();
        vi.spyOn(console, "error").mockImplementation(() => {});
    });

    afterEach(() => {
        cleanup();
        vi.useRealTimers();
        vi.restoreAllMocks();
    });

    describe("track search", () => {
        it("debounces the request until typing pauses", async () => {
            mockFetchTrackByQuery.mockResolvedValue({ data: [] });
            setup();

            type("l");
            type("lo");
            type("lofi");
            await act(async () => {
                await vi.advanceTimersByTimeAsync(DEBOUNCE_MS - 1);
            });
            expect(mockFetchTrackByQuery).not.toHaveBeenCalled();

            await act(async () => {
                await vi.advanceTimersByTimeAsync(1);
            });
            expect(mockFetchTrackByQuery).toHaveBeenCalledTimes(1);
            expect(mockFetchTrackByQuery).toHaveBeenCalledWith("lofi");
        });

        it("shows a skeleton while searching and the results afterwards", async () => {
            mockFetchTrackByQuery.mockResolvedValue({ data: [makeApiTrack(1), makeApiTrack(2)] });
            const { container } = setup();

            type("lofi");
            expect(isSkeletonShown(container)).toBe(true);

            await flushDebounce();

            expect(isSkeletonShown(container)).toBe(false);
            expect(screen.getByText("Track 1")).toBeTruthy();
            expect(screen.getByText("Track 2")).toBeTruthy();
        });

        it("drops tracks without a stream URL and maps artwork / handle", async () => {
            mockFetchTrackByQuery.mockResolvedValue({
                data: [
                    makeApiTrack(1),
                    makeApiTrack(2, { stream: { url: "" } }),
                    makeApiTrack(3, { stream: undefined }),
                    makeApiTrack(4, { artwork: null }),
                ],
            });
            const { container } = setup();

            type("x");
            await flushDebounce();

            expect(screen.getByText("Track 1")).toBeTruthy();
            expect(screen.queryByText("Track 2")).toBeNull();
            expect(screen.queryByText("Track 3")).toBeNull();
            expect(screen.getByText("artist4")).toBeTruthy();

            const images = Array.from(container.querySelectorAll(".ListCover img")).map((i) => i.getAttribute("src"));
            expect(images).toEqual(["https://example.com/art/1.jpg", "/assets/placeholder-cover-purple.svg"]);
        });

        it("does not search for a blank query and clears the skeleton", async () => {
            const { container } = setup();

            type("   ");
            await flushDebounce();

            expect(mockFetchTrackByQuery).not.toHaveBeenCalled();
            expect(isSkeletonShown(container)).toBe(false);
        });

        it("ignores a stale response that arrives after the query changed", async () => {
            let resolveFirst: (v: unknown) => void = () => {};
            mockFetchTrackByQuery
                .mockImplementationOnce(() => new Promise((r) => (resolveFirst = r)))
                .mockResolvedValueOnce({ data: [makeApiTrack(2)] });
            setup();

            type("first");
            await flushDebounce();
            type("second");
            await flushDebounce();

            await act(async () => {
                resolveFirst({ data: [makeApiTrack(1)] });
            });

            expect(screen.getByText("Track 2")).toBeTruthy();
            expect(screen.queryByText("Track 1")).toBeNull();
        });

        it("shows an error snackbar when the search fails", async () => {
            mockFetchTrackByQuery.mockRejectedValue(new Error("boom"));
            const { container } = setup();

            type("lofi");
            await flushDebounce();

            expect(snackbarText()).toBe("Could not search for tracks.");
            expect(isSkeletonShown(container)).toBe(false);
        });

        it("clicking a result plays it", async () => {
            mockFetchTrackByQuery.mockResolvedValue({ data: [makeApiTrack(7)] });
            const { props } = setup();

            type("x");
            await flushDebounce();
            fireEvent.click(screen.getByText("Track 7").closest("button")!);

            expect(props.onHandleFetch).toHaveBeenCalledWith(7);
        });
    });

    describe("artist search", () => {
        function switchToArtists() {
            fireEvent.change(screen.getByRole("combobox"), { target: { value: "artists" } });
        }

        it("switching type updates the placeholder and shows a snackbar", () => {
            setup();

            switchToArtists();

            expect(input().placeholder).toBe("Search Artists...");
            expect(snackbarText()).toBe("Searching by artists");
        });

        it("searches users and hides artists with no tracks", async () => {
            mockFetchUsers.mockResolvedValue({
                data: [makeApiUser(1), makeApiUser(2, { track_count: 0 }), makeApiUser(3, { profile_picture: null })],
            });
            const { container } = setup();
            switchToArtists();

            type("dj");
            await flushDebounce();

            expect(mockFetchUsers).toHaveBeenCalledWith("dj");
            expect(screen.getByText("Artist 1")).toBeTruthy();
            expect(screen.queryByText("Artist 2")).toBeNull();
            expect(screen.getByText("Artist 3")).toBeTruthy();

            const images = Array.from(container.querySelectorAll(".ListCover img")).map((i) => i.getAttribute("src"));
            expect(images).toContain("/assets/person-placeholder.svg");
        });

        it("shows an error snackbar when the artist search fails", async () => {
            mockFetchUsers.mockRejectedValue(new Error("boom"));
            setup();
            switchToArtists();

            type("dj");
            await flushDebounce();

            expect(snackbarText()).toBe("Could not search for artists.");
        });

        it("clicking an artist replaces the list with their tracks", async () => {
            mockFetchUsers.mockResolvedValue({ data: [makeApiUser(5)] });
            mockFetchTracksByUser.mockResolvedValue({ data: [makeApiTrack(50), makeApiTrack(51)] });
            setup();
            switchToArtists();
            type("dj");
            await flushDebounce();

            await act(async () => {
                fireEvent.click(screen.getByText("Artist 5").closest("button")!);
            });

            expect(mockFetchTracksByUser).toHaveBeenCalledWith(5);
            expect(screen.queryByText("Artist 5")).toBeNull();
            expect(screen.getByText("Track 50")).toBeTruthy();
            expect(screen.getByText("Track 51")).toBeTruthy();
        });

        it("shows an error snackbar when loading an artist's tracks fails", async () => {
            mockFetchUsers.mockResolvedValue({ data: [makeApiUser(5)] });
            mockFetchTracksByUser.mockRejectedValue(new Error("boom"));
            setup();
            switchToArtists();
            type("dj");
            await flushDebounce();

            await act(async () => {
                fireEvent.click(screen.getByText("Artist 5").closest("button")!);
            });

            expect(snackbarText()).toBe("Could not search for tracks by user.");
        });

        it("switching back to tracks clears artist results", async () => {
            mockFetchUsers.mockResolvedValue({ data: [makeApiUser(1)] });
            setup();
            switchToArtists();
            type("dj");
            await flushDebounce();

            fireEvent.change(screen.getByRole("combobox"), { target: { value: "tracks" } });

            expect(screen.queryByText("Artist 1")).toBeNull();
            expect(input().placeholder).toBe("Search Tracks...");
        });
    });
});
