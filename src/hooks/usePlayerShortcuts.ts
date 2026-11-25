import { useEffect, useEffectEvent } from "react";

import type { PlayerShortcutHandlers } from "../utils/types";

const VOLUME_SHORTCUT_STEP = 0.05;

// keyboard shortcuts for the player: space plays and pauses, M mutes, + / - change the volume, and the arrow keys seek
export function usePlayerShortcuts(handlers: PlayerShortcutHandlers) {

    // an effect event always calls the latest handlers, so the listener is only added once
    const onKeyDown = useEffectEvent((event: KeyboardEvent) => {
        const target = event.target as HTMLElement;
        // letters typed into a text field, such as the search box, are not shortcuts; the sliders are range inputs, so they still allow them
        const isTyping = target.isContentEditable || target.tagName === "TEXTAREA" || target.tagName === "SELECT"
            || (target instanceof HTMLInputElement && target.type !== "range");

        // browser shortcuts such as Ctrl+M are left alone
        if (isTyping || event.ctrlKey || event.metaKey || event.altKey) return;

        if (event.key === " ") {
            // stops the page from scrolling, and a focused button from also being clicked, which would undo the toggle
            event.preventDefault();
            // holding the key down does not toggle repeatedly
            if (!event.repeat) handlers.onTogglePlay();
        }

        if (event.key.toLowerCase() === "m" && !event.repeat) handlers.onToggleMute();

        // "=" is the unshifted "+" key, so the volume can be raised without holding Shift
        if (event.key === "+" || event.key === "=") handlers.onChangeVolume(VOLUME_SHORTCUT_STEP);
        if (event.key === "-") handlers.onChangeVolume(-VOLUME_SHORTCUT_STEP);

        // a focused slider already moves itself with the arrow keys, so seeking as well would do both
        const isSlider = target instanceof HTMLInputElement && target.type === "range";
        if (isSlider) return;

        // seeking keeps going while an arrow key is held down
        if (event.key === "ArrowLeft") handlers.onRewind();
        if (event.key === "ArrowRight") handlers.onFastForward();
    });

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => onKeyDown(event);

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);
}
