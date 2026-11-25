import { useEffect, useEffectEvent } from "react";

import type { MediaSessionHandlers, TrackObject } from "../utils/types";

const ACTIONS: MediaSessionAction[] = [
    "play", "pause", "nexttrack", "previoustrack", "seekbackward", "seekforward", "seekto"
];

// connects the player to the browser's media controls: media keys, the lock screen, and the system's media panel
export function useMediaSession(track: TrackObject, currentTime: number, duration: number, handlers: MediaSessionHandlers) {

    // an effect event always calls the latest handlers, so the action handlers are only registered once
    const onMediaAction = useEffectEvent(({ action, seekTime }: MediaSessionActionDetails) => {
        if (action === "play") handlers.onTogglePlay();
        if (action === "pause") handlers.onTogglePlay();
        if (action === "nexttrack") handlers.onSkipNext();
        if (action === "previoustrack") handlers.onSkipPrev();
        if (action === "seekbackward") handlers.onRewind();
        if (action === "seekforward") handlers.onFastForward();
        if (action === "seekto" && seekTime !== undefined) handlers.onSeekTo(seekTime);
    });

    useEffect(() => {
        if (!track.url) return;

        if ("mediaSession" in navigator) {
            navigator.mediaSession.metadata = new MediaMetadata({
                title: track.title,
                artist: track.handle,
                artwork: [{ src: track.artwork, sizes: "480x480" }],
            });
        }
    }, [track]);

    useEffect(() => {
        if (!("mediaSession" in navigator)) return;

        // setPositionState throws on an invalid duration or a position past the end,
        // which can happen briefly before a new track's duration has loaded.
        if (!Number.isFinite(duration) || duration <= 0) return;

        navigator.mediaSession.setPositionState({
            duration,
            position: Math.min(Math.max(currentTime, 0), duration),
        });
    }, [currentTime, duration]);

    useEffect(() => {
        if (!("mediaSession" in navigator)) return;

        ACTIONS.forEach((action) => navigator.mediaSession.setActionHandler(action, (details) => onMediaAction(details)));

        return () => ACTIONS.forEach((action) => navigator.mediaSession.setActionHandler(action, null));
    }, []);
}
