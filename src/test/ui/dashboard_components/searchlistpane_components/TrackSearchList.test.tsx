// @vitest-environment jsdom
import { render, cleanup, fireEvent, screen } from "@testing-library/react";
import { describe, it, expect, afterEach } from "vitest";
import TrackSearchList from "../../../../ui/dashboard_components/searchlistpane_components/TrackSearchList";
import type { LibraryContextType, TrackSearchListProps } from "../../../../utils/types";
import { makeTracks } from "../../../fixtures";
import { splitLibrary, withLibrary } from "../../../library";

function setup(overrides: Partial<TrackSearchListProps & LibraryContextType> = {}) {
    const { library, props: own } = splitLibrary<TrackSearchListProps>(overrides);
    const props: TrackSearchListProps = {
        list: makeTracks(3),
        ...own,
    };
    const utils = render(<TrackSearchList {...props} />, { wrapper: withLibrary(library) });
    return { ...utils, props: { ...props, ...library } };
}

describe("TrackSearchList", () => {
    afterEach(() => {
        cleanup();
    });

    it("hides the list when there are no results", () => {
        const { container } = setup({ list: [] });

        expect((container.querySelector("ul") as HTMLElement).style.display).toBe("none");
    });

    it("renders each result with a favorite button and a more actions menu without a remove option", () => {
        setup();

        expect(screen.getByText("Track 1")).toBeTruthy();
        expect(screen.getAllByLabelText("Add to Favorites")).toHaveLength(3);

        fireEvent.click(screen.getByLabelText("More actions for Track 1"));
        expect(screen.getByPlaceholderText("Playlist")).toBeTruthy();
        expect(screen.queryByText("Remove")).toBeNull();
    });

    it("reflects favorite state per track", () => {
        setup({ isFavorited: (t) => t.track_id === 2 });

        expect(screen.getAllByLabelText("Add to Favorites")).toHaveLength(2);
        expect(screen.getAllByLabelText("Remove from Favorites")).toHaveLength(1);
    });

    it("plays a result and queues all results", () => {
        const { props } = setup();

        fireEvent.click(screen.getByText("Track 2").closest("button")!);

        expect(props.onHandleFetch).toHaveBeenCalledWith(2);
        expect(props.onSetCurrentTrackIndex).toHaveBeenCalledWith(1);
        expect(props.onSetTrackQueue).toHaveBeenCalledWith(props.list);
    });

    it("favorites a result", () => {
        const { props } = setup();

        fireEvent.click(screen.getAllByLabelText("Add to Favorites")[0]);

        expect(props.onAddToFavorites).toHaveBeenCalledWith(props.list[0]);
    });

    it("paginates results and keeps absolute indexes", () => {
        const { props } = setup({ list: makeTracks(15) });

        expect(screen.getByText("1 / 2")).toBeTruthy();
        fireEvent.click(screen.getByAltText("next").closest("button")!);
        fireEvent.click(screen.getByText("Track 11").closest("button")!);

        expect(props.onSetCurrentTrackIndex).toHaveBeenCalledWith(10);
    });
});
