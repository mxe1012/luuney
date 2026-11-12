// @vitest-environment jsdom
import { render, cleanup, fireEvent, screen } from "@testing-library/react";
import { describe, it, expect, afterEach, vi } from "vitest";
import ExtraListPane from "./ExtraListPane";
import type { ExtraListPaneProps } from "../../utils/types";
import { makeTrack, makeTracks } from "../../test/fixtures";

function setup(overrides: Partial<ExtraListPaneProps> = {}) {
    const props: ExtraListPaneProps = {
        list: makeTracks(3),
        heading: "Trending Tracks",
        isLoaded: true,
        onHandleFetch: vi.fn().mockResolvedValue(undefined),
        onIsPlaying: vi.fn(),
        onSetTrackQueue: vi.fn(),
        onSetCurrentTrackIndex: vi.fn(),
        ...overrides,
    };
    const utils = render(<ExtraListPane {...props} />);
    return { ...utils, props };
}

describe("ExtraListPane", () => {
    afterEach(() => {
        cleanup();
    });

    it("shows a skeleton instead of content while loading", () => {
        const { container } = setup({ isLoaded: false });

        expect(container.querySelector(".skeleton-heading")).not.toBeNull();
        expect(screen.queryByText("Trending Tracks")).toBeNull();
        expect(screen.queryByText("Track 1")).toBeNull();
    });

    it("shows the heading and each track once loaded", () => {
        setup({ list: [makeTrack(1, { duration: 185 })] });

        expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("Trending Tracks");
        expect(screen.getByText("Track 1")).toBeTruthy();
        expect(screen.getByText("artist1")).toBeTruthy();
        expect(screen.getByText("3:05")).toBeTruthy();
    });

    it("plays a track and queues the whole list", () => {
        const { props } = setup();

        fireEvent.click(screen.getByText("Track 3").closest("button")!);

        expect(props.onHandleFetch).toHaveBeenCalledWith(3);
        expect(props.onIsPlaying).toHaveBeenCalledWith(false);
        expect(props.onSetCurrentTrackIndex).toHaveBeenCalledWith(2);
        expect(props.onSetTrackQueue).toHaveBeenCalledWith(props.list);
    });

    it("paginates and uses the absolute index on later pages", () => {
        const { props } = setup({ list: makeTracks(25) });

        expect(screen.getByText("1 / 3")).toBeTruthy();
        fireEvent.click(screen.getByAltText("next").closest("button")!);
        fireEvent.click(screen.getByAltText("next").closest("button")!);
        fireEvent.click(screen.getByText("Track 25").closest("button")!);

        expect(props.onSetCurrentTrackIndex).toHaveBeenCalledWith(24);
    });

    it("hides pagination for a single page", () => {
        setup({ list: makeTracks(10) });

        expect(screen.queryByAltText("next")).toBeNull();
    });
});
