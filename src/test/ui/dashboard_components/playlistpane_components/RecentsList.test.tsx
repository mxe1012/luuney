// @vitest-environment jsdom
import { render, cleanup, fireEvent, screen } from "@testing-library/react";
import { describe, it, expect, afterEach, vi } from "vitest";
import RecentsList from "../../../../ui/dashboard_components/playlistpane_components/RecentsList";
import SnackbarProvider from "../../../../hooks/SnackbarContext";
import type { MainListProps } from "../../../../utils/types";
import { makeTracks } from "../../../fixtures";

function setup(overrides: Partial<MainListProps> = {}) {
    const props: MainListProps = {
        list: makeTracks(3),
        visible: true,
        onRecentsList: vi.fn(),
        onAddToFavorites: vi.fn(),
        onDeleteEntry: vi.fn((list, entry) => list.filter((t) => t.track_id !== entry.track_id)),
        isFavorited: () => false,
        onHandleFetch: vi.fn().mockResolvedValue(undefined),
        onIsPlaying: vi.fn(),
        onSetTrackQueue: vi.fn(),
        onSetCurrentTrackIndex: vi.fn(),
        ...overrides,
    };
    const utils = render(<RecentsList {...props} />, { wrapper: SnackbarProvider });
    return { ...utils, props };
}

function listEl(container: HTMLElement) {
    return container.querySelector("ul.PlaylistPaneList") as HTMLUListElement;
}

describe("RecentsList", () => {
    afterEach(() => {
        cleanup();
    });

    it("renders every track in the list", () => {
        setup();

        expect(screen.getByText("Track 1")).toBeTruthy();
        expect(screen.getByText("Track 2")).toBeTruthy();
        expect(screen.getByText("Track 3")).toBeTruthy();
    });

    it("adds the hidden class when not visible", () => {
        const { container } = setup({ visible: false });

        expect(listEl(container).className).toBe("PlaylistPaneList hidden");
    });

    it("rows have both favorite and delete buttons", () => {
        setup({ list: makeTracks(1) });

        expect(screen.getByLabelText("Add to Favorites")).toBeTruthy();
        expect(screen.getByLabelText("Delete Entry")).toBeTruthy();
    });

    it("paginates at 10 tracks per page", () => {
        setup({ list: makeTracks(12) });

        expect(screen.getByText("Track 10")).toBeTruthy();
        expect(screen.queryByText("Track 11")).toBeNull();
        expect(screen.getByText("1 / 2")).toBeTruthy();

        fireEvent.click(screen.getByAltText("next").closest("button")!);

        expect(screen.getByText("Track 11")).toBeTruthy();
        expect(screen.queryByText("Track 1")).toBeNull();
    });

    it("passes the absolute index (page offset + row) when playing from page 2", () => {
        const { props } = setup({ list: makeTracks(12) });

        fireEvent.click(screen.getByAltText("next").closest("button")!);
        fireEvent.click(screen.getByText("Track 12").closest("button")!);

        expect(props.onSetCurrentTrackIndex).toHaveBeenCalledWith(11);
        expect(props.onHandleFetch).toHaveBeenCalledWith(12);
    });

    it("deleting a row updates the recents list", () => {
        const { props } = setup();

        fireEvent.click(screen.getAllByLabelText("Delete Entry")[0]);

        expect(props.onRecentsList).toHaveBeenCalledWith([props.list[1], props.list[2]]);
    });

    describe("Clear button", () => {
        it("is shown when visible and the list has entries", () => {
            setup();
            expect(screen.getByText("Clear").style.display).toBe("");
        });

        it("is hidden when the list is empty", () => {
            setup({ list: [] });
            expect(screen.getByText("Clear").style.display).toBe("none");
        });

        it("is hidden when the pane is not visible", () => {
            setup({ visible: false });
            expect(screen.getByText("Clear").style.display).toBe("none");
        });

        it("empties the list and shows a snackbar", () => {
            const { props } = setup();

            fireEvent.click(screen.getByText("Clear"));

            expect(props.onRecentsList).toHaveBeenCalledWith([]);
            expect(document.getElementById("snackbar")?.textContent).toBe("Recents cleared!");
        });
    });
});
