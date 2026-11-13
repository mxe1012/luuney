// @vitest-environment jsdom
import { render, cleanup, fireEvent, screen } from "@testing-library/react";
import { describe, it, expect, afterEach } from "vitest";
import MiniAudioPlayer from "../../../../../ui/dashboard_components/audioplayer_components/audioplayerUI_components/MiniAudioPlayer";
import type { AudioPlayerUIProps } from "../../../../../utils/types";
import { makeAudioPlayerUIProps } from "../../../../audioPlayerUIProps";
import { makeTrack } from "../../../../fixtures";

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
        fireEvent.click(screen.getByRole("button", { name: "Mute" }));

        expect(props.onHandleTogglePlay).toHaveBeenCalledTimes(1);
        expect(props.onHandleToggleMute).toHaveBeenCalledTimes(1);
    });

    it("labels each skip button by its icon", () => {
        setup();

        const iconOf = (name: string) => screen.getByRole("button", { name }).querySelector("img")?.getAttribute("src");
        expect(iconOf("Previous")).toBe("/assets/audio_player_icons/skip-prev.svg");
        expect(iconOf("Next")).toBe("/assets/audio_player_icons/skip-next.svg");
    });

    it("wires the skip buttons to their handlers", () => {
        const { props } = setup();

        fireEvent.click(screen.getByRole("button", { name: "Previous" }));
        expect(props.onHandleSkipPrev).toHaveBeenCalledTimes(1);
        expect(props.onHandleSkipNext).not.toHaveBeenCalled();

        fireEvent.click(screen.getByRole("button", { name: "Next" }));
        expect(props.onHandleSkipNext).toHaveBeenCalledTimes(1);
        expect(props.onHandleSkipPrev).toHaveBeenCalledTimes(1);
    });

    it("shows only previous, play and next as transport controls", () => {
        setup();

        const icons = Array.from(document.querySelectorAll(".RowEvenly img")).map((img) =>
            img.getAttribute("src")?.replace("/assets/audio_player_icons/", ""),
        );
        expect(icons).toEqual(["skip-prev.svg", "play.svg", "skip-next.svg"]);
    });

    it.each(["Rewind", "Fast Forward", "Shuffle Off", "Repeat off"])("does not show the %s button", (name) => {
        setup();

        expect(screen.queryByRole("button", { name })).toBeNull();
    });

    it("reflects mute state", () => {
        setup({ isMuted: true });

        expect(screen.getByRole("button", { name: "Unmute" })).toBeTruthy();
    });

    describe("track title", () => {
        function titleText() {
            return document.querySelector(".MiniCover .MiniTitleText") as HTMLElement;
        }

        it("sits under the cover, inside the cover column", () => {
            const { container } = setup();
            const cover = container.querySelector(".MiniCover") as HTMLElement;

            expect(cover.children[0].tagName).toBe("IMG");
            expect(cover.children[1].className).toBe("MiniTitle");
            expect(titleText().textContent?.trim()).toBe("Track 1");
        });

        it("shows the full title as a tooltip", () => {
            setup({ track: makeTrack(1, { title: "A Very Long Song Title Indeed" }) });

            expect(document.querySelector(".MiniTitle")?.getAttribute("title")).toBe("A Very Long Song Title Indeed");
        });

        it("does not scroll titles of up to 14 characters", () => {
            setup({ track: makeTrack(1, { title: "A".repeat(14) }) });

            expect(titleText().className).toBe("MiniTitleText");
        });

        it("scrolls titles longer than 14 characters", () => {
            setup({ track: makeTrack(1, { title: "A".repeat(15) }) });

            expect(titleText().className).toBe("MiniTitleText MiniScrollText");
        });

        it("updates when the track changes", () => {
            const { rerender, props } = setup({ track: makeTrack(1, { title: "Short" }) });

            rerender(<MiniAudioPlayer {...props} track={makeTrack(2, { title: "Murder She Wrote (Remix)" })} />);

            expect(titleText().textContent?.trim()).toBe("Murder She Wrote (Remix)");
            expect(titleText().className).toBe("MiniTitleText MiniScrollText");
        });
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
