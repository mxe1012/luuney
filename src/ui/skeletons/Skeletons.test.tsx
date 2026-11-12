// @vitest-environment jsdom
import { render, cleanup, screen } from "@testing-library/react";
import { describe, it, expect, afterEach } from "vitest";
import SkeletonExtraListPane from "./SkeletonExtraListPane";
import SkeletonSearchListPane from "./SkeletonSearchListPane";

describe("SkeletonExtraListPane", () => {
    afterEach(() => {
        cleanup();
    });

    it("renders 5 placeholder rows and hides children while loading", () => {
        const { container } = render(
            <SkeletonExtraListPane isLoaded={false}>
                <p>real content</p>
            </SkeletonExtraListPane>,
        );

        expect(container.querySelector(".skeleton-heading")).not.toBeNull();
        expect(container.querySelectorAll(".skeleton-button")).toHaveLength(5);
        expect(screen.queryByText("real content")).toBeNull();
    });

    it("renders only its children once loaded", () => {
        const { container } = render(
            <SkeletonExtraListPane isLoaded={true}>
                <p>real content</p>
            </SkeletonExtraListPane>,
        );

        expect(screen.getByText("real content")).toBeTruthy();
        expect(container.querySelector(".skeleton")).toBeNull();
    });
});

describe("SkeletonSearchListPane", () => {
    afterEach(() => {
        cleanup();
    });

    it("renders 4 placeholder rows and hides children while loading", () => {
        const { container } = render(
            <SkeletonSearchListPane isLoaded={false}>
                <p>results</p>
            </SkeletonSearchListPane>,
        );

        expect(container.querySelectorAll(".skeleton-search-list-button")).toHaveLength(4);
        expect(screen.queryByText("results")).toBeNull();
    });

    it("renders only its children once loaded", () => {
        const { container } = render(
            <SkeletonSearchListPane isLoaded={true}>
                <p>results</p>
            </SkeletonSearchListPane>,
        );

        expect(screen.getByText("results")).toBeTruthy();
        expect(container.querySelector(".skeleton")).toBeNull();
    });
});
