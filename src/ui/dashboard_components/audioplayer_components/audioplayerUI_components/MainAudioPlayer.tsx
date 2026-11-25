import { useEffect, useState } from "react";
import { useRef } from "react";
import { formatTime, switchVolumeIcon } from "../../../../utils/helpers";
import type { AudioPlayerUIProps } from "../../../../utils/types";
import CoverImage from "../../../CoverImage";
import AudioPlayerButton from "../AudioPlayerButton";
import AudioPlayerModeButton from "../AudioPlayerModeButton";
import AddToPlaylist from "../../../AddToPlaylist";

export default function MainAudioPlayer({
    track,
    playlists,
    duration,
    currentTime,
    isPlaying,
    isFavorited,
    isShuffle,
    isScrolled,
    isMuted,
    volume,
    repeatMode,
    REPEAT_MODES,
    progressTrack,
    progressVolume,
    onHandleSeek,
    onHandleShuffle,
    onHandleRewind,
    onHandleSkipNext,
    onHandleTogglePlay,
    onHandleSkipPrev,
    onHandleFastForward,
    onHandleToggleMute,
    onHandleVolumeChange,
    onCycleRepeatMode,
    onAddToFavorites,
    onHandleAddToPlaylist,
    onHandleCreatePlaylist,
    onHandleUpNextVisibility}: AudioPlayerUIProps) {

    const [isPlaylistMenuVisible, setIsPlaylistMenuVisible] = useState(false);
    
    const playlistWrapperRef = useRef<HTMLDivElement>(null);
    
    const isLongTitle = track.title.length >= 22;

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (!playlistWrapperRef.current?.contains(e.target as Node)) { 
                setIsPlaylistMenuVisible(false)
            };
        }
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [])

    return (
        <>
            <div className={isScrolled ? "GlassCard AudioPlayer hidden" : "GlassCard AudioPlayer"}>
                <div className="RowCenter">
                    <CoverImage styles={{borderRadius: '15px', boxShadow: '0px 0px 10px'}} src={track.artwork} size={256}/>
                </div>
                <div className="PlayerTitle">
                    <h2 className={isLongTitle ? "ScrollContainer CreamColor CenterText" : "CreamColor CenterText"}>
                        {isLongTitle ? <span className="ScrollText">{track.title}</span> : track.title}
                    </h2>
                    <h3 className="MutedLavenderColor CenterText">{track.handle}</h3>   
                </div>
                <div className="RowCenter ActionButtonRow">
                    <div className="PlaylistMenuWrapper">
                        <button className="ActionBtn" onClick={() => setIsPlaylistMenuVisible(!isPlaylistMenuVisible)} aria-label="playlist menu">
                            <img src={"/assets/audio_player_icons/plus.svg"} alt="playlist menu" />
                        </button>
                        <div
                        ref={playlistWrapperRef} 
                        className={isPlaylistMenuVisible ? "PlaylistMenu" : "PlaylistMenu hidden"}>
                            <AddToPlaylist
                                track={track}
                                playlists={playlists}
                                onHandleAddToPlaylist={onHandleAddToPlaylist}
                                onHandleCreatePlaylist={onHandleCreatePlaylist}
                            />
                        </div>
                    </div>
                    <button className="ActionBtn" onClick={() => onAddToFavorites(track)} aria-label="favorite">
                        <img src={isFavorited ? "/assets/favorite_icons/favorited.svg" : "/assets/favorite_icons/not_favorited.svg"} alt="favorite" />
                    </button>
                    <button className="ActionBtn" onClick={onHandleUpNextVisibility} aria-label="queue">
                        <img src={"/assets/audio_player_icons/playlist.svg"} alt="queue" />
                    </button>
                </div>
                <div className="RowCenter">
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
                        aria-label="Seek" />
                </div>
                <div className="RowBetween">
                    <div>
                        <h4 className="MutedLavenderColor NoMargin"><time>{formatTime(currentTime)}</time></h4>
                    </div>
                    <div>
                        <h4 className="MutedLavenderColor NoMargin"><time>{formatTime(duration)}</time></h4>
                    </div>
                </div>
                <div className="RowEvenly">
                    <AudioPlayerButton 
                    onClick={onHandleShuffle} size={20} toggleAction={isShuffle} 
                    labelTrue="Shuffle On" labelFalse="Shuffle Off"
                    srcTrue="/assets/audio_player_icons/shuffle.svg" srcFalse="/assets/audio_player_icons/shuffle-off.svg" />
                    <AudioPlayerButton onClick={onHandleRewind} size={20} label="Rewind" src="/assets/audio_player_icons/rewind.svg" />
                    <AudioPlayerButton onClick={onHandleSkipPrev} size={22} label="Previous" src="/assets/audio_player_icons/skip-prev.svg" />
                    <AudioPlayerButton 
                    onClick={onHandleTogglePlay} size={48} toggleAction={isPlaying} 
                    labelTrue="Pause" labelFalse="Play"
                    srcTrue="/assets/audio_player_icons/pause.svg" srcFalse="/assets/audio_player_icons/play.svg" />
                    <AudioPlayerButton onClick={onHandleSkipNext} size={22} label="Next" src="/assets/audio_player_icons/skip-next.svg" />
                    <AudioPlayerButton onClick={onHandleFastForward} size={20} label="Fast Forward" src="/assets/audio_player_icons/fast-forward.svg" />
                    <AudioPlayerModeButton
                        size={20}
                        onClick={onCycleRepeatMode}
                        states={[
                            { label: "Repeat off", src: "/assets/audio_player_icons/repeat-off.svg" },
                            { label: "Repeat one", src: "/assets/audio_player_icons/repeat-once.svg" },
                            { label: "Repeat all", src: "/assets/audio_player_icons/repeat-all.svg" },
                        ]}
                        stateIndex={REPEAT_MODES.indexOf(repeatMode)}
                    />
                </div>
                <div className="RowEvenly">
                    <AudioPlayerButton
                    onClick={onHandleToggleMute} size={24} toggleAction={isMuted}
                    labelTrue="Unmute" labelFalse="Mute"
                    srcTrue="/assets/audio_player_icons/volume-muted.svg" srcFalse={switchVolumeIcon(volume)} />
                    <input
                        className="progress-slider" 
                        style={{ "--progress": `${progressVolume}%` } as React.CSSProperties}
                        type="range"
                        min={0}
                        max={1}
                        step={0.01}
                        value={isMuted ? 0 : volume}
                        onChange={onHandleVolumeChange}
                        aria-label="Volume" />
                </div>
            </div>
        </>
    )
}