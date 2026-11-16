// @vitest-environment jsdom
import { render, cleanup, fireEvent, screen, act, within } from "@testing-library/react";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import Dashboard from "../../ui/Dashboard";
import SnackbarProvider from "../../hooks/SnackbarContext";
import { makeApiTrack, makePlaylist, makeTrack, makeTracks } from "../fixtures";
import { fetchTrackById, fetchTrackLatest, fetchTrackTrending } from "../../utils/data";
import type { Playlist, TrackObject } from "../../utils/types";

vi.mock("../../utils/data", () => ({
    fetchTrackById: vi.fn(),
    fetchTrackTrending: vi.fn(),
    fetchTrackLatest: vi.fn(),
    fetchTrackByQuery: vi.fn(),
    fetchUsers: vi.fn(),
    fetchTracksByUser: vi.fn(),
}));

// Web Audio / canvas are covered by Visualizer's own tests.
vi.mock("../../ui/dashboard_components/audioplayer_components/Visualizer", () => ({ default: () => null }));

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
            // playlists need a track, since empty playlists are deleted automatically
            localStorage.setItem("user_playlists", JSON.stringify([makePlaylist("p1", [makeTrack(9)], "Chill")]));
            render_();
            await flushInitialFetch();
            await playFromTrending("Track 2");
            openPlaylistMenu();

            fireEvent.click(within(mainPlayer()).getByText("Chill"));
            fireEvent.click(within(mainPlayer()).getByText("Chill"));

            expect(stored<Playlist[]>("user_playlists")[0].tracks.map((t) => t.track_id)).toEqual([9, 2]);
        });

        it("does not change other playlists when adding a track", async () => {
            const other = makePlaylist("p2", [makeTrack(9)], "Other");
            localStorage.setItem("user_playlists", JSON.stringify([makePlaylist("p1", [makeTrack(8)], "Chill"), other]));
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
                JSON.stringify([makePlaylist("p1", [makeTrack(1)], "Keep"), makePlaylist("p2", [makeTrack(2)], "Drop")]),
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

    describe("deleting queued tracks", () => {
        // Favorites and trending both hold tracks 1-4, so the same tracks can be queued from either list.
        beforeEach(() => {
            localStorage.setItem("favorite_tracks", JSON.stringify(makeTracks(4)));
            mockFetchTrending.mockResolvedValue({ data: [1, 2, 3, 4].map((id) => makeApiTrack(id)) });
        });

        function upNextTitles() {
            return Array.from(document.querySelectorAll(".UpNextTitle")).map((title) => title.textContent);
        }

        // The row for a track in whichever playlist pane list is currently shown.
        function shownRow(title: string) {
            const element = playlistPane()
                .getAllByText(title)
                .find((el) => !el.closest("ul.hidden") && el.closest("ul")?.style.display !== "none");
            return element?.closest(".ListRow") as HTMLElement;
        }

        async function playFromPane(title: string) {
            await act(async () => {
                fireEvent.click(within(shownRow(title)).getAllByRole("button")[0]);
            });
        }

        function deleteFromPane(title: string) {
            fireEvent.click(within(shownRow(title)).getByLabelText("Delete Entry"));
        }

        async function endTrack() {
            await act(async () => {
                fireEvent.ended(document.querySelector("audio") as HTMLAudioElement);
            });
        }

        function nowPlaying() {
            return within(mainPlayer()).getByRole("heading", { level: 2 }).textContent?.trim();
        }

        async function playFromFavorites(title: string) {
            render_();
            await flushInitialFetch();
            fireEvent.click(screen.getByText("Favorites"));
            await playFromPane(title);
        }

        function enableShuffle() {
            // Sort keys for the non-playing tracks [2, 3, 4] → shuffled order [1, 4, 3, 2].
            vi.spyOn(Math, "random").mockReturnValueOnce(0.9).mockReturnValueOnce(0.5).mockReturnValueOnce(0.1);
            fireEvent.click(within(mainPlayer()).getByRole("button", { name: "Shuffle Off" }));
        }

        it("deleting an upcoming track removes it from up next and from playback", async () => {
            await playFromFavorites("Track 2");
            expect(upNextTitles()).toEqual(["Track 3", "Track 4"]);

            deleteFromPane("Track 3");
            expect(upNextTitles()).toEqual(["Track 4"]);

            await endTrack();
            expect(mockFetchTrackById).toHaveBeenLastCalledWith(4);
        });

        it("deleting a track before the playing one keeps playback on course", async () => {
            await playFromFavorites("Track 2");

            deleteFromPane("Track 1");
            expect(upNextTitles()).toEqual(["Track 3", "Track 4"]);

            await endTrack();
            expect(mockFetchTrackById).toHaveBeenLastCalledWith(3);
        });

        it("deleting the playing track lets it finish, then continues with the track after it", async () => {
            await playFromFavorites("Track 2");

            deleteFromPane("Track 2");
            expect(nowPlaying()).toBe("Track 2");
            expect(upNextTitles()).toEqual(["Track 3", "Track 4"]);

            await endTrack();
            expect(mockFetchTrackById).toHaveBeenLastCalledWith(3);
        });

        it("deleting the first track while it plays still continues with the next one", async () => {
            await playFromFavorites("Track 1");

            deleteFromPane("Track 1");
            expect(upNextTitles()).toEqual(["Track 2", "Track 3", "Track 4"]);

            await endTrack();
            expect(mockFetchTrackById).toHaveBeenLastCalledWith(2);
        });

        it("does not touch a queue started from a different list", async () => {
            render_();
            await flushInitialFetch();
            await playFromTrending("Track 1");

            fireEvent.click(screen.getByText("Favorites"));
            deleteFromPane("Track 3");

            expect(upNextTitles()).toEqual(["Track 2", "Track 3", "Track 4"]);
        });

        it("deleting from Recents does not touch a queue started from Favorites", async () => {
            await playFromFavorites("Track 1");
            await endTrack(); // Track 2 now plays, so Recents holds tracks 1 and 2

            fireEvent.click(screen.getByText("Recents"));
            deleteFromPane("Track 1");

            expect(upNextTitles()).toEqual(["Track 3", "Track 4"]);
        });

        it("deleting from a playlist updates a queue started from that playlist", async () => {
            localStorage.setItem("user_playlists", JSON.stringify([makePlaylist("p1", makeTracks(3), "Chill")]));
            render_();
            await flushInitialFetch();
            fireEvent.click(screen.getByText("Playlists"));
            fireEvent.click(playlistPane().getByText("Chill").closest("button")!);
            await playFromPane("Track 1");

            deleteFromPane("Track 2");

            expect(upNextTitles()).toEqual(["Track 3"]);
        });

        describe("clearing a list", () => {
            // Every list has a Clear button; only the open tab's is displayed.
            function clickShownClear() {
                fireEvent.click(playlistPane().getAllByText("Clear").find((button) => button.style.display !== "none")!);
            }

            it("clearing Favorites empties a queue started from Favorites, and the playing track finishes", async () => {
                await playFromFavorites("Track 2");
                const fetches = mockFetchTrackById.mock.calls.length;

                clickShownClear();

                expect(upNextTitles()).toEqual([]);
                expect(nowPlaying()).toBe("Track 2");

                await endTrack();
                expect(mockFetchTrackById).toHaveBeenCalledTimes(fetches);
            });

            it("clearing Favorites leaves a queue started from another list alone", async () => {
                render_();
                await flushInitialFetch();
                await playFromTrending("Track 1");

                fireEvent.click(screen.getByText("Favorites"));
                clickShownClear();

                expect(upNextTitles()).toEqual(["Track 2", "Track 3", "Track 4"]);
            });

            it("clearing Recents empties a queue started from Recents", async () => {
                localStorage.setItem("recent_tracks", JSON.stringify(makeTracks(3)));
                render_();
                await flushInitialFetch();
                fireEvent.click(screen.getByText("Recents"));
                await playFromPane("Track 1");

                clickShownClear();

                expect(upNextTitles()).toEqual([]);
            });

            describe("playlists", () => {
                beforeEach(() => {
                    localStorage.setItem(
                        "user_playlists",
                        JSON.stringify([makePlaylist("p1", makeTracks(3), "Chill"), makePlaylist("p2", makeTracks(2), "Gym")]),
                    );
                });

                async function playFromPlaylist(name: string, title: string) {
                    render_();
                    await flushInitialFetch();
                    fireEvent.click(screen.getByText("Playlists"));
                    fireEvent.click(playlistPane().getByText(name).closest("button")!);
                    await playFromPane(title);
                }

                it("clearing the open playlist empties a queue started from it", async () => {
                    await playFromPlaylist("Chill", "Track 1");

                    clickShownClear();

                    expect(upNextTitles()).toEqual([]);
                });

                it("deleting a playlist empties a queue started from it", async () => {
                    await playFromPlaylist("Chill", "Track 1");
                    fireEvent.click(screen.getByText("< Back"));

                    const row = playlistPane().getByText("Chill").closest(".ListRow") as HTMLElement;
                    fireEvent.click(within(row).getByLabelText("delete playlist"));

                    expect(upNextTitles()).toEqual([]);
                });

                it("deleting a different playlist leaves the queue alone", async () => {
                    await playFromPlaylist("Chill", "Track 1");
                    fireEvent.click(screen.getByText("< Back"));

                    const row = playlistPane().getByText("Gym").closest(".ListRow") as HTMLElement;
                    fireEvent.click(within(row).getByLabelText("delete playlist"));

                    expect(upNextTitles()).toEqual(["Track 2", "Track 3"]);
                });

                it("clearing all playlists empties a queue started from any of them", async () => {
                    await playFromPlaylist("Gym", "Track 1");
                    fireEvent.click(screen.getByText("< Back"));

                    clickShownClear();

                    expect(upNextTitles()).toEqual([]);
                });
            });

            it("clearing while shuffled empties the queue, and it stays empty after turning shuffle off", async () => {
                await playFromFavorites("Track 1");
                enableShuffle();

                clickShownClear();
                expect(upNextTitles()).toEqual([]);

                fireEvent.click(within(mainPlayer()).getByRole("button", { name: "Shuffle On" }));
                expect(upNextTitles()).toEqual([]);
            });
        });

        describe("while shuffled", () => {
            it("keeps the shuffled order and the playing track", async () => {
                await playFromFavorites("Track 1");
                enableShuffle();
                expect(upNextTitles()).toEqual(["Track 4", "Track 3", "Track 2"]);

                deleteFromPane("Track 3");
                expect(upNextTitles()).toEqual(["Track 4", "Track 2"]);

                await endTrack();
                expect(mockFetchTrackById).toHaveBeenLastCalledWith(4);
            });

            it("a deleted track stays deleted after turning shuffle off", async () => {
                await playFromFavorites("Track 1");
                enableShuffle();
                deleteFromPane("Track 3");

                fireEvent.click(within(mainPlayer()).getByRole("button", { name: "Shuffle On" }));

                expect(upNextTitles()).toEqual(["Track 2", "Track 4"]);
            });

            it("deleting from an unrelated list does not reshuffle", async () => {
                render_();
                await flushInitialFetch();
                await playFromTrending("Track 1");
                enableShuffle();

                fireEvent.click(screen.getByText("Favorites"));
                deleteFromPane("Track 3");

                expect(upNextTitles()).toEqual(["Track 4", "Track 3", "Track 2"]);
            });
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
