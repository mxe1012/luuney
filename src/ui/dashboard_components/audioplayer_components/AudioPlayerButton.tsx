import type { AudioPlayerButtonProps } from "../../../utils/types";

export default function AudioPlayerButton({onClick, size, isPlaying, isMuted, alTrue, alFalse, srcTrue, srcFalse}: AudioPlayerButtonProps) {

    const isAction = isMuted == undefined ? isPlaying : isMuted;

    return (
        <>
            <button 
            className="AudioPlayerButton" 
            onClick={onClick} 
            aria-label={isAction ? alTrue : alFalse}>
                <img 
                width={size}
                height={size}
                src={isAction ? srcTrue : srcFalse} 
                />
            </button>
        </>
    )
}
