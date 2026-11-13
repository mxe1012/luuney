// @vitest-environment jsdom
import { render, cleanup, screen } from "@testing-library/react";
import { describe, it, expect, afterEach } from "vitest";
import UpNextList from "../../../../ui/dashboard_components/audioplayer_components/UpNextList";
import { makeTrack, makeTracks } from "../../../fixtures";

function root(container: HTMLElement) {
    return container.querySelector(".UpNextList") as HTMLElement;
}

function rows() {
    return Array.from(document.querySelectorAll(".UpNextItem")).map((row) => [
        row.querySelector(".UpNextTitle")?.textContent,
        row.querySelector(".UpNextDuration")?.textContent,
    ]);
}

describe("UpNextList", () => {
    afterEach(() => {
        cleanup();
    });

    it("is hidden unless isUpNextVisible is true", () => {
        const { container, rerender } = render(<UpNextList queue={makeTracks(2)} isUpNextVisible={false} />);
        expect(root(container).className).toBe("UpNextList hidden");

        rerender(<UpNextList queue={makeTracks(2)} isUpNextVisible={true} />);
        expect(root(container).className).toBe("UpNextList");
    });

    it("shows the heading", () => {
        render(<UpNextList queue={[]} isUpNextVisible={true} />);

        expect(screen.getByRole("heading", { level: 3 }).textContent).toBe("Up Next");
    });

    it("lists each track's title and formatted duration, in order", () => {
        const queue = [
            makeTrack(1, { title: "First", duration: 65 }),
            makeTrack(2, { title: "Second", duration: 200 }),
            makeTrack(3, { title: "Third", duration: 9 }),
        ];

        render(<UpNextList queue={queue} isUpNextVisible={true} />);

        expect(rows()).toEqual([
            ["First", "1:05"],
            ["Second", "3:20"],
            ["Third", "0:09"],
        ]);
    });

    it("shows only titles and durations", () => {
        const { container } = render(<UpNextList queue={[makeTrack(1)]} isUpNextVisible={true} />);

        expect(container.querySelector("img")).toBeNull();
        expect(container.querySelector("button")).toBeNull();
        expect(screen.queryByText("artist1")).toBeNull();
    });

    it("shows a message instead of a list when nothing is up next", () => {
        const { container } = render(<UpNextList queue={[]} isUpNextVisible={true} />);

        expect(screen.getByText("Nothing up next.")).toBeTruthy();
        expect(container.querySelector(".UpNextItems")).toBeNull();
    });

    it("does not show the empty message when there are tracks", () => {
        render(<UpNextList queue={makeTracks(1)} isUpNextVisible={true} />);

        expect(screen.queryByText("Nothing up next.")).toBeNull();
    });
});
