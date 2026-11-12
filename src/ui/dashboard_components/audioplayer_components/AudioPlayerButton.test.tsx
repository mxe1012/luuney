// @vitest-environment jsdom
import { render, cleanup, fireEvent, screen } from "@testing-library/react";
import { describe, it, expect, afterEach, vi } from "vitest";
import AudioPlayerButton from "./AudioPlayerButton";

describe("AudioPlayerButton", () => {
    afterEach(() => {
        cleanup();
    });

    describe("simple mode (no toggleAction)", () => {
        it("uses label and src", () => {
            render(<AudioPlayerButton onClick={vi.fn()} size={36} label="Rewind" src="/rewind.svg" />);

            const button = screen.getByRole("button", { name: "Rewind" });
            const img = button.querySelector("img");
            expect(img?.getAttribute("src")).toBe("/rewind.svg");
            expect(img?.getAttribute("width")).toBe("36");
            expect(img?.getAttribute("height")).toBe("36");
        });

        it("calls onClick", () => {
            const onClick = vi.fn();
            render(<AudioPlayerButton onClick={onClick} size={36} label="Rewind" src="/rewind.svg" />);

            fireEvent.click(screen.getByRole("button", { name: "Rewind" }));

            expect(onClick).toHaveBeenCalledTimes(1);
        });
    });

    describe("toggle mode", () => {
        const toggleProps = {
            size: 64,
            labelTrue: "Pause",
            labelFalse: "Play",
            srcTrue: "/pause.svg",
            srcFalse: "/play.svg",
        };

        it("uses the 'true' label and src when toggleAction is true", () => {
            render(<AudioPlayerButton onClick={vi.fn()} toggleAction={true} {...toggleProps} />);

            const button = screen.getByRole("button", { name: "Pause" });
            expect(button.querySelector("img")?.getAttribute("src")).toBe("/pause.svg");
        });

        it("uses the 'false' label and src when toggleAction is false", () => {
            render(<AudioPlayerButton onClick={vi.fn()} toggleAction={false} {...toggleProps} />);

            const button = screen.getByRole("button", { name: "Play" });
            expect(button.querySelector("img")?.getAttribute("src")).toBe("/play.svg");
        });

        it("ignores plain label/src when toggleAction is set", () => {
            render(
                <AudioPlayerButton
                    onClick={vi.fn()}
                    toggleAction={false}
                    label="ignored"
                    src="/ignored.svg"
                    {...toggleProps}
                />,
            );

            expect(screen.queryByRole("button", { name: "ignored" })).toBeNull();
            expect(screen.getByRole("button", { name: "Play" })).toBeTruthy();
        });

        it("calls onClick", () => {
            const onClick = vi.fn();
            render(<AudioPlayerButton onClick={onClick} toggleAction={true} {...toggleProps} />);

            fireEvent.click(screen.getByRole("button"));

            expect(onClick).toHaveBeenCalledTimes(1);
        });
    });
});
