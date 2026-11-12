// @vitest-environment jsdom
import { render, cleanup, fireEvent, screen } from "@testing-library/react";
import { describe, it, expect, afterEach, vi } from "vitest";
import PlaylistPane from "./PlaylistPane";
import SnackbarProvider from "../../hooks/SnackbarContext";
import type { PlaylistPaneProps } from "../../utils/types";
import { makePlaylist, makeTrack } from "../../test/fixtures";

function setup(overrides: Partial<PlaylistPaneProps> = {}) {
    const props: PlaylistPaneProps = {
        recents: [makeTrack(1)],
        favorites: [makeTrack(2)],
        playlist: [makePlaylist("p1", [makeTrack(3)], "Road Trip")],
        onRecentsList: vi.fn(),
        onFavoritesList: vi.fn(),
        onSetPlaylist: vi.fn(),
        isFavorited: () => false,
        onDeleteEntry: vi.fn((list) => list),
        onDeletePlaylist: vi.fn(() => []),
        onDeletePlaylistEntry: vi.fn(),
        onAddToFavorites: vi.fn(),
        onHandleFetch: vi.fn().mockResolvedValue(undefined),
        onSetCurrentTrackIndex: vi.fn(),
        onIsPlaying: vi.fn(),
        onSetTrackQueue: vi.fn(),
        ...overrides,
    };
    const utils = render(<PlaylistPane {...props} />, { wrapper: SnackbarProvider });
    return { ...utils, props };
}

// The sub-lists are always mounted; "hidden" controls which one is shown.
function isShown(text: string) {
    const list = screen.getByText(text).closest("ul");
    return !!list && !list.className.includes("hidden");
}

describe("PlaylistPane", () => {
    afterEach(() => {
        cleanup();
    });

    it("starts with every list hidden", () => {
        setup();

        expect(isShown("Track 1")).toBe(false);
        expect(isShown("Track 2")).toBe(false);
        expect(isShown("Road Trip")).toBe(false);
    });

    it("the Recents tab shows only recents", () => {
        setup();

        fireEvent.click(screen.getByText("Recents"));

        expect(isShown("Track 1")).toBe(true);
        expect(isShown("Track 2")).toBe(false);
        expect(isShown("Road Trip")).toBe(false);
    });

    it("the Favorites tab shows only favorites", () => {
        setup();

        fireEvent.click(screen.getByText("Favorites"));

        expect(isShown("Track 1")).toBe(false);
        expect(isShown("Track 2")).toBe(true);
    });

    it("the Playlists tab shows the playlist folders", () => {
        setup();

        fireEvent.click(screen.getByText("Playlists"));

        expect(isShown("Road Trip")).toBe(true);
        expect(isShown("Track 1")).toBe(false);
    });

    it("opening a playlist shows its tracks and turns the tab into '< Back'", () => {
        setup();

        fireEvent.click(screen.getByText("Playlists"));
        fireEvent.click(screen.getByText("Road Trip").closest("button")!);

        expect(screen.getByRole("heading", { level: 2 }).textContent).toBe("Road Trip");
        expect(screen.getByText("Track 3")).toBeTruthy();
        expect(screen.getByText("< Back")).toBeTruthy();
    });

    it("'< Back' returns to the folder list", () => {
        setup();

        fireEvent.click(screen.getByText("Playlists"));
        fireEvent.click(screen.getByText("Road Trip").closest("button")!);
        fireEvent.click(screen.getByText("< Back"));

        expect(screen.queryByRole("heading", { level: 2 })).toBeNull();
        expect(isShown("Road Trip")).toBe(true);
        expect(screen.getByText("Playlists")).toBeTruthy();
    });

    it("switching to another tab closes an open playlist", () => {
        setup();

        fireEvent.click(screen.getByText("Playlists"));
        fireEvent.click(screen.getByText("Road Trip").closest("button")!);
        fireEvent.click(screen.getByText("Recents"));

        expect(screen.queryByText("< Back")).toBeNull();
        expect(isShown("Track 1")).toBe(true);
    });
});
