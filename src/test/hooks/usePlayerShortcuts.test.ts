// @vitest-environment jsdom
import { renderHook, cleanup, fireEvent } from "@testing-library/react";
import { describe, it, expect, afterEach, vi } from "vitest";
import { usePlayerShortcuts } from "../../hooks/usePlayerShortcuts";
import type { PlayerShortcutHandlers } from "../../utils/types";

function makeHandlers(): PlayerShortcutHandlers {
    return {
        onTogglePlay: vi.fn(),
        onToggleMute: vi.fn(),
        onChangeVolume: vi.fn(),
        onRewind: vi.fn(),
        onFastForward: vi.fn(),
    };
}

function render(handlers = makeHandlers()) {
    const hook = renderHook((props) => usePlayerShortcuts(props), { initialProps: handlers });
    return { ...hook, handlers };
}

function press(key: string, options: { target?: Element; repeat?: boolean; ctrlKey?: boolean; metaKey?: boolean; altKey?: boolean } = {}) {
    const { target = document.body, ...rest } = options;
    return fireEvent.keyDown(target, { key, ...rest });
}

function addElement<K extends keyof HTMLElementTagNameMap>(tag: K, setup?: (element: HTMLElementTagNameMap[K]) => void) {
    const element = document.createElement(tag);
    setup?.(element);
    return document.body.appendChild(element);
}

describe("usePlayerShortcuts", () => {
    afterEach(() => {
        cleanup();
        document.body.innerHTML = "";
        vi.restoreAllMocks();
    });

    it("space toggles playback and stops the page from scrolling", () => {
        const { handlers } = render();

        const notPrevented = press(" ");

        expect(handlers.onTogglePlay).toHaveBeenCalledTimes(1);
        expect(notPrevented).toBe(false);
    });

    it("holding space does not toggle repeatedly, but still stops the page from scrolling", () => {
        const { handlers } = render();

        const notPrevented = press(" ", { repeat: true });

        expect(handlers.onTogglePlay).not.toHaveBeenCalled();
        expect(notPrevented).toBe(false);
    });

    it("M and m toggle mute, but not while held", () => {
        const { handlers } = render();

        press("m");
        press("M");
        press("m", { repeat: true });

        expect(handlers.onToggleMute).toHaveBeenCalledTimes(2);
    });

    it("+ and = raise the volume and - lowers it, by 0.05", () => {
        const { handlers } = render();

        press("+");
        press("=");
        press("-");

        expect(vi.mocked(handlers.onChangeVolume).mock.calls).toEqual([[0.05], [0.05], [-0.05]]);
    });

    it("the arrow keys seek, and keep seeking while held", () => {
        const { handlers } = render();

        press("ArrowLeft");
        press("ArrowRight");
        press("ArrowRight", { repeat: true });

        expect(handlers.onRewind).toHaveBeenCalledTimes(1);
        expect(handlers.onFastForward).toHaveBeenCalledTimes(2);
    });

    it("a focused slider keeps the volume keys but not the arrow keys", () => {
        const { handlers } = render();
        const slider = addElement("input", (input) => { input.type = "range"; });

        press("-", { target: slider });
        press("ArrowLeft", { target: slider });
        press("ArrowRight", { target: slider });

        expect(handlers.onChangeVolume).toHaveBeenCalledWith(-0.05);
        expect(handlers.onRewind).not.toHaveBeenCalled();
        expect(handlers.onFastForward).not.toHaveBeenCalled();
    });

    it("ignores keys typed into text fields, text areas, selects and editable content", () => {
        const { handlers } = render();
        const targets = [
            addElement("input"),
            addElement("textarea"),
            addElement("select"),
            // jsdom doesn't compute isContentEditable from the attribute, so set it directly
            addElement("div", (div) => { Object.defineProperty(div, "isContentEditable", { value: true }); }),
        ];

        for (const target of targets) {
            press(" ", { target });
            press("m", { target });
            press("-", { target });
            press("ArrowRight", { target });
        }

        for (const handler of Object.values(handlers)) expect(handler).not.toHaveBeenCalled();
    });

    it("leaves browser shortcuts with Ctrl, Cmd or Alt alone", () => {
        const { handlers } = render();

        press("m", { ctrlKey: true });
        press(" ", { metaKey: true });
        press("-", { altKey: true });

        for (const handler of Object.values(handlers)) expect(handler).not.toHaveBeenCalled();
    });

    it("ignores other keys", () => {
        const { handlers } = render();

        press("a");
        press("Enter");

        for (const handler of Object.values(handlers)) expect(handler).not.toHaveBeenCalled();
    });

    it("calls the latest handlers, not the ones from the first render", () => {
        const { rerender, handlers: first } = render();
        const latest = makeHandlers();

        rerender(latest);
        press("m");

        expect(first.onToggleMute).not.toHaveBeenCalled();
        expect(latest.onToggleMute).toHaveBeenCalledTimes(1);
    });

    it("adds one keydown listener, keeps it across renders, and removes it on unmount", () => {
        const add = vi.spyOn(window, "addEventListener");
        const remove = vi.spyOn(window, "removeEventListener");
        const { rerender, unmount } = render();

        rerender(makeHandlers());
        const added = add.mock.calls.filter(([type]) => type === "keydown").map(([, listener]) => listener);

        unmount();
        const removed = remove.mock.calls.filter(([type]) => type === "keydown").map(([, listener]) => listener);

        expect(added).toHaveLength(1);
        expect(removed).toEqual(added);
    });
});
