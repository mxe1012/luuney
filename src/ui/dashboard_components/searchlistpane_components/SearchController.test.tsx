// @vitest-environment jsdom
import { render, cleanup, fireEvent, screen } from "@testing-library/react";
import { describe, it, expect, afterEach, vi } from "vitest";
import SearchController from "./SearchController";
import type { SearchControllerProps } from "../../../utils/types";

function setup(overrides: Partial<SearchControllerProps> = {}) {
    const props: SearchControllerProps = {
        searchType: "tracks",
        searchTypes: ["tracks", "artists"],
        searchTrack: "",
        searchArtist: "",
        onHandleSearchTracks: vi.fn().mockResolvedValue(undefined),
        onHandleSearchArtists: vi.fn().mockResolvedValue(undefined),
        onHandleSearchType: vi.fn(),
        ...overrides,
    };
    render(<SearchController {...props} />);
    return props;
}

function input() {
    return screen.getByRole("textbox") as HTMLInputElement;
}

function select() {
    return screen.getByRole("combobox") as HTMLSelectElement;
}

describe("SearchController", () => {
    afterEach(() => {
        cleanup();
    });

    describe("in tracks mode", () => {
        it("shows the track query and track placeholder", () => {
            setup({ searchTrack: "lofi", searchArtist: "ignored" });

            expect(input().value).toBe("lofi");
            expect(input().placeholder).toBe("Search Tracks...");
        });

        it("routes typing to onHandleSearchTracks", () => {
            const props = setup();

            fireEvent.change(input(), { target: { value: "jazz" } });

            expect(props.onHandleSearchTracks).toHaveBeenCalledTimes(1);
            expect(props.onHandleSearchArtists).not.toHaveBeenCalled();
        });
    });

    describe("in artists mode", () => {
        it("shows the artist query and artist placeholder", () => {
            setup({ searchType: "artists", searchTrack: "ignored", searchArtist: "dj" });

            expect(input().value).toBe("dj");
            expect(input().placeholder).toBe("Search Artists...");
        });

        it("routes typing to onHandleSearchArtists", () => {
            const props = setup({ searchType: "artists" });

            fireEvent.change(input(), { target: { value: "bjork" } });

            expect(props.onHandleSearchArtists).toHaveBeenCalledTimes(1);
            expect(props.onHandleSearchTracks).not.toHaveBeenCalled();
        });
    });

    it("offers Tracks and Artists options and reflects the current type", () => {
        setup({ searchType: "artists" });

        const options = Array.from(select().options).map((o) => [o.value, o.textContent]);
        expect(options).toEqual([
            ["tracks", "Tracks"],
            ["artists", "Artists"],
        ]);
        expect(select().value).toBe("artists");
    });

    it("calls onHandleSearchType when the type changes", () => {
        const props = setup();

        fireEvent.change(select(), { target: { value: "artists" } });

        expect(props.onHandleSearchType).toHaveBeenCalledTimes(1);
    });
});
