import { vi } from "vitest";
import type { AudioPlayerUIProps } from "../utils/types";
import { makeTrack } from "./fixtures";

// Default props for MainAudioPlayer / MiniAudioPlayer tests.
export function makeAudioPlayerUIProps(overrides: Partial<AudioPlayerUIProps> = {}): AudioPlayerUIProps {
    return {
        track: makeTrack(1),
        playlists: [],
        duration: 200,
        currentTime: 65,
        isPlaying: false,
        isFavorited: false,
        isShuffle: false,
        isScrolled: false,
        isMuted: false,
        volume: 0.8,
        repeatMode: "off",
        REPEAT_MODES: ["off", "one", "all"] as const,
        progressTrack: 32.5,
        progressVolume: 80,
        onHandleSeek: vi.fn(),
        onHandleShuffle: vi.fn(),
        onHandleRewind: vi.fn(),
        onHandleTogglePlay: vi.fn().mockResolvedValue(undefined),
        onHandleFastForward: vi.fn(),
        onHandleToggleMute: vi.fn(),
        onHandleVolumeChange: vi.fn(),
        onCycleRepeatMode: vi.fn(),
        onAddToFavorites: vi.fn(),
        onHandleAddToPlaylist: vi.fn(),
        onHandleCreatePlaylist: vi.fn(),
        ...overrides,
    };
}
