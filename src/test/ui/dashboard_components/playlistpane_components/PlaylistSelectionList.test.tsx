// @vitest-environment jsdom
import { useState, type SetStateAction } from "react";
import { render, cleanup, fireEvent, screen } from "@testing-library/react";
import { describe, it, expect, afterEach, vi, type Mock } from "vitest";
import PlaylistSelectionList from "../../../../ui/dashboard_components/playlistpane_components/PlaylistSelectionList";
import SnackbarProvider from "../../../../hooks/SnackbarContext";
import type { Playlist, PlaylistSelectionProps } from "../../../../utils/types";
import { makePlaylist, makeTrack, makeTracks } from "../../../fixtures";

type HarnessProps = Partial<Omit<PlaylistSelectionProps, "list" | "isSelectedPlaylist" | "onIsSelectedPlaylist" | "onSetPlaylist">> & {
    initial: Playlist[];
    spies: { onSetPlaylist: Mock<(v: SetStateAction<Playlist[]>) => void>; onIsSelectedPlaylist: Mock<(v: SetStateAction<boolean>) => void> };
};

// Holds the playlists and selection state the way PlaylistPane does, so
// navigation into and out of a playlist behaves like the real app.
function Harness({ initial, spies, ...rest }: HarnessProps) {
    const [list, setList] = useState(initial);
    const [isSelected, setIsSelected] = useState(false);

    return (
        <PlaylistSelectionList
            list={list}
            visible={true}
            isSelectedPlaylist={isSelected}
            onIsSelectedPlaylist={(v) => {
                spies.onIsSelectedPlaylist(v);
                setIsSelected(v);
            }}
            onSetPlaylist={(v) => {
                spies.onSetPlaylist(v);
                setList(v);
            }}
            onSetIsPlaylistSelectionVisible={vi.fn()}
            onDeletePlaylist={(entry) => (prev) => prev.filter((p) => p.id !== entry.id)}
            onDeletePlaylistEntry={vi.fn()}
            onHandleFetch={vi.fn().mockResolvedValue(undefined)}
            onIsPlaying={vi.fn()}
            onHandleRenamePlaylist={(id, name) => setList((prev) => prev.map((p) => (p.id === id ? { ...p, name } : p)))}
            onHandleCreatePlaylist={vi.fn()}
            onHandleAddToPlaylist={vi.fn()}
            {...rest}
        />
    );
}

function setup(initial: Playlist[], rest: Partial<HarnessProps> = {}) {
    const spies = { onSetPlaylist: vi.fn(), onIsSelectedPlaylist: vi.fn() };
    const utils = render(<Harness initial={initial} spies={spies} {...rest} />, { wrapper: SnackbarProvider });
    return { ...utils, spies };
}

function snackbarText() {
    return document.getElementById("snackbar")?.textContent;
}

const PLAYLISTS = [
    makePlaylist("a", [makeTrack(1, { duration: 60 }), makeTrack(2, { duration: 90 })], "Chill"),
    makePlaylist("b", [makeTrack(3, { duration: 30 })], "Workout"),
];

describe("PlaylistSelectionList", () => {
    afterEach(() => {
        cleanup();
    });

    describe("folder view", () => {
        it("lists every playlist with its track count and total duration", () => {
            setup(PLAYLISTS);

            expect(screen.getByText("Chill")).toBeTruthy();
            expect(screen.getByText("(2 tracks)")).toBeTruthy();
            expect(screen.getByText("2:30")).toBeTruthy();

            expect(screen.getByText("Workout")).toBeTruthy();
            expect(screen.getByText("(1 tracks)")).toBeTruthy();
            expect(screen.getByText("0:30")).toBeTruthy();
        });

        it("adds the hidden class when not visible", () => {
            const { container } = setup(PLAYLISTS, { visible: false });

            expect(container.querySelector("ul")?.className).toBe("PlaylistPaneFolderList hidden");
        });

        it("deletes a playlist", () => {
            const { spies } = setup(PLAYLISTS);

            fireEvent.click(screen.getAllByLabelText("delete playlist")[0]);

            const updater = spies.onSetPlaylist.mock.calls[0][0] as (prev: Playlist[]) => Playlist[];
            expect(updater(PLAYLISTS)).toEqual([PLAYLISTS[1]]);
            expect(screen.queryByText("Chill")).toBeNull();
        });

        it("keeps empty playlists in the list", () => {
            const onDeletePlaylist = vi.fn((entry: Playlist) => (prev: Playlist[]) => prev.filter((p) => p.id !== entry.id));
            setup([
                makePlaylist("e1", [], "Empty One"),
                makePlaylist("keep", [makeTrack(1)], "Keeper"),
            ], { onDeletePlaylist });

            expect(screen.getByText("Empty One")).toBeTruthy();
            expect(screen.getByText("Keeper")).toBeTruthy();
            expect(onDeletePlaylist).not.toHaveBeenCalled();
        });

        it("Clear removes all playlists and shows a snackbar", () => {
            const { spies } = setup(PLAYLISTS);

            fireEvent.click(screen.getByText("Clear"));

            expect(spies.onSetPlaylist).toHaveBeenCalledWith([]);
            expect(snackbarText()).toBe("All playlists cleared!");
        });

        it("Clear asks to clear a queue started from any of the playlists", () => {
            const onClearQueue = vi.fn();
            setup(PLAYLISTS, { onClearQueue });

            fireEvent.click(screen.getByText("Clear"));

            expect(onClearQueue.mock.calls).toEqual([["a"], ["b"]]);
        });

        it("hides Clear when there are no playlists", () => {
            setup([]);

            expect(screen.getByText("Clear").style.display).toBe("none");
        });

        it("paginates playlists at 10 per page", () => {
            const many = Array.from({ length: 11 }, (_, i) => makePlaylist(`p${i}`, [makeTrack(i + 1)], `List ${i}`));
            setup(many);

            expect(screen.queryByText("List 10")).toBeNull();
            fireEvent.click(screen.getByAltText("next").closest("button")!);
            expect(screen.getByText("List 10")).toBeTruthy();
        });
    });

    describe("creating a playlist", () => {
        it("the plus button opens an empty name menu", () => {
            setup(PLAYLISTS);

            fireEvent.click(screen.getByLabelText("create playlist"));

            expect((document.querySelector(".PlaylistMenu.OpensDown") as HTMLElement).classList.contains("hidden")).toBe(false);
            expect((screen.getByPlaceholderText("Playlist name") as HTMLInputElement).value).toBe("");
        });

        it("creates a playlist with the trimmed name", () => {
            const onHandleCreatePlaylist = vi.fn();
            setup(PLAYLISTS, { onHandleCreatePlaylist });
            fireEvent.click(screen.getByLabelText("create playlist"));

            fireEvent.change(screen.getByPlaceholderText("Playlist name"), { target: { value: "  Road Trip  " } });
            fireEvent.click(document.querySelector(".PlaylistMenu.OpensDown button") as HTMLButtonElement);

            expect(onHandleCreatePlaylist).toHaveBeenCalledWith("Road Trip");
        });
    });

    describe("renaming a playlist", () => {
        function openRenameMenu(name: string) {
            fireEvent.click(screen.getByText(name).closest("button")!);
            fireEvent.click(screen.getByLabelText("rename playlist"));
        }

        function menu() {
            return document.querySelector(".PlaylistMenu.OpensDown") as HTMLElement;
        }

        function input() {
            return screen.getByPlaceholderText("Playlist name") as HTMLInputElement;
        }

        function saveButton() {
            return menu().querySelector("button") as HTMLButtonElement;
        }

        it("the pencil button opens and closes the rename menu", () => {
            setup(PLAYLISTS);

            openRenameMenu("Chill");
            expect(menu().classList.contains("hidden")).toBe(false);

            fireEvent.click(screen.getByLabelText("rename playlist"));
            expect(menu().classList.contains("hidden")).toBe(true);
        });

        it("saves the trimmed name for the open playlist", () => {
            const onHandleRenamePlaylist = vi.fn();
            setup(PLAYLISTS, { onHandleRenamePlaylist });
            openRenameMenu("Chill");

            fireEvent.change(input(), { target: { value: "  Late Night  " } });
            fireEvent.click(saveButton());

            expect(onHandleRenamePlaylist).toHaveBeenCalledWith("a", "Late Night");
        });

        it("shows the new name once saved", () => {
            setup(PLAYLISTS);
            openRenameMenu("Chill");

            fireEvent.change(input(), { target: { value: "Late Night" } });
            fireEvent.click(saveButton());

            expect(screen.getByRole("heading", { level: 2 }).textContent).toBe("Late Night");
        });

        it("cannot save an empty or blank name", () => {
            setup(PLAYLISTS);
            openRenameMenu("Chill");

            fireEvent.change(input(), { target: { value: "" } });
            expect(saveButton().disabled).toBe(true);

            fireEvent.change(input(), { target: { value: "   " } });
            expect(saveButton().disabled).toBe(true);
        });

        it("stays open while clicking inside it", () => {
            setup(PLAYLISTS);
            openRenameMenu("Chill");

            fireEvent.mouseDown(input());

            expect(menu().classList.contains("hidden")).toBe(false);
        });

        it("closes when clicking outside it", () => {
            setup(PLAYLISTS);
            openRenameMenu("Chill");

            fireEvent.mouseDown(document.body);

            expect(menu().classList.contains("hidden")).toBe(true);
        });

        it("opens with the playlist's current name, even after typing something else last time", () => {
            setup(PLAYLISTS);
            openRenameMenu("Chill");
            expect(input().value).toBe("Chill");

            fireEvent.change(input(), { target: { value: "Late Night" } });
            fireEvent.mouseDown(document.body);
            fireEvent.click(screen.getByLabelText("rename playlist"));

            expect(input().value).toBe("Chill");
        });
    });

    describe("opening a playlist", () => {
        function open(name: string) {
            fireEvent.click(screen.getByText(name).closest("button")!);
        }

        it("switches to the track view showing the playlist name and its tracks", () => {
            const onSetIsPlaylistSelectionVisible = vi.fn();
            const { spies } = setup(PLAYLISTS, { onSetIsPlaylistSelectionVisible });

            open("Chill");

            expect(spies.onIsSelectedPlaylist).toHaveBeenCalledWith(true);
            expect(onSetIsPlaylistSelectionVisible).toHaveBeenCalledWith(false);
            expect(screen.getByRole("heading", { level: 2 }).textContent).toBe("Chill");
            expect(screen.getByText("Track 1")).toBeTruthy();
            expect(screen.getByText("Track 2")).toBeTruthy();
            expect(screen.queryByText("Track 3")).toBeNull();
        });

        it("tracks have a favorite button and a more actions menu with a remove option", () => {
            setup([makePlaylist("x", [makeTrack(9)], "Solo")]);
            open("Solo");

            expect(screen.getByLabelText("Add to Favorites")).toBeTruthy();
            fireEvent.click(screen.getByLabelText("More actions for Track 9"));
            expect(screen.getByText("Remove")).toBeTruthy();
        });

        it("playing a track queues that playlist's tracks", () => {
            const onHandleFetch = vi.fn().mockResolvedValue(undefined);
            const onSetTrackQueue = vi.fn();
            const onSetCurrentTrackIndex = vi.fn();
            setup(PLAYLISTS, { onHandleFetch, onSetTrackQueue, onSetCurrentTrackIndex });
            open("Chill");

            fireEvent.click(screen.getByText("Track 2").closest("button")!);

            expect(onHandleFetch).toHaveBeenCalledWith(2);
            expect(onSetCurrentTrackIndex).toHaveBeenCalledWith(1);
            expect(onSetTrackQueue).toHaveBeenCalledWith(PLAYLISTS[0].tracks);
        });

        it("deleting a track calls onDeletePlaylistEntry with the playlist id", () => {
            const onDeletePlaylistEntry = vi.fn();
            setup(PLAYLISTS, { onDeletePlaylistEntry });
            open("Workout");

            fireEvent.click(screen.getByLabelText("More actions for Track 3"));
            fireEvent.click(screen.getByText("Remove"));

            expect(onDeletePlaylistEntry).toHaveBeenCalledWith("b", PLAYLISTS[1].tracks[0]);
        });

        it("Clear empties only the open playlist", () => {
            const { spies } = setup(PLAYLISTS);
            open("Chill");

            fireEvent.click(screen.getByText("Clear"));

            const updater = spies.onSetPlaylist.mock.calls[0][0] as (prev: Playlist[]) => Playlist[];
            expect(updater(PLAYLISTS)).toEqual([{ ...PLAYLISTS[0], tracks: [] }, PLAYLISTS[1]]);
            expect(snackbarText()).toBe("Playlist cleared!");
        });

        it("Clear asks to clear a queue started from the open playlist only", () => {
            const onClearQueue = vi.fn();
            setup(PLAYLISTS, { onClearQueue });
            open("Chill");

            fireEvent.click(screen.getByText("Clear"));

            expect(onClearQueue.mock.calls).toEqual([["a"]]);
        });

        it("paginates tracks inside a playlist", () => {
            setup([makePlaylist("big", makeTracks(12), "Big")]);
            open("Big");

            expect(screen.queryByText("Track 11")).toBeNull();
            fireEvent.click(screen.getByAltText("next").closest("button")!);
            expect(screen.getByText("Track 11")).toBeTruthy();
        });
    });
});
