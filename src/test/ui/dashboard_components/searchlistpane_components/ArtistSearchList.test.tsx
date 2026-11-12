// @vitest-environment jsdom
import { render, cleanup, fireEvent, screen } from "@testing-library/react";
import { describe, it, expect, afterEach, vi } from "vitest";
import ArtistSearchList from "../../../../ui/dashboard_components/searchlistpane_components/ArtistSearchList";
import type { ArtistSearchListProps } from "../../../../utils/types";
import { makeArtist } from "../../../fixtures";

function setup(overrides: Partial<ArtistSearchListProps> = {}) {
    const props: ArtistSearchListProps = {
        list: [makeArtist(1), makeArtist(2, { track_count: 1 })],
        onHandleFetchTracksByUserId: vi.fn().mockResolvedValue(undefined),
        onSetArtistList: vi.fn(),
        ...overrides,
    };
    const utils = render(<ArtistSearchList {...props} />);
    return { ...utils, props };
}

describe("ArtistSearchList", () => {
    afterEach(() => {
        cleanup();
    });

    it("hides the list when there are no results", () => {
        const { container } = setup({ list: [] });

        expect((container.querySelector("ul") as HTMLElement).style.display).toBe("none");
    });

    it("shows each artist's name, handle and profile picture", () => {
        const { container } = setup();

        expect(screen.getByText("Artist 1")).toBeTruthy();
        expect(screen.getByText("artist1")).toBeTruthy();
        expect(container.querySelector("img")?.getAttribute("src")).toBe("https://example.com/pfp/1.jpg");
    });

    it("pluralises the track count", () => {
        setup();

        expect(screen.getByText(/3\s+tracks/)).toBeTruthy();
        expect(screen.getByText(/1\s+track$/)).toBeTruthy();
    });

    it("loads the artist's tracks and clears the artist list on click", () => {
        const { props } = setup();

        fireEvent.click(screen.getByText("Artist 2").closest("button")!);

        expect(props.onHandleFetchTracksByUserId).toHaveBeenCalledWith(2);
        expect(props.onSetArtistList).toHaveBeenCalledWith([]);
    });

    it("paginates at 10 artists per page", () => {
        const list = Array.from({ length: 12 }, (_, i) => makeArtist(i + 1));
        setup({ list });

        expect(screen.queryByText("Artist 11")).toBeNull();
        fireEvent.click(screen.getByAltText("next").closest("button")!);
        expect(screen.getByText("Artist 11")).toBeTruthy();
    });
});
