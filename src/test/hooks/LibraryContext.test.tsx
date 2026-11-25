// @vitest-environment jsdom
import { renderHook, cleanup } from "@testing-library/react";
import { describe, it, expect, afterEach, vi } from "vitest";
import { useLibrary } from "../../hooks/LibraryContext";
import { makeLibrary, withLibrary } from "../library";

describe("useLibrary", () => {
    afterEach(() => {
        cleanup();
        vi.restoreAllMocks();
    });

    it("returns the library provided around it", () => {
        const library = makeLibrary();

        const { result } = renderHook(() => useLibrary(), { wrapper: withLibrary(library) });

        expect(result.current).toBe(library);
    });

    it("throws when used outside a LibraryContext provider", () => {
        // React logs the error it catches, which would only clutter the test output.
        vi.spyOn(console, "error").mockImplementation(() => {});

        expect(() => renderHook(() => useLibrary())).toThrow("useLibrary must be used within a LibraryContext provider");
    });
});
