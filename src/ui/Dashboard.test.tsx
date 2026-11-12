// @vitest-environment jsdom
import { render, cleanup, fireEvent, screen, act, within } from "@testing-library/react";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import Dashboard from "./Dashboard";
import SnackbarProvider from "../hooks/SnackbarContext";
import { makeApiTrack, makePlaylist, makeTrack, makeTracks } from "../test/fixtures";
import { fetchTrackById, fetchTrackLatest, fetchTrackTrending } from "../utils/data";
import type { Playlist, TrackObject } from "../utils/types";

vi.mock("../utils/data", () => ({
    fetchTrackById: vi.fn(),
    fetchTrackTrending: vi.fn(),
    fetchTrackLatest: vi.fn(),
    fetchTrackByQuery: vi.fn(),
    fetchUsers: vi.fn(),
    fetchTracksByUser: vi.fn(),
}));

// Web Audio / canvas are covered by Visualizer's own tests.
vi.mock("./dashboard_components/audioplayer_components/Visualizer", () => ({ default: () => null }));

const mockFetchTrackById = vi.mocked(fetchTrackById);
const mockFetchTrending = vi.mocked(fetchTrackTrending);
const mockFetchLatest = vi.mocked(fetchTrackLatest);

const INITIAL_FETCH_DELAY_MS = 600;

function render_() {
    return render(<Dashboard />, { wrapper: SnackbarProvider });
}

async function flushInitialFetch() {
    await act(async () => {
        await vi.advanceTimersByTimeAsync(INITIAL_FETCH_DELAY_MS);
    });
}

function snackbarText() {
    return document.getElementById("snackbar")?.textContent;
}

function stored<T>(key: string): T {
    return JSON.parse(localStorage.getItem(key) ?? "null");
}

function trackFromApi(id: number) {
    return { data: makeApiTrack(id) };
}

function sectionFor(heading: string) {
    return screen.getByRole("heading", { level: 1, name: heading }).closest(".ExtraListPane") as HTMLElement;
}

async function playFromTrending(title: string) {
    await act(async () => {
        fireEvent.click(within(sectionFor("Trending Tracks (Top 100)")).getByText(title).closest("button")!);
    });
}

function playlistPane() {
    return within(document.querySelector(".PlaylistPane") as HTMLElement);
}

function mainPlayer() {
    return document.querySelector(".AudioPlayer") as HTMLElement;
}

describe("Dashboard", () => {
    beforeEach(() => {
        vi.useFakeTimers();
        localStorage.clear();
        mockFetchTrackById.mockReset();
        mockFetchTrending.mockReset().mockResolvedValue({ data: [makeApiTrack(1), makeApiTrack(2)] });
        mockFetchLatest.mockReset().mockResolvedValue({ data: [makeApiTrack(3)] });
        mockFetchTrackById.mockImplementation(async (id: number) => trackFromApi(id));

        vi.spyOn(console, "error").mockImplementation(() => {});
        vi.spyOn(console, "log").mockImplementation(() => {});
        // jsdom has no media playback.
        vi.spyOn(HTMLMediaElement.prototype, "play").mockResolvedValue(undefined);
        vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(() => {});
    });

    afterEach(() => {
        cleanup();
        vi.useRealTimers();
        vi.restoreAllMocks();
    });

    describe("trending and latest", () => {
        it("shows skeletons until the delayed fetch completes", async () => {
            const { container } = render_();

            expect(container.querySelectorAll(".skeleton-heading")).toHaveLength(2);
            expect(mockFetchTrending).not.toHaveBeenCalled();

            await flushInitialFetch();

            expect(mockFetchTrending).toHaveBeenCalledTimes(1);
            expect(mockFetchLatest).toHaveBeenCalledTimes(1);
            expect(container.querySelectorAll(".skeleton-heading")).toHaveLength(0);
            expect(within(sectionFor("Trending Tracks (Top 100)")).getByText("Track 1")).toBeTruthy();
            expect(within(sectionFor("Latest Tracks")).getByText("Track 3")).toBeTruthy();
        });

        it("filters out tracks without a stream URL and defaults missing artwork", async () => {
            mockFetchTrending.mockResolvedValue({
                data: [makeApiTrack(1, { artwork: null }), makeApiTrack(2, { stream: {} })],
            });
            render_();
            await flushInitialFetch();

            const trending = sectionFor("Trending Tracks (Top 100)");
            expect(within(trending).getByText("Track 1")).toBeTruthy();
            expect(within(trending).queryByText("Track 2")).toBeNull();
            expect(trending.querySelector(".ListCover img")?.getAttribute("src")).toBe(
                "/assets/placeholder-cover-purple.svg",
            );
        });

        it("keeps a skeleton and shows a snackbar when one feed fails", async () => {
            mockFetchTrending.mockRejectedValue(new Error("down"));
            const { container } = render_();

            await flushInitialFetch();

            expect(snackbarText()).toBe("Failed to fetch trending tracks.");
            expect(container.querySelectorAll(".skeleton-heading")).toHaveLength(1);
            expect(within(sectionFor("Latest Tracks")).getByText("Track 3")).toBeTruthy();
        });

        it("reports a latest-feed failure", async () => {
            mockFetchLatest.mockRejectedValue(new Error("down"));
            render_();

            await flushInitialFetch();

            expect(snackbarText()).toBe("Failed to fetch latest tracks.");
        });

        it("does not fetch if unmounted before the delay elapses", async () => {
            const { unmount } = render_();

            unmount();
            await act(async () => {
                await vi.advanceTimersByTimeAsync(INITIAL_FETCH_DELAY_MS);
            });

            expect(mockFetchTrending).not.toHaveBeenCalled();
        });
    });

    describe("playing a track", () => {
        it("loads the track into the player and announces it", async () => {
            render_();
            await flushInitialFetch();

            await playFromTrending("Track 2");

            expect(mockFetchTrackById).toHaveBeenCalledWith(2);
            expect(within(mainPlayer()).getByRole("heading", { level: 2 }).textContent?.trim()).toBe("Track 2");
            expect(document.querySelector("audio")?.getAttribute("src")).toBe("https://example.com/stream/2");
            expect(snackbarText()).toBe("Now playing:\nTrack 2\nartist2");
        });

        it("adds the track to the front of recents without duplicates", async () => {
            render_();
            await flushInitialFetch();

            await playFromTrending("Track 1");
            await playFromTrending("Track 2");
            await playFromTrending("Track 1");

            expect(stored<TrackObject[]>("recent_tracks").map((t) => t.track_id)).toEqual([1, 2]);
        });

        it("caps recents at 50 entries", async () => {
            localStorage.setItem("recent_tracks", JSON.stringify(makeTracks(50, 100)));
            render_();
            await flushInitialFetch();

            await playFromTrending("Track 1");

            const recents = stored<TrackObject[]>("recent_tracks");
            expect(recents).toHaveLength(50);
            expect(recents[0].track_id).toBe(1);
            expect(recents.some((t) => t.track_id === 149)).toBe(false);
        });

        it("shows an error snackbar when the track fails to load", async () => {
            mockFetchTrackById.mockRejectedValue(new Error("404"));
            render_();
            await flushInitialFetch();

            await playFromTrending("Track 1");

            expect(snackbarText()).toBe("Error loading track!");
            expect(localStorage.getItem("recent_tracks")).toBe("[]");
        });
    });

    describe("favorites", () => {
        async function toggleFavoriteOfCurrent() {
            await act(async () => {
                fireEvent.click(within(mainPlayer()).getByLabelText("favorite"));
            });
        }

        it("adds and removes the current track", async () => {
            render_();
            await flushInitialFetch();
            await playFromTrending("Track 1");

            await toggleFavoriteOfCurrent();
            expect(stored<TrackObject[]>("favorite_tracks").map((t) => t.track_id)).toEqual([1]);
            expect(snackbarText()).toBe("Added track to favorites!");
            expect(within(mainPlayer()).getByLabelText("favorite").querySelector("img")?.getAttribute("src")).toBe(
                "/assets/favorite_icons/favorited.svg",
            );

            await toggleFavoriteOfCurrent();
            expect(stored<TrackObject[]>("favorite_tracks")).toEqual([]);
            expect(snackbarText()).toBe("Removed track from favorites!");
        });

        it("loads persisted favorites into the Favorites tab", () => {
            localStorage.setItem("favorite_tracks", JSON.stringify([makeTrack(77)]));
            render_();

            fireEvent.click(screen.getByText("Favorites"));

            const list = screen.getByText("Track 77").closest("ul") as HTMLElement;
            expect(list.className).toBe("PlaylistPaneList");
        });

        it("deleting a favorite from the list removes it and shows a snackbar", () => {
            localStorage.setItem("favorite_tracks", JSON.stringify([makeTrack(1), makeTrack(2)]));
            render_();
            fireEvent.click(screen.getByText("Favorites"));

            const row = screen.getByText("Track 1").closest(".ListRow") as HTMLElement;
            fireEvent.click(within(row).getByLabelText("Delete Entry"));

            expect(stored<TrackObject[]>("favorite_tracks").map((t) => t.track_id)).toEqual([2]);
            expect(snackbarText()).toBe("Removed track from list.");
        });
    });

    describe("playlists", () => {
        function openPlaylistMenu() {
            fireEvent.click(within(mainPlayer()).getByLabelText("playlist"));
        }

        it("creates a playlist from the current track with a trimmed name", async () => {
            render_();
            await flushInitialFetch();
            await playFromTrending("Track 1");
            openPlaylistMenu();

            fireEvent.change(within(mainPlayer()).getByPlaceholderText("Playlist"), { target: { value: "  Mix  " } });
            fireEvent.click(within(mainPlayer()).getByText("+"));

            const playlists = stored<Playlist[]>("user_playlists");
            expect(playlists).toHaveLength(1);
            expect(playlists[0].name).toBe("Mix");
            expect(playlists[0].tracks.map((t) => t.track_id)).toEqual([1]);
            expect(typeof playlists[0].id).toBe("string");
        });

        it("adds the current track to an existing playlist only once", async () => {
            localStorage.setItem("user_playlists", JSON.stringify([makePlaylist("p1", [], "Chill")]));
            render_();
            await flushInitialFetch();
            await playFromTrending("Track 2");
            openPlaylistMenu();

            fireEvent.click(within(mainPlayer()).getByText("Chill"));
            fireEvent.click(within(mainPlayer()).getByText("Chill"));

            expect(stored<Playlist[]>("user_playlists")[0].tracks.map((t) => t.track_id)).toEqual([2]);
        });

        it("does not change other playlists when adding a track", async () => {
            const other = makePlaylist("p2", [makeTrack(9)], "Other");
            localStorage.setItem("user_playlists", JSON.stringify([makePlaylist("p1", [], "Chill"), other]));
            render_();
            await flushInitialFetch();
            await playFromTrending("Track 1");
            openPlaylistMenu();

            fireEvent.click(within(mainPlayer()).getByText("Chill"));

            expect(stored<Playlist[]>("user_playlists")[1]).toEqual(other);
        });

        it("deletes a playlist", () => {
            localStorage.setItem(
                "user_playlists",
                JSON.stringify([makePlaylist("p1", [], "Keep"), makePlaylist("p2", [], "Drop")]),
            );
            render_();
            fireEvent.click(screen.getByText("Playlists"));

            const row = playlistPane().getByText("Drop").closest(".ListRow") as HTMLElement;
            fireEvent.click(within(row).getByLabelText("delete playlist"));

            expect(stored<Playlist[]>("user_playlists").map((p) => p.name)).toEqual(["Keep"]);
            expect(snackbarText()).toBe("Removed playlist.");
        });

        it("removes a track from inside a playlist", () => {
            localStorage.setItem(
                "user_playlists",
                JSON.stringify([makePlaylist("p1", [makeTrack(1), makeTrack(2)], "Chill")]),
            );
            render_();
            fireEvent.click(screen.getByText("Playlists"));
            fireEvent.click(playlistPane().getByText("Chill").closest("button")!);

            const row = playlistPane().getByText("Track 1").closest(".ListRow") as HTMLElement;
            fireEvent.click(within(row).getByLabelText("Delete Entry"));

            expect(stored<Playlist[]>("user_playlists")[0].tracks.map((t) => t.track_id)).toEqual([2]);
            expect(snackbarText()).toBe("Removed track from playlist.");
        });
    });

    describe("connectivity", () => {
        it("shows a persistent offline notice when starting offline", () => {
            vi.spyOn(navigator, "onLine", "get").mockReturnValue(false);
            render_();

            expect(snackbarText()).toBe("You are offline!\nConnect to a network.");
            act(() => vi.advanceTimersByTime(60_000));
            expect(document.getElementById("snackbar")?.className).toBe("show");
        });

        it("reacts to going offline and back online", () => {
            render_();

            act(() => {
                window.dispatchEvent(new Event("offline"));
            });
            expect(document.getElementById("snackbar")?.className).toBe("show");
            expect(snackbarText()).toBe("You are offline!\nConnect to a network.");

            act(() => {
                window.dispatchEvent(new Event("online"));
            });
            expect(document.getElementById("snackbar")?.className).toBe("");
        });
    });
});
