// @vitest-environment jsdom
import { render, cleanup, fireEvent, screen } from "@testing-library/react";
import { describe, it, expect, afterEach } from "vitest";
import MainAudioPlayer from "../../../../../ui/dashboard_components/audioplayer_components/audioplayerUI_components/MainAudioPlayer";
import SnackbarProvider from "../../../../../hooks/SnackbarContext";
import type { AudioPlayerUIProps } from "../../../../../utils/types";
import { makeAudioPlayerUIProps } from "../../../../audioPlayerUIProps";
import { makePlaylist, makeTrack } from "../../../../fixtures";

function setup(overrides: Partial<AudioPlayerUIProps> = {}) {
    const props = makeAudioPlayerUIProps(overrides);
    const utils = render(<MainAudioPlayer {...props} />, { wrapper: SnackbarProvider });
    return { ...utils, props };
}

function playerRoot(container: HTMLElement) {
    return container.querySelector(".AudioPlayer") as HTMLElement;
}

function playlistMenu(container: HTMLElement) {
    return container.querySelector(".PlaylistMenu") as HTMLElement;
}

function snackbarText() {
    return document.getElementById("snackbar")?.textContent;
}

describe("MainAudioPlayer", () => {
    afterEach(() => {
        cleanup();
    });

    it("shows the track title, artist, artwork and times", () => {
        const { container } = setup({ currentTime: 65, duration: 200 });

        expect(screen.getByRole("heading", { level: 2 }).textContent?.trim()).toBe("Track 1");
        expect(screen.getByRole("heading", { level: 3 }).textContent).toBe("artist1");
        expect(container.querySelector("img")?.getAttribute("src")).toBe("https://example.com/art/1.jpg");
        expect(screen.getByText("1:05")).toBeTruthy();
        expect(screen.getByText("3:20")).toBeTruthy();
    });

    it("is hidden once the page is scrolled", () => {
        const { container } = setup({ isScrolled: true });

        expect(playerRoot(container).className).toBe("AudioPlayer hidden");
    });

    it("scrolls long titles (22+ characters)", () => {
        setup({ track: makeTrack(1, { title: "A".repeat(22) }) });

        expect(screen.getByRole("heading", { level: 2 }).className).toBe("ScrollText");
    });

    it("does not scroll short titles", () => {
        setup({ track: makeTrack(1, { title: "Short" }) });

        expect(screen.getByRole("heading", { level: 2 }).className).toBe("");
    });

    describe("transport controls", () => {
        it("shows Play when paused and Pause when playing", () => {
            setup({ isPlaying: false });
            expect(screen.getByRole("button", { name: "Play" })).toBeTruthy();
            cleanup();

            setup({ isPlaying: true });
            expect(screen.getByRole("button", { name: "Pause" })).toBeTruthy();
        });

        it("wires each button to its handler", () => {
            const { props } = setup();

            fireEvent.click(screen.getByRole("button", { name: "Play" }));
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

        it.each([
            ["off", "Repeat off"],
            ["one", "Repeat one"],
            ["all", "Repeat all"],
        ] as const)("repeat mode %s is labelled %s", (repeatMode, label) => {
            setup({ repeatMode });

            expect(screen.getByRole("button", { name: label })).toBeTruthy();
        });

        it("reflects shuffle and mute state in labels", () => {
            setup({ isShuffle: true, isMuted: true });

            expect(screen.getByRole("button", { name: "Shuffle On" })).toBeTruthy();
            expect(screen.getByRole("button", { name: "Unmute" })).toBeTruthy();
        });
    });

    describe("sliders", () => {
        it("the seek slider reflects time and calls onHandleSeek", () => {
            const { props } = setup({ currentTime: 30, duration: 120, progressTrack: 25 });
            const seek = screen.getByLabelText("Seek") as HTMLInputElement;

            expect(seek.max).toBe("120");
            expect(seek.value).toBe("30");
            expect(seek.style.getPropertyValue("--progress")).toBe("25%");

            fireEvent.change(seek, { target: { value: "60" } });
            expect(props.onHandleSeek).toHaveBeenCalledTimes(1);
        });

        it("the volume slider reflects volume and calls onHandleVolumeChange", () => {
            const { props } = setup({ volume: 0.5 });
            const volume = screen.getByLabelText("Volume") as HTMLInputElement;

            expect(volume.value).toBe("0.5");

            fireEvent.change(volume, { target: { value: "0.2" } });
            expect(props.onHandleVolumeChange).toHaveBeenCalledTimes(1);
        });

        it("the volume slider shows 0 while muted", () => {
            setup({ volume: 0.5, isMuted: true });

            expect((screen.getByLabelText("Volume") as HTMLInputElement).value).toBe("0");
        });
    });

    describe("favorite button", () => {
        it("shows the correct icon and toggles the current track", () => {
            const { props } = setup({ isFavorited: true });
            const button = screen.getByLabelText("favorite");

            expect(button.querySelector("img")?.getAttribute("src")).toBe("/assets/favorite_icons/favorited.svg");

            fireEvent.click(button);
            expect(props.onAddToFavorites).toHaveBeenCalledWith(props.track);
        });
    });

    describe("playlist menu", () => {
        function openMenu() {
            fireEvent.click(screen.getByLabelText("playlist"));
        }

        it("is hidden by default and toggled by the playlist button", () => {
            const { container } = setup();
            expect(playlistMenu(container).className).toBe("PlaylistMenu hidden");

            openMenu();
            expect(playlistMenu(container).className).toBe("PlaylistMenu");

            openMenu();
            expect(playlistMenu(container).className).toBe("PlaylistMenu hidden");
        });

        it("closes when clicking outside the menu", () => {
            const { container } = setup();
            openMenu();

            fireEvent.mouseDown(document.body);

            expect(playlistMenu(container).className).toBe("PlaylistMenu hidden");
        });

        it("stays open when clicking inside the menu", () => {
            const { container } = setup();
            openMenu();

            fireEvent.mouseDown(screen.getByPlaceholderText("Playlist"));

            expect(playlistMenu(container).className).toBe("PlaylistMenu");
        });

        it("disables create until a non-blank name is entered", () => {
            setup();
            const create = screen.getByText("+") as HTMLButtonElement;
            const nameInput = screen.getByPlaceholderText("Playlist");

            expect(create.disabled).toBe(true);

            fireEvent.change(nameInput, { target: { value: "   " } });
            expect(create.disabled).toBe(true);

            fireEvent.change(nameInput, { target: { value: "Mix" } });
            expect(create.disabled).toBe(false);
        });

        it("creates a playlist with the current track and resets the input", () => {
            const { props } = setup();
            const nameInput = screen.getByPlaceholderText("Playlist") as HTMLInputElement;

            fireEvent.change(nameInput, { target: { value: "Mix" } });
            fireEvent.click(screen.getByText("+"));

            expect(props.onHandleCreatePlaylist).toHaveBeenCalledWith("Mix", props.track);
            expect(nameInput.value).toBe("");
            expect(snackbarText()).toBe("Playlist created!");
        });

        it("lists existing playlists and adds the current track to one", () => {
            const playlists = [makePlaylist("a", [], "Chill"), makePlaylist("b", [], "Gym")];
            const { props } = setup({ playlists });

            fireEvent.click(screen.getByText("Gym"));

            expect(props.onHandleAddToPlaylist).toHaveBeenCalledWith("b", props.track);
            expect(snackbarText()).toBe("Track added to Gym!");
        });
    });
});
