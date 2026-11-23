// @vitest-environment jsdom
import { render, cleanup, screen, fireEvent, within } from "@testing-library/react";
import { describe, it, expect, afterEach, vi } from "vitest";
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
        const { container, rerender } = render(<UpNextList queue={makeTracks(2)} isUpNextVisible={false} onRemoveFromQueueManually={vi.fn()} />);
        expect(root(container).className).toBe("GlassCard NoBg UpNextList hidden");

        rerender(<UpNextList queue={makeTracks(2)} isUpNextVisible={true} onRemoveFromQueueManually={vi.fn()} />);
        expect(root(container).className).toBe("GlassCard NoBg UpNextList");
    });

    it("shows the heading", () => {
        render(<UpNextList queue={[]} isUpNextVisible={true} onRemoveFromQueueManually={vi.fn()} />);

        expect(screen.getByRole("heading", { level: 3 }).textContent).toBe("Queue");
    });

    it("lists each track's title and formatted duration, in order", () => {
        const queue = [
            makeTrack(1, { title: "First", duration: 65 }),
            makeTrack(2, { title: "Second", duration: 200 }),
            makeTrack(3, { title: "Third", duration: 9 }),
        ];

        render(<UpNextList queue={queue} isUpNextVisible={true} onRemoveFromQueueManually={vi.fn()} />);

        expect(rows()).toEqual([
            ["First", "1:05"],
            ["Second", "3:20"],
            ["Third", "0:09"],
        ]);
    });

    it("shows each track's cover, title, artist, duration and delete button, and nothing else", () => {
        const { container } = render(<UpNextList queue={[makeTrack(1, { duration: 65 })]} isUpNextVisible={true} onRemoveFromQueueManually={vi.fn()} />);
        const row = container.querySelector(".UpNextItem") as HTMLElement;

        expect(row.querySelectorAll("img")).toHaveLength(2);
        expect(row.querySelector("img")?.getAttribute("src")).toBe("https://example.com/art/1.jpg");
        expect(row.querySelector(".UpNextTitle")?.textContent).toBe("Track 1");
        expect(row.querySelector(".UpNextArtist")?.textContent).toBe("artist1");
        expect(row.querySelector(".UpNextDuration")?.textContent).toBe("1:05");
        expect(within(row).getAllByRole("button")).toHaveLength(1);
    });

    it("labels each delete button with its track's title", () => {
        render(<UpNextList queue={makeTracks(2)} isUpNextVisible={true} onRemoveFromQueueManually={vi.fn()} />);

        expect(screen.getByRole("button", { name: "Remove Track 1 from queue" })).toBeTruthy();
        expect(screen.getByRole("button", { name: "Remove Track 2 from queue" })).toBeTruthy();
    });

    it("removes the clicked track from the queue", () => {
        const onRemoveFromQueueManually = vi.fn();
        const queue = makeTracks(3);
        render(<UpNextList queue={queue} isUpNextVisible={true} onRemoveFromQueueManually={onRemoveFromQueueManually} />);

        const row = screen.getByText("Track 2").closest(".UpNextItem") as HTMLElement;
        fireEvent.click(within(row).getByRole("button"));

        expect(onRemoveFromQueueManually).toHaveBeenCalledTimes(1);
        expect(onRemoveFromQueueManually).toHaveBeenCalledWith(queue[1]);
    });

    it("shows a message instead of a list when nothing is up next", () => {
        const { container } = render(<UpNextList queue={[]} isUpNextVisible={true} onRemoveFromQueueManually={vi.fn()} />);

        expect(screen.getByText("Nothing in the queue.")).toBeTruthy();
        expect(container.querySelector(".UpNextItems")).toBeNull();
    });

    it("does not show the empty message when there are tracks", () => {
        render(<UpNextList queue={makeTracks(1)} isUpNextVisible={true} onRemoveFromQueueManually={vi.fn()} />);

        expect(screen.queryByText("Nothing in the queue.")).toBeNull();
    });
});
