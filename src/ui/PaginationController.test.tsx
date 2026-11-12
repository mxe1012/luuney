// @vitest-environment jsdom
import { render, cleanup, fireEvent, screen } from "@testing-library/react";
import { describe, it, expect, afterEach, vi } from "vitest";
import PaginationController from "./PaginationController";
import type { PaginationControllerProps } from "../utils/types";

function setup(overrides: Partial<PaginationControllerProps> = {}) {
    const props: PaginationControllerProps = {
        className: "Pagination",
        page: 0,
        pageCount: 3,
        prev: vi.fn(),
        hasPrev: false,
        next: vi.fn(),
        hasNext: true,
        ...overrides,
    };
    const utils = render(<PaginationController {...props} />);
    return { ...utils, props };
}

function prevButton() {
    return screen.getByAltText("prev").closest("button") as HTMLButtonElement;
}

function nextButton() {
    return screen.getByAltText("next").closest("button") as HTMLButtonElement;
}

describe("PaginationController", () => {
    afterEach(() => {
        cleanup();
    });

    it("shows the 1-based page number and page count", () => {
        setup({ page: 1, pageCount: 4 });

        expect(screen.getByText("2 / 4")).toBeTruthy();
    });

    it("applies the className to the wrapper", () => {
        const { container } = setup({ className: "PaginationExtraList" });

        expect(container.querySelector(".PaginationExtraList")).not.toBeNull();
    });

    it("renders nothing when there is only one page", () => {
        const { container } = setup({ pageCount: 1 });

        expect(container.innerHTML).toBe("");
    });

    it("renders nothing when visible is explicitly false", () => {
        const { container } = setup({ visible: false });

        expect(container.innerHTML).toBe("");
    });

    it("renders when visible is true or omitted", () => {
        setup({ visible: true });
        expect(screen.getByText("1 / 3")).toBeTruthy();
        cleanup();

        setup({ visible: undefined });
        expect(screen.getByText("1 / 3")).toBeTruthy();
    });

    it("disables buttons according to hasPrev / hasNext", () => {
        setup({ hasPrev: false, hasNext: true });
        expect(prevButton().disabled).toBe(true);
        expect(nextButton().disabled).toBe(false);
        cleanup();

        setup({ hasPrev: true, hasNext: false });
        expect(prevButton().disabled).toBe(false);
        expect(nextButton().disabled).toBe(true);
    });

    it("calls prev and next when clicked", () => {
        const { props } = setup({ page: 1, hasPrev: true, hasNext: true });

        fireEvent.click(prevButton());
        fireEvent.click(nextButton());

        expect(props.prev).toHaveBeenCalledTimes(1);
        expect(props.next).toHaveBeenCalledTimes(1);
    });
});
