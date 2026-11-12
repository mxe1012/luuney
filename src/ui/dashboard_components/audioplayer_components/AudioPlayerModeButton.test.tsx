// @vitest-environment jsdom
import { render, cleanup, fireEvent, screen } from "@testing-library/react";
import { describe, it, expect, afterEach, vi } from "vitest";
import AudioPlayerModeButton from "./AudioPlayerModeButton";

const REPEAT_STATES = [
    { label: "Repeat off", src: "/repeat-off.svg" },
    { label: "Repeat one", src: "/repeat-once.svg" },
    { label: "Repeat all", src: "/repeat-all.svg" },
];

function imgSrc() {
    return screen.getByRole("button").querySelector("img")?.getAttribute("src");
}

describe("AudioPlayerModeButton", () => {
    afterEach(() => {
        cleanup();
    });

    describe("multi-state mode", () => {
        it.each([
            [0, "Repeat off", "/repeat-off.svg"],
            [1, "Repeat one", "/repeat-once.svg"],
            [2, "Repeat all", "/repeat-all.svg"],
        ])("stateIndex %i shows %s", (stateIndex, label, src) => {
            render(<AudioPlayerModeButton onClick={vi.fn()} size={36} states={REPEAT_STATES} stateIndex={stateIndex} />);

            expect(screen.getByRole("button", { name: label })).toBeTruthy();
            expect(imgSrc()).toBe(src);
        });

        it("defaults to the first state when stateIndex is omitted", () => {
            render(<AudioPlayerModeButton onClick={vi.fn()} size={36} states={REPEAT_STATES} />);

            expect(screen.getByRole("button", { name: "Repeat off" })).toBeTruthy();
        });

        it("falls back to the first state when stateIndex is out of range", () => {
            render(<AudioPlayerModeButton onClick={vi.fn()} size={36} states={REPEAT_STATES} stateIndex={-1} />);

            expect(screen.getByRole("button", { name: "Repeat off" })).toBeTruthy();
            expect(imgSrc()).toBe("/repeat-off.svg");
        });

        it("takes precedence over toggleAction", () => {
            render(
                <AudioPlayerModeButton
                    onClick={vi.fn()}
                    size={36}
                    states={REPEAT_STATES}
                    stateIndex={2}
                    toggleAction={true}
                    labelTrue="toggle-true"
                    srcTrue="/t.svg"
                />,
            );

            expect(screen.getByRole("button", { name: "Repeat all" })).toBeTruthy();
        });
    });

    describe("two-state mode", () => {
        const props = { labelTrue: "On", labelFalse: "Off", srcTrue: "/on.svg", srcFalse: "/off.svg" };

        it("resolves label and src from toggleAction", () => {
            render(<AudioPlayerModeButton onClick={vi.fn()} size={36} toggleAction={true} {...props} />);
            expect(screen.getByRole("button", { name: "On" })).toBeTruthy();
            expect(imgSrc()).toBe("/on.svg");
            cleanup();

            render(<AudioPlayerModeButton onClick={vi.fn()} size={36} toggleAction={false} {...props} />);
            expect(screen.getByRole("button", { name: "Off" })).toBeTruthy();
            expect(imgSrc()).toBe("/off.svg");
        });

        it("treats an empty states array as not provided", () => {
            render(<AudioPlayerModeButton onClick={vi.fn()} size={36} states={[]} toggleAction={true} {...props} />);

            expect(screen.getByRole("button", { name: "On" })).toBeTruthy();
        });
    });

    describe("simple mode", () => {
        it("uses label and src as given", () => {
            render(<AudioPlayerModeButton onClick={vi.fn()} size={20} label="Plain" src="/plain.svg" />);

            expect(screen.getByRole("button", { name: "Plain" })).toBeTruthy();
            expect(imgSrc()).toBe("/plain.svg");
        });
    });

    it("calls onClick", () => {
        const onClick = vi.fn();
        render(<AudioPlayerModeButton onClick={onClick} size={36} states={REPEAT_STATES} />);

        fireEvent.click(screen.getByRole("button"));

        expect(onClick).toHaveBeenCalledTimes(1);
    });
});
