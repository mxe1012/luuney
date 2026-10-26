import type { AudioPlayerProps, TrackObject } from "../../utils/types";

import { useRef, useState, useEffect, type ChangeEvent } from "react";

import { formatTime } from "../../utils/helpers";

import AudioPlayerButton from "./audioplayer_components/AudioPlayerButton";
import AudioPlayerModeButton from "./audioplayer_components/AudioPlayerModeButton";

import CoverImage from "../CoverImage";
import { useSnackbar } from "../../hooks/SnackbarContext";

export default function AudioPlayer({track, tracks, currentTrackIndex, onSetCurrentTrackIndex, playlists, isPlaying, isFavorited, onHandleFetch, onHandleCreatePlaylist, onHandleAddToPlaylist, onAddToFavorites, onIsPlaying}: AudioPlayerProps) {
    
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    
    const [volume, setVolume] = useState(1);
    const [isMuted, setIsMuted] = useState(false);

    const [playlistName, setPlaylistName] = useState("");
    const [isPlaylistMenuVisible, setIsPlaylistMenuVisible] = useState(false);

    const [isShuffle, setIsShuffle] = useState(false);
    
    const [shuffleTrackQueue, setShuffleTrackQueue] = useState<TrackObject[]>([]);

    const audioRef = useRef<HTMLAudioElement>(null);
    const playlistWrapperRef = useRef<HTMLDivElement>(null);

    const REPEAT_MODES = ["off", "one", "all"] as const;
    type RepeatMode = (typeof REPEAT_MODES)[number];

    const [repeatMode, setRepeatMode] = useState<RepeatMode>("off");

    const cycleRepeatMode = () => {
        setRepeatMode(
            (m) => REPEAT_MODES[(REPEAT_MODES.indexOf(m) + 1) % REPEAT_MODES.length]
        );
    }
    
    const { showSnackbar } = useSnackbar();
    
    function handleShuffle() {

        const nextIsShuffle = !isShuffle;
        const activeQueue = isShuffle ? shuffleTrackQueue : tracks;
        const playing = activeQueue[currentTrackIndex];

        setIsShuffle(nextIsShuffle);

        if (nextIsShuffle) {
            const rest = tracks
                .filter(track => track.track_id !== playing?.track_id)
                .map(value => ({ value, sort: Math.random() }))
                .sort((a, b) => a.sort - b.sort)
                .map(({ value }) => value);

            // playing track goes first, so the rest of the shuffle follows it
            setShuffleTrackQueue(playing ? [playing, ...rest] : rest);
            onSetCurrentTrackIndex(0);
            showSnackbar("Shuffle Enabled!")
        } 
        else {
            const originalIndex = tracks.findIndex(track => track.track_id === playing?.track_id);
            if (originalIndex !== -1) onSetCurrentTrackIndex(originalIndex);
            showSnackbar("Shuffle Disabled!")
        }

    }

    async function handleTogglePlay() {
        const audio = audioRef.current;
    
        if(!audio) return;
    
        if (audio.paused) {
            try {
                await audio.play();
            }
            catch (e) {
                console.error("Playback failed: ", e);
                showSnackbar("Playback failed!");
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

        const newTime = audio.currentTime + 10;

        audio.currentTime = newTime;

        setCurrentTime(newTime)
    }

    function handleRewind() {
        const audio = audioRef.current;
        if(!audio) return;

        const newTime = audio.currentTime - 10;

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
                loop={repeatMode === "one"} 
                ref={audioRef}
                src={track.url || undefined}
                onPlay={() => onIsPlaying(true)}
                onPause={() => onIsPlaying(false)}
                onEnded={() => {
                    const currentQueue = isShuffle ? shuffleTrackQueue : tracks
                    let nextIndex = currentTrackIndex + 1;

                    if(currentQueue.length <= 1 && repeatMode === "all") {
                        setCurrentTime(0);
                        audioRef.current?.play();
                        return
                    }

                    if (nextIndex >= currentQueue.length) {
                        if (repeatMode === "off") {
                            onIsPlaying(false); // end of queue
                            return;
                        }
                        else if (repeatMode === "all") {
                            nextIndex = 0;
                        }
                    }
                    onSetCurrentTrackIndex(nextIndex);
                    onHandleFetch(currentQueue[nextIndex].track_id);
                }}
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
                                    <li> 
                                        <button className="PlaylistMenuItem" key={element.id} onClick={() => {
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
                    <AudioPlayerButton 
                    onClick={handleShuffle} size={36} toggleAction={isShuffle} 
                    labelTrue="Shuffle On" labelFalse="Shuffle Off"
                    srcTrue="/assets/audio_player_icons/shuffle.svg" srcFalse="/assets/audio_player_icons/shuffle-off.svg" />
                    <AudioPlayerButton onClick={handleRewind} size={36} label="Rewind" src="/assets/audio_player_icons/rewind.svg" />
                    <AudioPlayerButton 
                    onClick={handleTogglePlay} size={64} toggleAction={isPlaying} 
                    labelTrue="Pause" labelFalse="Play"
                    srcTrue="/assets/audio_player_icons/pause.svg" srcFalse="/assets/audio_player_icons/play.svg" />
                    <AudioPlayerButton onClick={handleFastForward} size={36} label="Fast Forward" src="/assets/audio_player_icons/fast-forward.svg" />
                    <AudioPlayerModeButton
                        size={36}
                        onClick={cycleRepeatMode}
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
