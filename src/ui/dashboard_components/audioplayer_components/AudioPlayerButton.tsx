import type { AudioPlayerButtonProps } from "../../../utils/types";

export default function AudioPlayerButton({onClick, size, isPlaying, isMuted, label, labelTrue, labelFalse, src, srcTrue, srcFalse}: AudioPlayerButtonProps) {

    const isBooleanAction = isMuted == undefined ? isPlaying : isMuted;

    if(isBooleanAction == undefined) {
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
            aria-label={isBooleanAction ? labelTrue : labelFalse}>
                <img 
                width={size}
                height={size}
                src={isBooleanAction ? srcTrue : srcFalse} />
            </button>
        </>
    )
}
