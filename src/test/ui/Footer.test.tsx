// @vitest-environment jsdom
import { render, cleanup, screen } from "@testing-library/react";
import { describe, it, expect, afterEach } from "vitest";
import Footer from "../../ui/Footer";

describe("Footer", () => {
    afterEach(() => {
        cleanup();
    });

    it("links to the author's GitHub profile", () => {
        render(<Footer />);

        expect(screen.getByText("Github").getAttribute("href")).toBe("https://github.com/mxe1012");
    });

    it("credits Audius as the audio source", () => {
        render(<Footer />);

        expect(screen.getByText("Audius").getAttribute("href")).toBe("https://audius.co/feed");
    });
});
