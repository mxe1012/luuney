import { useEffect, useState } from "react";
import { useRef } from "react";
import { useSnackbar } from "../../../../hooks/SnackbarContext";
import { formatTime } from "../../../../utils/helpers";
import type { AudioPlayerUIProps } from "../../../../utils/types";
import CoverImage from "../../../CoverImage";
import AudioPlayerButton from "../AudioPlayerButton";
import AudioPlayerModeButton from "../AudioPlayerModeButton";

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
    onHandleTogglePlay,
    onHandleFastForward,
    onHandleToggleMute,
    onHandleVolumeChange,
    onCycleRepeatMode,
    onAddToFavorites,
    onHandleAddToPlaylist,
    onHandleCreatePlaylist}: AudioPlayerUIProps) {

    const [playlistName, setPlaylistName] = useState("");
    const [isPlaylistMenuVisible, setIsPlaylistMenuVisible] = useState(false);
    
    const playlistWrapperRef = useRef<HTMLDivElement>(null);
    
    const { showSnackbar } = useSnackbar();

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
            <div className={isScrolled ? "AudioPlayer hidden" : "AudioPlayer"}>
                <div style={{display: "flex", justifyContent: "center"}}>
                    <CoverImage styles={{borderRadius: '15px', boxShadow: '0px 0px 10px'}} src={track.artwork} size={256}/>
                </div>
                <div className={track.title.length >= 22 ? "scroll-container" : ""}>
                    <h2 className={track.title.length >= 22 ? "scroll-text" : ""} style={{textAlign: "center", color: "#F3D9C7"}}>                    
                        {track.title}
                    </h2>
                    <h3 style={{textAlign: "center", color: "rgba(220, 204, 247, 0.75)"}}>{track.handle}</h3>   
                </div>
                <div style={{display: "flex", justifyContent: "center"}}>
                    <button className="ActionBtn" onClick={() => onAddToFavorites(track)}>
                        <img src={isFavorited ? "/assets/favorite_icons/favorited.svg" : "/assets/favorite_icons/not_favorited.svg"} aria-label="favorite" alt="favorite" />
                    </button>
                    <div className="PlaylistMenuWrapper">
                        <button className="ActionBtn" onClick={() => setIsPlaylistMenuVisible(!isPlaylistMenuVisible)}>
                            <img src={"/assets/audio_player_icons/playlist.svg"} aria-label="playlist" alt="playlist" />
                        </button>
                        <div
                        ref={playlistWrapperRef} 
                        className={isPlaylistMenuVisible ? "PlaylistMenu" : "PlaylistMenu hidden"}>
                            <div style={{display: 'flex', justifyContent: 'space-evenly', gap: '2px'}}>
                                <input className="PlaylistMenuInput" value={playlistName} placeholder="Playlist" 
                                    onChange={(e) => {
                                        setPlaylistName(e.target.value)
                                    }} 
                                    onClick={(e) => e.stopPropagation()} 
                                />
                                <button className="PlaylistMenuAddItemBtn" 
                                    disabled={playlistName.length == 0 ? true : false}
                                    onClick={() => { 
                                        onHandleCreatePlaylist(playlistName, track);
                                        setPlaylistName("");
                                        showSnackbar("Playlist created!");
                                    }}>
                                        +
                                </button>
                            </div>
                            <div >
                                <ul className="PlaylistMenuList">
                                {playlists.map((element) => (
                                    <li key={element.id}> 
                                        <button className="PlaylistMenuItem" onClick={() => {
                                            onHandleAddToPlaylist(element.id, track);
                                            showSnackbar("Track added to " + element.name + "!")
                                        }}>
                                            <p style={{margin: 0, padding: 0, minWidth: 0, flex: 1}}>{element.name}</p>
                                        </button>
                                    </li>
                                ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
                <div style={{display: "flex", justifyContent: "center"}}>
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
                <div style={{display: "flex", justifyContent: "space-between"}}>
                    <div>
                        <h4 style={{margin: 0, color: "rgba(220, 204, 247, 0.75)"}}>{formatTime(currentTime)}</h4>
                    </div>
                    <div>
                        <h4 style={{margin: 0, color: "rgba(220, 204, 247, 0.75)"}}>{formatTime(duration)}</h4>
                    </div>
                </div>
                <div style={{display: "flex", justifyContent: "space-evenly"}}>
                    <AudioPlayerButton 
                    onClick={onHandleShuffle} size={36} toggleAction={isShuffle} 
                    labelTrue="Shuffle On" labelFalse="Shuffle Off"
                    srcTrue="/assets/audio_player_icons/shuffle.svg" srcFalse="/assets/audio_player_icons/shuffle-off.svg" />
                    <AudioPlayerButton onClick={onHandleRewind} size={36} label="Rewind" src="/assets/audio_player_icons/rewind.svg" />
                    <AudioPlayerButton 
                    onClick={onHandleTogglePlay} size={64} toggleAction={isPlaying} 
                    labelTrue="Pause" labelFalse="Play"
                    srcTrue="/assets/audio_player_icons/pause.svg" srcFalse="/assets/audio_player_icons/play.svg" />
                    <AudioPlayerButton onClick={onHandleFastForward} size={36} label="Fast Forward" src="/assets/audio_player_icons/fast-forward.svg" />
                    <AudioPlayerModeButton
                        size={36}
                        onClick={onCycleRepeatMode}
                        states={[
                            { label: "Repeat off", src: "/assets/audio_player_icons/repeat-off.svg" },
                            { label: "Repeat one", src: "/assets/audio_player_icons/repeat-once.svg" },
                            { label: "Repeat all", src: "/assets/audio_player_icons/repeat-all.svg" },
                        ]}
                        stateIndex={REPEAT_MODES.indexOf(repeatMode)}
                    />
                </div>
                <div style={{display: "flex", justifyContent: "space-evenly"}}>
                    <AudioPlayerButton
                    onClick={onHandleToggleMute} size={40} toggleAction={isMuted}
                    labelTrue="Unmute" labelFalse="Mute"
                    srcTrue="/assets/audio_player_icons/volume-muted.svg" srcFalse="/assets/audio_player_icons/volume.svg" />
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