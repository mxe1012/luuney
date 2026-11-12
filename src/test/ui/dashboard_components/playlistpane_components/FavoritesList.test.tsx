// @vitest-environment jsdom
import { render, cleanup, fireEvent, screen } from "@testing-library/react";
import { describe, it, expect, afterEach, vi } from "vitest";
import FavoritesList from "../../../../ui/dashboard_components/playlistpane_components/FavoritesList";
import SnackbarProvider from "../../../../hooks/SnackbarContext";
import type { MainListProps } from "../../../../utils/types";
import { makeTracks } from "../../../fixtures";

function setup(overrides: Partial<MainListProps> = {}) {
    const props: MainListProps = {
        list: makeTracks(3),
        visible: true,
        onFavoritesList: vi.fn(),
        onDeleteEntry: vi.fn((list, entry) => list.filter((t) => t.track_id !== entry.track_id)),
        onHandleFetch: vi.fn().mockResolvedValue(undefined),
        onIsPlaying: vi.fn(),
        onSetTrackQueue: vi.fn(),
        onSetCurrentTrackIndex: vi.fn(),
        ...overrides,
    };
    const utils = render(<FavoritesList {...props} />, { wrapper: SnackbarProvider });
    return { ...utils, props };
}

describe("FavoritesList", () => {
    afterEach(() => {
        cleanup();
    });

    it("renders every favorite", () => {
        setup();

        expect(screen.getByText("Track 1")).toBeTruthy();
        expect(screen.getByText("Track 3")).toBeTruthy();
    });

    it("adds the hidden class when not visible", () => {
        const { container } = setup({ visible: false });

        expect(container.querySelector("ul")?.className).toBe("PlaylistPaneList hidden");
    });

    it("rows have a delete button but no favorite button", () => {
        setup({ list: makeTracks(1) });

        expect(screen.getByLabelText("Delete Entry")).toBeTruthy();
        expect(screen.queryByLabelText(/Favorites/)).toBeNull();
    });

    it("plays a track and queues the favorites list", () => {
        const { props } = setup();

        fireEvent.click(screen.getByText("Track 3").closest("button")!);

        expect(props.onHandleFetch).toHaveBeenCalledWith(3);
        expect(props.onSetCurrentTrackIndex).toHaveBeenCalledWith(2);
        expect(props.onSetTrackQueue).toHaveBeenCalledWith(props.list);
    });

    it("deleting a row updates the favorites list", () => {
        const { props } = setup();

        fireEvent.click(screen.getAllByLabelText("Delete Entry")[2]);

        expect(props.onFavoritesList).toHaveBeenCalledWith([props.list[0], props.list[1]]);
    });

    it("paginates at 10 favorites per page", () => {
        setup({ list: makeTracks(11) });

        expect(screen.queryByText("Track 11")).toBeNull();
        fireEvent.click(screen.getByAltText("next").closest("button")!);
        expect(screen.getByText("Track 11")).toBeTruthy();
    });

    describe("Clear button", () => {
        it("is hidden when the list is empty or the pane is hidden", () => {
            setup({ list: [] });
            expect(screen.getByText("Clear").style.display).toBe("none");
            cleanup();

            setup({ visible: false });
            expect(screen.getByText("Clear").style.display).toBe("none");
        });

        it("empties favorites and shows a snackbar", () => {
            const { props } = setup();

            fireEvent.click(screen.getByText("Clear"));

            expect(props.onFavoritesList).toHaveBeenCalledWith([]);
            expect(document.getElementById("snackbar")?.textContent).toBe("Favorites cleared!");
        });
    });
});
