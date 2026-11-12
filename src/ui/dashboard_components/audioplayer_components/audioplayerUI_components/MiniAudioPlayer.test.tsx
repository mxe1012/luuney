// @vitest-environment jsdom
import { render, cleanup, fireEvent, screen } from "@testing-library/react";
import { describe, it, expect, afterEach } from "vitest";
import MiniAudioPlayer from "./MiniAudioPlayer";
import type { AudioPlayerUIProps } from "../../../../utils/types";
import { makeAudioPlayerUIProps } from "../../../../test/audioPlayerUIProps";

function setup(overrides: Partial<AudioPlayerUIProps> = {}) {
    const props = makeAudioPlayerUIProps(overrides);
    const utils = render(<MiniAudioPlayer {...props} />);
    return { ...utils, props };
}

function root(container: HTMLElement) {
    return container.querySelector(".MiniAudioPlayer") as HTMLElement;
}

describe("MiniAudioPlayer", () => {
    afterEach(() => {
        cleanup();
    });

    it("is hidden until the page is scrolled", () => {
        const { container } = setup({ isScrolled: false });
        expect(root(container).className).toBe("MiniAudioPlayer hidden");
        cleanup();

        const scrolled = setup({ isScrolled: true });
        expect(root(scrolled.container).className).toBe("MiniAudioPlayer");
    });

    it("shows the artwork", () => {
        const { container } = setup();

        expect(container.querySelector(".ListCover img")?.getAttribute("src")).toBe("https://example.com/art/1.jpg");
    });

    it("wires the transport buttons to their handlers", () => {
        const { props } = setup({ isPlaying: true });

        fireEvent.click(screen.getByRole("button", { name: "Pause" }));
        fireEvent.click(screen.getByRole("button", { name: "Rewind" }));
        fireEvent.click(screen.getByRole("button", { name: "Fast Forward" }));
        fireEvent.click(screen.getByRole("button", { name: "Shuffle Off" }));
        fireEvent.click(screen.getByRole("button", { name: "Repeat off" }));
        fireEvent.click(screen.getByRole("button", { name: "Mute" }));

        expect(props.onHandleTogglePlay).toHaveBeenCalledTimes(1);
        expect(props.onHandleRewind).toHaveBeenCalledTimes(1);
        expect(props.onHandleFastForward).toHaveBeenCalledTimes(1);
        expect(props.onHandleShuffle).toHaveBeenCalledTimes(1);
        expect(props.onCycleRepeatMode).toHaveBeenCalledTimes(1);
        expect(props.onHandleToggleMute).toHaveBeenCalledTimes(1);
    });

    it("reflects repeat, shuffle and mute state", () => {
        setup({ repeatMode: "all", isShuffle: true, isMuted: true });

        expect(screen.getByRole("button", { name: "Repeat all" })).toBeTruthy();
        expect(screen.getByRole("button", { name: "Shuffle On" })).toBeTruthy();
        expect(screen.getByRole("button", { name: "Unmute" })).toBeTruthy();
    });

    it("seek and volume sliders reflect state and call their handlers", () => {
        const { props } = setup({ currentTime: 10, duration: 100, volume: 0.3 });
        const seek = screen.getByLabelText("Seek") as HTMLInputElement;
        const volume = screen.getByLabelText("Volume") as HTMLInputElement;

        expect(seek.value).toBe("10");
        expect(seek.max).toBe("100");
        expect(volume.value).toBe("0.3");

        fireEvent.change(seek, { target: { value: "50" } });
        fireEvent.change(volume, { target: { value: "0.9" } });

        expect(props.onHandleSeek).toHaveBeenCalledTimes(1);
        expect(props.onHandleVolumeChange).toHaveBeenCalledTimes(1);
    });

    it("shows a volume of 0 while muted", () => {
        setup({ volume: 0.7, isMuted: true });

        expect((screen.getByLabelText("Volume") as HTMLInputElement).value).toBe("0");
    });
});
