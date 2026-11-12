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
            onDeletePlaylist={(entry) => list.filter((p) => p.id !== entry.id)}
            onDeletePlaylistEntry={vi.fn()}
            onHandleFetch={vi.fn().mockResolvedValue(undefined)}
            onIsPlaying={vi.fn()}
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

            expect(spies.onSetPlaylist).toHaveBeenCalledWith([PLAYLISTS[1]]);
            expect(screen.queryByText("Chill")).toBeNull();
        });

        it("Clear removes all playlists and shows a snackbar", () => {
            const { spies } = setup(PLAYLISTS);

            fireEvent.click(screen.getByText("Clear"));

            expect(spies.onSetPlaylist).toHaveBeenCalledWith([]);
            expect(snackbarText()).toBe("All playlists cleared!");
        });

        it("hides Clear when there are no playlists", () => {
            setup([]);

            expect(screen.getByText("Clear").style.display).toBe("none");
        });

        it("paginates playlists at 10 per page", () => {
            const many = Array.from({ length: 11 }, (_, i) => makePlaylist(`p${i}`, [], `List ${i}`));
            setup(many);

            expect(screen.queryByText("List 10")).toBeNull();
            fireEvent.click(screen.getByAltText("next").closest("button")!);
            expect(screen.getByText("List 10")).toBeTruthy();
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

        it("tracks have favorite and delete buttons", () => {
            setup([makePlaylist("x", [makeTrack(9)], "Solo")]);
            open("Solo");

            expect(screen.getByLabelText("Add to Favorites")).toBeTruthy();
            expect(screen.getByLabelText("Delete Entry")).toBeTruthy();
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

            fireEvent.click(screen.getByLabelText("Delete Entry"));

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

        it("paginates tracks inside a playlist", () => {
            setup([makePlaylist("big", makeTracks(12), "Big")]);
            open("Big");

            expect(screen.queryByText("Track 11")).toBeNull();
            fireEvent.click(screen.getByAltText("next").closest("button")!);
            expect(screen.getByText("Track 11")).toBeTruthy();
        });
    });
});
