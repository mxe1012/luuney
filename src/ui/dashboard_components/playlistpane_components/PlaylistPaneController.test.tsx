// @vitest-environment jsdom
import { render, cleanup, fireEvent, screen } from "@testing-library/react";
import { describe, it, expect, afterEach, vi } from "vitest";
import PlaylistPaneController from "./PlaylistPaneController";
import type { PlaylistPaneControllerProps } from "../../../utils/types";

function setup(overrides: Partial<PlaylistPaneControllerProps> = {}) {
    const props: PlaylistPaneControllerProps = {
        isRecentsVisible: false,
        isFavoritesVisible: false,
        isPlaylistSelectionVisible: false,
        isSelectedPlaylist: false,
        onSetIsRecentsVisible: vi.fn(),
        onSetIsFavoritesVisible: vi.fn(),
        onSetIsPlaylistSelectionVisible: vi.fn(),
        onSetIsSelectedPlaylist: vi.fn(),
        ...overrides,
    };
    render(<PlaylistPaneController {...props} />);
    return props;
}

function expectVisibility(
    props: PlaylistPaneControllerProps,
    expected: { recents: boolean; favorites: boolean; playlists: boolean },
) {
    expect(props.onSetIsRecentsVisible).toHaveBeenCalledWith(expected.recents);
    expect(props.onSetIsFavoritesVisible).toHaveBeenCalledWith(expected.favorites);
    expect(props.onSetIsPlaylistSelectionVisible).toHaveBeenCalledWith(expected.playlists);
    expect(props.onSetIsSelectedPlaylist).toHaveBeenCalledWith(false);
}

describe("PlaylistPaneController", () => {
    afterEach(() => {
        cleanup();
    });

    it("renders the three tabs", () => {
        setup();

        expect(screen.getByText("Recents")).toBeTruthy();
        expect(screen.getByText("Favorites")).toBeTruthy();
        expect(screen.getByText("Playlists")).toBeTruthy();
    });

    it("clicking Recents shows only recents", () => {
        const props = setup();
        fireEvent.click(screen.getByText("Recents"));
        expectVisibility(props, { recents: true, favorites: false, playlists: false });
    });

    it("clicking Favorites shows only favorites", () => {
        const props = setup();
        fireEvent.click(screen.getByText("Favorites"));
        expectVisibility(props, { recents: false, favorites: true, playlists: false });
    });

    it("clicking Playlists shows only the playlist selection", () => {
        const props = setup();
        fireEvent.click(screen.getByText("Playlists"));
        expectVisibility(props, { recents: false, favorites: false, playlists: true });
    });

    it("shows '< Back' while a playlist is open, which returns to the selection", () => {
        const props = setup({ isSelectedPlaylist: true });

        expect(screen.queryByText("Playlists")).toBeNull();
        fireEvent.click(screen.getByText("< Back"));

        expectVisibility(props, { recents: false, favorites: false, playlists: true });
    });

    it("marks the active tab as selected", () => {
        setup({ isFavoritesVisible: true });

        expect(screen.getByText("Favorites").className).toContain("is-selected");
        expect(screen.getByText("Recents").className).not.toContain("is-selected");
        expect(screen.getByText("Playlists").className).not.toContain("is-selected");
    });
});
