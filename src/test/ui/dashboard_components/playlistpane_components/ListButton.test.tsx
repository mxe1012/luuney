// @vitest-environment jsdom
import { render, cleanup, fireEvent, screen } from "@testing-library/react";
import { describe, it, expect, afterEach, vi } from "vitest";
import ListButton from "../../../../ui/dashboard_components/playlistpane_components/ListButton";
import SnackbarProvider from "../../../../hooks/SnackbarContext";
import type { ListButtonProps } from "../../../../utils/types";
import { makePlaylist, makeTrack, makeTracks } from "../../../fixtures";

function setup(overrides: Partial<ListButtonProps> = {}) {
    const list = makeTracks(3);
    const props: ListButtonProps = {
        list,
        track: list[1],
        index: 1,
        onHandleFetch: vi.fn().mockResolvedValue(undefined),
        onIsPlaying: vi.fn(),
        hasDeleteButton: false,
        hasFavoriteButton: false,
        playlists: [],
        onHandleAddToPlaylist: vi.fn(),
        onHandleCreatePlaylist: vi.fn(),
        ...overrides,
    };
    const utils = render(<ListButton {...props} />, { wrapper: SnackbarProvider });
    return { ...utils, props };
}

function openActionMenu() {
    fireEvent.click(screen.getByLabelText("More actions for Track 2"));
}

function actionMenu() {
    return document.querySelector(".PlaylistMenu.Floating") as HTMLElement | null;
}

function mainButton() {
    return screen.getByText("Track 2").closest("button") as HTMLButtonElement;
}

describe("ListButton", () => {
    afterEach(() => {
        cleanup();
        vi.restoreAllMocks();
    });

    it("shows the track title, artist handle and formatted duration", () => {
        setup({ track: makeTrack(2, { duration: 125 }) });

        expect(screen.getByText("Track 2")).toBeTruthy();
        expect(screen.getByText("artist2")).toBeTruthy();
        expect(screen.getByText("2:05")).toBeTruthy();
    });

    it("plays the track and queues the whole list when clicked", () => {
        const onSetTrackQueue = vi.fn();
        const onSetCurrentTrackIndex = vi.fn();
        const { props } = setup({ onSetTrackQueue, onSetCurrentTrackIndex });

        fireEvent.click(mainButton());

        expect(props.onHandleFetch).toHaveBeenCalledWith(2);
        expect(props.onIsPlaying).toHaveBeenCalledWith(false);
        expect(onSetCurrentTrackIndex).toHaveBeenCalledWith(1);
        // The list itself is passed so Dashboard can tell which list the queue came from.
        expect(onSetTrackQueue.mock.calls[0][0]).toBe(props.list);
    });

    it("works without the optional queue callbacks", () => {
        const { props } = setup();

        expect(() => fireEvent.click(mainButton())).not.toThrow();
        expect(props.onHandleFetch).toHaveBeenCalledWith(2);
    });

    it("hides the favorite button and the menu's remove option when disabled", () => {
        setup({ hasDeleteButton: false, hasFavoriteButton: false });
        openActionMenu();

        expect(screen.queryByLabelText(/Favorites/)).toBeNull();
        expect(screen.queryByText("Remove")).toBeNull();
    });

    describe("favorite button", () => {
        it("shows 'Add to Favorites' when the track is not favorited", () => {
            setup({ hasFavoriteButton: true, isFavorited: () => false });

            const button = screen.getByLabelText("Add to Favorites");
            expect(button.querySelector("img")?.getAttribute("src")).toBe("/assets/favorite_icons/not_favorited.svg");
        });

        it("shows 'Remove from Favorites' when the track is favorited", () => {
            setup({ hasFavoriteButton: true, isFavorited: () => true });

            const button = screen.getByLabelText("Remove from Favorites");
            expect(button.querySelector("img")?.getAttribute("src")).toBe("/assets/favorite_icons/favorited.svg");
        });

        it("toggles the favorite without starting playback", () => {
            const onAddToFavorites = vi.fn();
            const { props } = setup({ hasFavoriteButton: true, isFavorited: () => false, onAddToFavorites });

            fireEvent.click(screen.getByLabelText("Add to Favorites"));

            expect(onAddToFavorites).toHaveBeenCalledWith(props.track);
            expect(props.onHandleFetch).not.toHaveBeenCalled();
        });
    });

    describe("more actions menu", () => {
        it("opens and closes from the more actions button without starting playback", () => {
            const { props } = setup();
            const button = screen.getByLabelText("More actions for Track 2");

            fireEvent.click(button);
            expect(actionMenu()).not.toBeNull();
            expect(button.getAttribute("aria-expanded")).toBe("true");

            fireEvent.click(button);
            expect(actionMenu()).toBeNull();
            expect(props.onHandleFetch).not.toHaveBeenCalled();
        });

        it("adds the track to a playlist", () => {
            const onHandleAddToPlaylist = vi.fn();
            const { props } = setup({ playlists: [makePlaylist("pl-1", [], "Chill")], onHandleAddToPlaylist });
            openActionMenu();

            fireEvent.click(screen.getByText("Chill"));

            expect(onHandleAddToPlaylist).toHaveBeenCalledWith("pl-1", props.track);
            expect(document.getElementById("snackbar")?.textContent).toBe("Track added to Chill!");
        });

        it("creates a new playlist with the track", () => {
            const onHandleCreatePlaylist = vi.fn();
            const { props } = setup({ onHandleCreatePlaylist });
            openActionMenu();

            fireEvent.change(screen.getByPlaceholderText("Playlist"), { target: { value: "Road Trip" } });
            fireEvent.click(screen.getByText("+"));

            expect(onHandleCreatePlaylist).toHaveBeenCalledWith("Road Trip", props.track);
        });

        it("closes when clicking outside it", () => {
            setup();
            openActionMenu();

            fireEvent.mouseDown(document.body);

            expect(actionMenu()).toBeNull();
        });

        it("stays open while clicking inside it", () => {
            setup();
            openActionMenu();

            fireEvent.mouseDown(screen.getByPlaceholderText("Playlist"));

            expect(actionMenu()).not.toBeNull();
        });

        it("closes when the page or a list scrolls", () => {
            setup();
            openActionMenu();

            fireEvent.scroll(document.body);

            expect(actionMenu()).toBeNull();
        });

        it("stays open while its own playlist list scrolls", () => {
            setup({ playlists: [makePlaylist("pl-1", [], "Chill")] });
            openActionMenu();

            fireEvent.scroll(actionMenu()!.querySelector(".PlaylistMenuList")!);

            expect(actionMenu()).not.toBeNull();
        });

        it("opens below the button when there is room, and above it when there is not", () => {
            setup();
            const button = screen.getByLabelText("More actions for Track 2");

            vi.spyOn(document.documentElement, "clientHeight", "get").mockReturnValue(800);
            vi.spyOn(button, "getBoundingClientRect").mockReturnValue({ top: 100, bottom: 130, right: 500 } as DOMRect);
            fireEvent.click(button);
            expect(actionMenu()?.style.top).toBe("140px");
            fireEvent.click(button);

            vi.spyOn(document.documentElement, "clientHeight", "get").mockReturnValue(800);
            vi.spyOn(button, "getBoundingClientRect").mockReturnValue({ top: 760, bottom: 790, right: 500 } as DOMRect);
            fireEvent.click(button);
            expect(actionMenu()?.style.top).toBe("");
            expect(actionMenu()?.style.bottom).toBe("50px");
        });

        it("removes the entry from a list via onDeleteEntry + onListDeleteEntry", () => {
            const remaining = [makeTrack(1), makeTrack(3)];
            const onDeleteEntry = vi.fn().mockReturnValue(remaining);
            const onListDeleteEntry = vi.fn();
            const { props } = setup({ hasDeleteButton: true, onDeleteEntry, onListDeleteEntry });
            openActionMenu();

            fireEvent.click(screen.getByText("Remove"));

            expect(onDeleteEntry).toHaveBeenCalledWith(props.list, props.track);
            expect(onListDeleteEntry).toHaveBeenCalledWith(remaining);
            expect(props.onHandleFetch).not.toHaveBeenCalled();
            expect(actionMenu()).toBeNull();
        });

        it("removes the entry from a playlist when a playlist is given", () => {
            const onDeletePlaylistEntry = vi.fn();
            const playlist = makePlaylist("pl-1", makeTracks(3));
            const { props } = setup({ hasDeleteButton: true, playlist, onDeletePlaylistEntry });
            openActionMenu();

            fireEvent.click(screen.getByText("Remove"));

            expect(onDeletePlaylistEntry).toHaveBeenCalledWith("pl-1", props.track);
        });

        it("does not call onDeletePlaylistEntry without a playlist", () => {
            const onDeletePlaylistEntry = vi.fn();
            setup({ hasDeleteButton: true, onDeletePlaylistEntry });
            openActionMenu();

            fireEvent.click(screen.getByText("Remove"));

            expect(onDeletePlaylistEntry).not.toHaveBeenCalled();
        });
    });
});
