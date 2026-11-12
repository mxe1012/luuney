// @vitest-environment jsdom
import { render, cleanup, screen } from "@testing-library/react";
import { describe, it, expect, afterEach } from "vitest";
import { MainPane, MiniIcon, PlaylistControllerButtonMiniContainer } from "../../ui/Containers";

describe("Containers", () => {
    afterEach(() => {
        cleanup();
    });

    it("MainPane renders its children without a wrapper element", () => {
        const { container } = render(
            <MainPane>
                <span>inside</span>
            </MainPane>,
        );

        expect(container.innerHTML).toBe("<span>inside</span>");
    });

    it("MiniIcon renders an image with a default size of 18", () => {
        render(<MiniIcon src="/assets/icon.svg" alt="icon" />);
        const img = screen.getByAltText("icon");

        expect(img.getAttribute("src")).toBe("/assets/icon.svg");
        expect(img.getAttribute("width")).toBe("18");
        expect(img.getAttribute("height")).toBe("18");
    });

    it("MiniIcon honours a custom size", () => {
        render(<MiniIcon src="/assets/icon.svg" alt="icon" size={32} />);
        const img = screen.getByAltText("icon");

        expect(img.getAttribute("width")).toBe("32");
        expect(img.getAttribute("height")).toBe("32");
    });

    it("PlaylistControllerButtonMiniContainer wraps children in a RowStart div", () => {
        const { container } = render(
            <PlaylistControllerButtonMiniContainer>
                <button>a</button>
            </PlaylistControllerButtonMiniContainer>,
        );

        const wrapper = container.firstElementChild;
        expect(wrapper?.className).toBe("RowStart");
        expect(wrapper?.querySelector("button")?.textContent).toBe("a");
    });
});
