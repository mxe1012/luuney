import type { AudioPlayerProps } from "../../utils/types";

import { useRef, useState, useEffect, type ChangeEvent } from "react";

import { formatTime } from "../../utils/helpers";

import AudioPlayerButton from "./audioplayer_components/AudioPlayerButton";

import CoverImage from "../CoverImage";
import { useSnackbar } from "../../hooks/SnackbarContext";

export default function AudioPlayer({track, playlists, isPlaying, isFavorited, onHandleCreatePlaylist, onHandleAddToPlaylist, onAddToFavorites, onIsPlaying}: AudioPlayerProps) {

    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    
    const [volume, setVolume] = useState(1);
    const [isMuted, setIsMuted] = useState(false);

    const [playlistName, setPlaylistName] = useState("");
    const [isPlaylistMenuVisible, setIsPlaylistMenuVisible] = useState(false);

    const [isLoop, setIsLoop] = useState(false);

    const audioRef = useRef<HTMLAudioElement>(null);
    const playlistWrapperRef = useRef<HTMLDivElement>(null);

    const { showSnackbar } = useSnackbar();
    async function handleTogglePlay() {
        const audio = audioRef.current;
    
        if(!audio) return;
    
        if (audio.paused) {
            try {
                await audio.play();
            }
            catch (e) {
                console.error("Playback failed: ", e);
            }
        }
        else {
            audio.pause();
        }
    }
    
    function handleLoadedMetadata() {
        const audio = audioRef.current;
    
        if (!audio) return;
        setDuration(audio.duration);
    }
    
    function handleTimeUpdate() {
        const audio = audioRef.current;
    
        if(!audio) return;
        setCurrentTime(audio.currentTime);
    }
    
    function handleSeek(e: ChangeEvent<HTMLInputElement>) {
        const audio = audioRef.current;
    
        if(!audio) return;
    
        const newTime = Number(e.target.value);
    
        audio.currentTime = newTime;
    
        setCurrentTime(newTime);
    }

    function handleFastForward() {
        const audio = audioRef.current;
        if(!audio) return;

        const newTime = audio.currentTime + 5;

        audio.currentTime = newTime;

        setCurrentTime(newTime)
    }

    function handleRewind() {
        const audio = audioRef.current;
        if(!audio) return;

        const newTime = audio.currentTime - 5;

        audio.currentTime = newTime;

        setCurrentTime(newTime)
    }

    function handleVolumeChange(e: ChangeEvent<HTMLInputElement>) {
        const audio = audioRef.current;
        if (!audio) return;

        const newVolume = Number(e.target.value);

        audio.volume = newVolume;

        if (audio.muted && newVolume > 0) {
            audio.muted = false;
        }
    };

    function handleToggleMute() {
        const audio = audioRef.current;
        if (!audio) return;

        if (audio.muted && audio.volume === 0) {
            audio.volume = 0.5;
        }

        audio.muted = !audio.muted;
    };

    function handleElementVolumeChange() {
        const audio = audioRef.current;
        if (!audio) return;

        setVolume(audio.volume);
        setIsMuted(audio.muted);
    };

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
            <audio
                loop={isLoop} 
                ref={audioRef}
                src={track.url || undefined}
                onPlay={() => onIsPlaying(true)}
                onPause={() => onIsPlaying(false)}
                onEnded={() => onIsPlaying(false)}
                onLoadedData={handleLoadedMetadata}
                onTimeUpdate={handleTimeUpdate}
                onVolumeChange={handleElementVolumeChange} 
            />
            <div className="AudioPlayer">
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
                                <button className="PlaylistMenuItem" 
                                disabled={playlistName.length == 0 ? true : false}
                                onClick={() => { 
                                    onHandleCreatePlaylist(playlistName, track);
                                    setPlaylistName("");
                                    showSnackbar("Playlist created!");
                                }}>
                                        +
                                    </button>
                            </div>
                            <div className="PlaylistMenuList">
                                {playlists.map((element) => (
                                    <button className="PlaylistMenuItem" key={element.id} onClick={() => {
                                        onHandleAddToPlaylist(element.id, track);
                                        showSnackbar("Track added to " + element.name + "!")
                                    }}>
                                        <p style={{margin: 0, padding: 0, minWidth: 0, flex: 1}}>{element.name}</p>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
                <div style={{display: "flex", justifyContent: "center"}}>
                    <input 
                        type="range"
                        min={0}
                        max={duration}
                        step={0.1}
                        value={currentTime}
                        onChange={handleSeek} 
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
                    <AudioPlayerButton onClick={handleRewind} size={36} label="Shuffle" src="/assets/audio_player_icons/shuffle.svg" />
                    <AudioPlayerButton onClick={handleRewind} size={36} label="Rewind" src="/assets/audio_player_icons/rewind.svg" />
                    <AudioPlayerButton 
                    onClick={handleTogglePlay} size={64} toggleAction={isPlaying} 
                    labelTrue="Pause" labelFalse="Play"
                    srcTrue="/assets/audio_player_icons/pause.svg" srcFalse="/assets/audio_player_icons/play.svg" />
                    <AudioPlayerButton onClick={handleFastForward} size={36} label="Fast Forward" src="/assets/audio_player_icons/fast-forward.svg" />
                    <AudioPlayerButton onClick={() => {setIsLoop(!isLoop)}} size={36} toggleAction={isLoop}
                    labelTrue="Repeat Once" labelFalse="Repeat Off"
                    srcTrue="/assets/audio_player_icons/repeat-once.svg" srcFalse="/assets/audio_player_icons/repeat-off.svg" />
                </div>
                <div style={{display: "flex", justifyContent: "space-evenly"}}>
                    <AudioPlayerButton
                    onClick={handleToggleMute} size={40} toggleAction={isMuted}
                    labelTrue="Unmute" labelFalse="Mute"
                    srcTrue="/assets/audio_player_icons/volume-muted.svg" srcFalse="/assets/audio_player_icons/volume.svg" />
                    <input
                        type="range"
                        min={0}
                        max={1}
                        step={0.01}
                        value={isMuted ? 0 : volume}
                        onChange={handleVolumeChange}
                        aria-label="Volume" />
                </div>
            </div>
        </>
    )
}
