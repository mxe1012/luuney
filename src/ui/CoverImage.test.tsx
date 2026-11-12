// @vitest-environment jsdom
import { render, cleanup, fireEvent } from "@testing-library/react";
import { describe, it, expect, afterEach } from "vitest";
import CoverImage from "./CoverImage";

const PLACEHOLDER = "/assets/placeholder-cover-purple.svg";

function getImg(container: HTMLElement) {
    const img = container.querySelector("img");
    if (!img) throw new Error("img not rendered");
    return img;
}

describe("CoverImage", () => {
    afterEach(() => {
        cleanup();
    });

    it("renders the given src at the given size", () => {
        const { container } = render(<CoverImage src="https://example.com/a.jpg" size={64} />);
        const img = getImg(container);

        expect(img.getAttribute("src")).toBe("https://example.com/a.jpg");
        expect(img.getAttribute("width")).toBe("64");
        expect(img.getAttribute("height")).toBe("64");
        expect(img.getAttribute("alt")).toBe("");
    });

    it("applies inline styles", () => {
        const { container } = render(<CoverImage src="a.jpg" size={10} styles={{ borderRadius: "10px" }} />);

        expect(getImg(container).style.borderRadius).toBe("10px");
    });

    it("shows the placeholder when no src is given", () => {
        const { container } = render(<CoverImage size={64} />);

        expect(getImg(container).getAttribute("src")).toBe(PLACEHOLDER);
    });

    it("shows the placeholder for an empty src", () => {
        const { container } = render(<CoverImage src="" size={64} />);

        expect(getImg(container).getAttribute("src")).toBe(PLACEHOLDER);
    });

    it("falls back to the placeholder when the image fails to load", () => {
        const { container } = render(<CoverImage src="https://example.com/broken.jpg" size={64} />);

        fireEvent.error(getImg(container));

        expect(getImg(container).getAttribute("src")).toBe(PLACEHOLDER);
    });

    it("tries a new src again after a previous src failed", () => {
        const { container, rerender } = render(<CoverImage src="https://example.com/broken.jpg" size={64} />);
        fireEvent.error(getImg(container));

        rerender(<CoverImage src="https://example.com/good.jpg" size={64} />);

        expect(getImg(container).getAttribute("src")).toBe("https://example.com/good.jpg");
    });
});
