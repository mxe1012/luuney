// @vitest-environment jsdom
import { render, cleanup } from "@testing-library/react";
import { describe, it, expect, afterEach } from "vitest";
import AudioPlayerUI from "./AudioPlayerUI";
import SnackbarProvider from "../../../hooks/SnackbarContext";
import { makeAudioPlayerUIProps } from "../../../test/audioPlayerUIProps";

describe("AudioPlayerUI", () => {
    afterEach(() => {
        cleanup();
    });

    it("renders both the main and mini players", () => {
        const { container } = render(<AudioPlayerUI {...makeAudioPlayerUIProps()} />, { wrapper: SnackbarProvider });

        expect(container.querySelector(".AudioPlayer")).not.toBeNull();
        expect(container.querySelector(".MiniAudioPlayer")).not.toBeNull();
    });

    it("shows exactly one of them depending on scroll position", () => {
        const { container, rerender } = render(<AudioPlayerUI {...makeAudioPlayerUIProps({ isScrolled: false })} />, {
            wrapper: SnackbarProvider,
        });

        expect(container.querySelector(".AudioPlayer")?.className).toBe("AudioPlayer");
        expect(container.querySelector(".MiniAudioPlayer")?.className).toBe("MiniAudioPlayer hidden");

        rerender(<AudioPlayerUI {...makeAudioPlayerUIProps({ isScrolled: true })} />);

        expect(container.querySelector(".AudioPlayer")?.className).toBe("AudioPlayer hidden");
        expect(container.querySelector(".MiniAudioPlayer")?.className).toBe("MiniAudioPlayer");
    });
});
