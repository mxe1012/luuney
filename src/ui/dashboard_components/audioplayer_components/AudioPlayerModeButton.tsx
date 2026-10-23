import type { AudioPlayerButtonProps } from "../../../utils/types";

export default function AudioPlayerModeButton({onClick, size, toggleAction, label, labelTrue, labelFalse, src, srcTrue, srcFalse, states, stateIndex = 0}: AudioPlayerButtonProps) {

    let resolvedLabel = label;
    let resolvedSrc = src;

    if (states && states.length > 0) {
        // multi-state mode (e.g. repeat off / one / all)
        const current = states[stateIndex] ?? states[0];
        resolvedLabel = current.label;
        resolvedSrc = current.src;
    } 
    else if (toggleAction !== undefined) {
        // two-state mode
        resolvedLabel = toggleAction ? labelTrue : labelFalse;
        resolvedSrc = toggleAction ? srcTrue : srcFalse;
    }

    return (
        <button
            className="AudioPlayerButton"
            onClick={onClick}
            aria-label={resolvedLabel}
        >
            <img width={size} height={size} src={resolvedSrc} alt="" />
        </button>
    );
}
