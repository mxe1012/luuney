import type { AudioPlayerButtonProps } from "../../../utils/types";

export default function AudioPlayerButton({onClick, size, isPlaying, isMuted, al, alTrue, alFalse, src, srcTrue, srcFalse}: AudioPlayerButtonProps) {

    const isBooleanAction = isMuted == undefined ? isPlaying : isMuted;

    if(isBooleanAction == undefined) {
        return (
            <>
                <button
                className="AudioPlayerButton"
                onClick={onClick}
                aria-label={al}>
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
            aria-label={isBooleanAction ? alTrue : alFalse}>
                <img 
                width={size}
                height={size}
                src={isBooleanAction ? srcTrue : srcFalse} />
            </button>
        </>
    )
}
