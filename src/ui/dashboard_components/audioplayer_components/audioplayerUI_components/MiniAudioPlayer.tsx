import type { AudioPlayerUIProps } from "../../../../utils/types";
import CoverImage from "../../../CoverImage";
import AudioPlayerButton from "../AudioPlayerButton";

// Roughly how many characters fit under the 100px cover; longer titles scroll.
const MINI_TITLE_SCROLL_LENGTH = 14;

export default function MiniAudioPlayer({
    track,
    duration,
    currentTime,
    volume,
    isPlaying,
    isMuted,
    isScrolled,
    progressTrack,
    progressVolume,
    onHandleVolumeChange,
    onHandleSeek,
    onHandleSkipPrev,
    onHandleTogglePlay,
    onHandleSkipNext,
    onHandleToggleMute }: AudioPlayerUIProps) {

    const isLongTitle = track.title.length > MINI_TITLE_SCROLL_LENGTH;

    return (
        <>
            <div className={isScrolled ? "MiniAudioPlayer" : "MiniAudioPlayer hidden"}>
                <div className="ListCover MiniCover">
                    <CoverImage styles={{borderRadius: "15px"}} src={track.artwork} size={100}/>
                    <div className="MiniTitle" title={track.title}>
                        <p className={isLongTitle ? "MiniTitleText MiniScrollText" : "MiniTitleText"}>
                            {track.title}
                        </p>
                    </div>
                </div>
                <div className="MiniInfo">
                    <div className="MiniSeek">
                        <input 
                            className="progress-slider" 
                            style={{ "--progress": `${progressTrack}%` } as React.CSSProperties}
                            type="range"
                            min={0}
                            max={duration}
                            step={0.1}
                            value={currentTime}
                            onChange={onHandleSeek} 
                            disabled={false}
                            aria-label="Seek" 
                        />
                    </div>
                    <div className="RowEvenly">
                        <AudioPlayerButton onClick={onHandleSkipPrev} size={36} label="Previous" src="/assets/audio_player_icons/skip-prev.svg" />
                        <AudioPlayerButton 
                        onClick={onHandleTogglePlay} size={64} toggleAction={isPlaying} 
                        labelTrue="Pause" labelFalse="Play"
                        srcTrue="/assets/audio_player_icons/pause.svg" srcFalse="/assets/audio_player_icons/play.svg" />
                        <AudioPlayerButton onClick={onHandleSkipNext} size={36} label="Next" src="/assets/audio_player_icons/skip-next.svg" />
                    </div>
                    <div className="RowStart">
                        <AudioPlayerButton
                            onClick={onHandleToggleMute} size={40} toggleAction={isMuted}
                            labelTrue="Unmute" labelFalse="Mute"
                            srcTrue="/assets/audio_player_icons/volume-muted.svg" srcFalse="/assets/audio_player_icons/volume.svg" 
                        />
                        <input
                            className="progress-slider" 
                            style={{ "--progress": `${progressVolume}%` } as React.CSSProperties}
                            type="range"
                            min={0}
                            max={1}
                            step={0.01}
                            value={isMuted ? 0 : volume}
                            onChange={onHandleVolumeChange}
                            aria-label="Volume" 
                        />
                    </div>
                </div>
            </div>
        </>
    )
}