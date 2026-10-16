// @vitest-environment jsdom
import { renderHook, act, cleanup } from "@testing-library/react";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { useLocalStorage } from "./useLocalStorage";

const KEY = "test_key";

describe("useLocalStorage", () => {
    beforeEach(() => {
        // Every test starts with empty storage so tests can't affect each other.
        localStorage.clear();
    });

    afterEach(() => {
        // Unmount any hooks rendered in the test and undo any spies/mocks.
        cleanup();
        vi.restoreAllMocks();
    });

    it("returns the fallback when the key does not exist", () => {
        const { result } = renderHook(() => useLocalStorage<string[]>(KEY, ["default"]));

        expect(result.current[0]).toEqual(["default"]);
    });

    it("reads an existing value from storage instead of the fallback", () => {
        localStorage.setItem(KEY, JSON.stringify(["saved"]));

        const { result } = renderHook(() => useLocalStorage<string[]>(KEY, []));

        expect(result.current[0]).toEqual(["saved"]);
    });

    it("falls back and logs an error when the stored JSON is invalid", () => {
        // Silence the expected console.error and let us assert it was called.
        const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
        localStorage.setItem(KEY, "{oops");

        const { result } = renderHook(() => useLocalStorage<string[]>(KEY, []));

        expect(result.current[0]).toEqual([]);
        expect(errorSpy).toHaveBeenCalled();
    });

    it("overwrites corrupted data with valid JSON after mounting", () => {
        vi.spyOn(console, "error").mockImplementation(() => {});
        localStorage.setItem(KEY, "{oops");

        renderHook(() => useLocalStorage<string[]>(KEY, []));

        // The mount-time effect writes the fallback back, repairing the key.
        expect(localStorage.getItem(KEY)).toBe("[]");
    });

    it("writes the fallback to storage on mount when the key was missing", () => {
        renderHook(() => useLocalStorage<string[]>(KEY, ["default"]));

        expect(localStorage.getItem(KEY)).toBe(JSON.stringify(["default"]));
    });

    it("updates state and storage when setValue is given a new value", () => {
        const { result } = renderHook(() => useLocalStorage<string[]>(KEY, []));

        // State updates must be wrapped in act() so React finishes rendering
        // and running effects before we make assertions.
        act(() => {
            result.current[1](["a", "b"]);
        });

        expect(result.current[0]).toEqual(["a", "b"]);
        expect(localStorage.getItem(KEY)).toBe(JSON.stringify(["a", "b"]));
    });

    it("supports functional updates like setState(prev => ...)", () => {
        const { result } = renderHook(() => useLocalStorage<string[]>(KEY, ["a"]));

        act(() => {
            result.current[1]((prev) => [...prev, "b"]);
        });

        expect(result.current[0]).toEqual(["a", "b"]);
        expect(JSON.parse(localStorage.getItem(KEY)!)).toEqual(["a", "b"]);
    });

    it("restores saved data in a fresh hook instance (simulated reload)", () => {
        const first = renderHook(() => useLocalStorage<string[]>(KEY, []));
        act(() => {
            first.result.current[1](["persisted"]);
        });
        first.unmount(); // "close the app"

        const second = renderHook(() => useLocalStorage<string[]>(KEY, [])); // "reopen"

        expect(second.result.current[0]).toEqual(["persisted"]);
    });

    it("keeps different keys independent", () => {
        const a = renderHook(() => useLocalStorage<string[]>("key_a", []));
        const b = renderHook(() => useLocalStorage<string[]>("key_b", []));

        act(() => {
            a.result.current[1](["only in a"]);
        });

        expect(a.result.current[0]).toEqual(["only in a"]);
        expect(b.result.current[0]).toEqual([]);
        expect(localStorage.getItem("key_b")).toBe("[]");
    });

    it("keeps working in memory when storage writes throw", () => {
        const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
        // Simulate a quota-exceeded error on every write.
        vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
            throw new Error("QuotaExceededError");
        });

        const { result } = renderHook(() => useLocalStorage<string[]>(KEY, []));
        act(() => {
            result.current[1](["still works"]);
        });

        expect(result.current[0]).toEqual(["still works"]);
        expect(errorSpy).toHaveBeenCalled();
    });
});
