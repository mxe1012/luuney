// @vitest-environment jsdom
import { render, renderHook, act, cleanup, fireEvent, screen } from "@testing-library/react";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import SnackbarProvider, { useSnackbar } from "../../hooks/SnackbarContext";

function Trigger({ message, duration, persist }: { message: string; duration?: number; persist?: boolean }) {
    const { showSnackbar, hideSnackbar } = useSnackbar();
    return (
        <>
            <button onClick={() => showSnackbar(message, duration, persist)}>show</button>
            <button onClick={() => hideSnackbar()}>hide</button>
        </>
    );
}

function getSnackbar() {
    const el = document.getElementById("snackbar");
    if (!el) throw new Error("snackbar element not rendered");
    return el;
}

describe("SnackbarProvider / useSnackbar", () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        cleanup();
        vi.useRealTimers();
        vi.restoreAllMocks();
    });

    it("renders its children and a hidden snackbar initially", () => {
        render(
            <SnackbarProvider>
                <p>child content</p>
            </SnackbarProvider>,
        );

        expect(screen.getByText("child content")).toBeTruthy();
        expect(getSnackbar().className).toBe("");
        expect(getSnackbar().textContent).toBe("");
    });

    it("shows the message and hides it after the default 2000ms", () => {
        render(
            <SnackbarProvider>
                <Trigger message="Hello" />
            </SnackbarProvider>,
        );

        fireEvent.click(screen.getByText("show"));
        expect(getSnackbar().className).toBe("show");
        expect(getSnackbar().textContent).toBe("Hello");

        act(() => vi.advanceTimersByTime(1999));
        expect(getSnackbar().className).toBe("show");

        act(() => vi.advanceTimersByTime(1));
        expect(getSnackbar().className).toBe("");
    });

    it("respects a custom duration", () => {
        render(
            <SnackbarProvider>
                <Trigger message="Long" duration={5000} />
            </SnackbarProvider>,
        );

        fireEvent.click(screen.getByText("show"));
        act(() => vi.advanceTimersByTime(4999));
        expect(getSnackbar().className).toBe("show");

        act(() => vi.advanceTimersByTime(1));
        expect(getSnackbar().className).toBe("");
    });

    it("keeps a persistent message visible until hideSnackbar is called", () => {
        render(
            <SnackbarProvider>
                <Trigger message="Sticky" persist />
            </SnackbarProvider>,
        );

        fireEvent.click(screen.getByText("show"));
        act(() => vi.advanceTimersByTime(60_000));
        expect(getSnackbar().className).toBe("show");

        fireEvent.click(screen.getByText("hide"));
        expect(getSnackbar().className).toBe("");
    });

    it("restarts the timer when a new message replaces the current one", () => {
        const { result } = renderHook(() => useSnackbar(), { wrapper: SnackbarProvider });

        act(() => result.current.showSnackbar("first"));
        act(() => vi.advanceTimersByTime(1500));
        act(() => result.current.showSnackbar("second"));

        expect(getSnackbar().textContent).toBe("second");

        // The first timer would have fired here if it had not been cleared.
        act(() => vi.advanceTimersByTime(1000));
        expect(getSnackbar().className).toBe("show");

        act(() => vi.advanceTimersByTime(1000));
        expect(getSnackbar().className).toBe("");
    });

    it("a persistent message cancels a pending auto-hide", () => {
        const { result } = renderHook(() => useSnackbar(), { wrapper: SnackbarProvider });

        act(() => result.current.showSnackbar("temporary"));
        act(() => result.current.showSnackbar("loading...", undefined, true));
        act(() => vi.advanceTimersByTime(10_000));

        expect(getSnackbar().className).toBe("show");
        expect(getSnackbar().textContent).toBe("loading...");
    });

    it("hideSnackbar cancels a pending timer", () => {
        const clearSpy = vi.spyOn(globalThis, "clearTimeout");
        const { result } = renderHook(() => useSnackbar(), { wrapper: SnackbarProvider });

        act(() => result.current.showSnackbar("bye"));
        act(() => result.current.hideSnackbar());

        expect(clearSpy).toHaveBeenCalled();
        expect(getSnackbar().className).toBe("");
    });

    it("returns stable function references across renders", () => {
        const { result, rerender } = renderHook(() => useSnackbar(), { wrapper: SnackbarProvider });
        const first = result.current;

        act(() => result.current.showSnackbar("re-render"));
        rerender();

        expect(result.current.showSnackbar).toBe(first.showSnackbar);
        expect(result.current.hideSnackbar).toBe(first.hideSnackbar);
    });

    it("throws when used outside a SnackbarProvider", () => {
        vi.spyOn(console, "error").mockImplementation(() => {});

        expect(() => renderHook(() => useSnackbar())).toThrow(
            "useSnackbar must be used within a SnackbarProvider",
        );
    });
});
