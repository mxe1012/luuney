// @vitest-environment jsdom
import { render, cleanup, fireEvent, screen } from "@testing-library/react";
import { describe, it, expect, afterEach, vi } from "vitest";
import ListButton from "./ListButton";
import type { ListButtonProps } from "../../../utils/types";
import { makePlaylist, makeTrack, makeTracks } from "../../../test/fixtures";

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
        ...overrides,
    };
    const utils = render(<ListButton {...props} />);
    return { ...utils, props };
}

function mainButton() {
    return screen.getByText("Track 2").closest("button") as HTMLButtonElement;
}

describe("ListButton", () => {
    afterEach(() => {
        cleanup();
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
        expect(onSetTrackQueue).toHaveBeenCalledWith(props.list);
        // A copy is queued so later edits to the source list don't mutate the queue.
        expect(onSetTrackQueue.mock.calls[0][0]).not.toBe(props.list);
    });

    it("works without the optional queue callbacks", () => {
        const { props } = setup();

        expect(() => fireEvent.click(mainButton())).not.toThrow();
        expect(props.onHandleFetch).toHaveBeenCalledWith(2);
    });

    it("hides the favorite and delete buttons when disabled", () => {
        setup({ hasDeleteButton: false, hasFavoriteButton: false });

        expect(screen.queryByLabelText(/Favorites/)).toBeNull();
        expect(screen.queryByLabelText("Delete Entry")).toBeNull();
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

    describe("delete button", () => {
        it("removes the entry from a list via onDeleteEntry + onListDeleteEntry", () => {
            const remaining = [makeTrack(1), makeTrack(3)];
            const onDeleteEntry = vi.fn().mockReturnValue(remaining);
            const onListDeleteEntry = vi.fn();
            const { props } = setup({ hasDeleteButton: true, onDeleteEntry, onListDeleteEntry });

            fireEvent.click(screen.getByLabelText("Delete Entry"));

            expect(onDeleteEntry).toHaveBeenCalledWith(props.list, props.track);
            expect(onListDeleteEntry).toHaveBeenCalledWith(remaining);
            expect(props.onHandleFetch).not.toHaveBeenCalled();
        });

        it("removes the entry from a playlist when a playlist is given", () => {
            const onDeletePlaylistEntry = vi.fn();
            const playlist = makePlaylist("pl-1", makeTracks(3));
            const { props } = setup({ hasDeleteButton: true, playlist, onDeletePlaylistEntry });

            fireEvent.click(screen.getByLabelText("Delete Entry"));

            expect(onDeletePlaylistEntry).toHaveBeenCalledWith("pl-1", props.track);
        });

        it("does not call onDeletePlaylistEntry without a playlist", () => {
            const onDeletePlaylistEntry = vi.fn();
            setup({ hasDeleteButton: true, onDeletePlaylistEntry });

            fireEvent.click(screen.getByLabelText("Delete Entry"));

            expect(onDeletePlaylistEntry).not.toHaveBeenCalled();
        });
    });
});
