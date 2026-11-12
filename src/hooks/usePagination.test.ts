// @vitest-environment jsdom
import { renderHook, act, cleanup } from "@testing-library/react";
import { describe, it, expect, afterEach } from "vitest";
import usePagination from "./usePagination";

const range = (n: number) => Array.from({ length: n }, (_, i) => i);

describe("usePagination", () => {
    afterEach(() => {
        cleanup();
    });

    it("starts on the first page with the first slice of items", () => {
        const { result } = renderHook(() => usePagination(range(25), 10));

        expect(result.current.page).toBe(0);
        expect(result.current.start).toBe(0);
        expect(result.current.pageItems).toEqual(range(10));
        expect(result.current.pageCount).toBe(3);
        expect(result.current.hasPrev).toBe(false);
        expect(result.current.hasNext).toBe(true);
    });

    it("reports a single page for an empty list", () => {
        const { result } = renderHook(() => usePagination<number>([], 10));

        expect(result.current.pageCount).toBe(1);
        expect(result.current.pageItems).toEqual([]);
        expect(result.current.hasPrev).toBe(false);
        expect(result.current.hasNext).toBe(false);
    });

    it("reports a single page when items exactly fill one page", () => {
        const { result } = renderHook(() => usePagination(range(10), 10));

        expect(result.current.pageCount).toBe(1);
        expect(result.current.hasNext).toBe(false);
    });

    it("next() advances and exposes the next slice and start offset", () => {
        const { result } = renderHook(() => usePagination(range(25), 10));

        act(() => result.current.next());

        expect(result.current.page).toBe(1);
        expect(result.current.start).toBe(10);
        expect(result.current.pageItems).toEqual(range(20).slice(10));
        expect(result.current.hasPrev).toBe(true);
        expect(result.current.hasNext).toBe(true);
    });

    it("shows a partial final page", () => {
        const { result } = renderHook(() => usePagination(range(25), 10));

        act(() => result.current.next());
        act(() => result.current.next());

        expect(result.current.page).toBe(2);
        expect(result.current.pageItems).toEqual([20, 21, 22, 23, 24]);
        expect(result.current.hasNext).toBe(false);
    });

    it("next() does not go past the last page", () => {
        const { result } = renderHook(() => usePagination(range(15), 10));

        act(() => result.current.next());
        act(() => result.current.next());
        act(() => result.current.next());

        expect(result.current.page).toBe(1);
    });

    it("prev() goes back and does not go below the first page", () => {
        const { result } = renderHook(() => usePagination(range(25), 10));

        act(() => result.current.next());
        act(() => result.current.prev());
        expect(result.current.page).toBe(0);

        act(() => result.current.prev());
        expect(result.current.page).toBe(0);
    });

    it("resets to the first page when the current page becomes empty", () => {
        const { result, rerender } = renderHook(({ items }) => usePagination(items, 10), {
            initialProps: { items: range(25) },
        });

        act(() => result.current.next());
        act(() => result.current.next());
        expect(result.current.page).toBe(2);

        // The list shrinks (e.g. tracks deleted) so page 2 no longer exists.
        rerender({ items: range(5) });

        expect(result.current.page).toBe(0);
        expect(result.current.pageItems).toEqual(range(5));
    });

    it("stays on the current page when the list shrinks but the page still has items", () => {
        const { result, rerender } = renderHook(({ items }) => usePagination(items, 10), {
            initialProps: { items: range(25) },
        });

        act(() => result.current.next());
        rerender({ items: range(15) });

        expect(result.current.page).toBe(1);
        expect(result.current.pageItems).toEqual([10, 11, 12, 13, 14]);
    });
});
