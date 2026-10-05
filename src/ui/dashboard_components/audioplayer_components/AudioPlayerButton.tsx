import type { AudioPlayerButtonProps } from "../../../utils/types";

export default function AudioPlayerButton({onClick, size, toggleAction, label, labelTrue, labelFalse, src, srcTrue, srcFalse}: AudioPlayerButtonProps) {

    if(toggleAction == undefined) {
        return (
            <>
                <button
                className="AudioPlayerButton"
                onClick={onClick}
                aria-label={label}>
                    <img
                    width={size}
                    height={size}
                    src={src} />
                </button>
            </>
        )
    }
    return (
        <>
            <button 
            className="AudioPlayerButton" 
            onClick={onClick} 
            aria-label={toggleAction ? labelTrue : labelFalse}>
                <img 
                width={size}
                height={size}
                src={toggleAction ? srcTrue : srcFalse} />
            </button>
        </>
    )
}
