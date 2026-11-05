import type { AudioPlayerProps, TrackObject } from "../../utils/types";

import { useRef, useState, useEffect, type ChangeEvent } from "react";

import { useSnackbar } from "../../hooks/SnackbarContext";
import AudioPlayerUI from "./audioplayer_components/AudioPlayerUI";

export default function AudioPlayer({track, tracks, currentTrackIndex, onSetCurrentTrackIndex, playlists, isPlaying, isFavorited, onHandleFetch, onHandleCreatePlaylist, onHandleAddToPlaylist, onAddToFavorites, onIsPlaying}: AudioPlayerProps) {
    
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    
    const [volume, setVolume] = useState(1);
    const [isMuted, setIsMuted] = useState(false);

    const [playlistName, setPlaylistName] = useState("");
    const [isPlaylistMenuVisible, setIsPlaylistMenuVisible] = useState(false);

    const [isShuffle, setIsShuffle] = useState(false);
    
    const [shuffleTrackQueue, setShuffleTrackQueue] = useState<TrackObject[]>([]);

    const [isScrolled, setIsScrolled] = useState(false);

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

    function handleOnEnded() {
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
    }

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (!playlistWrapperRef.current?.contains(e.target as Node)) { 
                setIsPlaylistMenuVisible(false)
            };
        }
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [])

    useEffect(() => {
        const handleScroll = () => {
            const scrollTop = document.body.scrollTop || document.documentElement.scrollTop;
            setIsScrolled(scrollTop > 555);
        }
        
        window.addEventListener("scroll", handleScroll)
        return () => window.removeEventListener("scroll", handleScroll)

    }, [])

    return (
        <>
            <audio
                loop={repeatMode === "one"}
                autoPlay 
                ref={audioRef}
                src={track.url || undefined}
                onPlay={() => onIsPlaying(true)}
                onPause={() => onIsPlaying(false)}
                onEnded={handleOnEnded}
                onLoadedData={handleLoadedMetadata}
                onTimeUpdate={handleTimeUpdate}
                onVolumeChange={handleElementVolumeChange} 
            />
            <AudioPlayerUI 
                track={track}
                playlists={playlists}
                duration={duration}
                currentTime={currentTime}
                isPlaying={isPlaying}
                isFavorited={isFavorited}
                isShuffle={isShuffle}
                isScrolled={isScrolled}
                isMuted={isMuted}
                volume={volume}
                repeatMode={repeatMode}
                REPEAT_MODES={REPEAT_MODES}
                playlistName={playlistName}
                isPlaylistMenuVisible={isPlaylistMenuVisible}
                playlistWrapperRef={playlistWrapperRef}
                onHandleSeek={handleSeek}
                onHandleShuffle={handleShuffle}
                onHandleRewind={handleRewind}
                onHandleTogglePlay={handleTogglePlay}
                onHandleFastForward={handleFastForward}
                onHandleToggleMute={handleToggleMute}
                onHandleVolumeChange={handleVolumeChange}
                onCycleRepeatMode={cycleRepeatMode}
                onAddToFavorites={onAddToFavorites}
                onHandleAddToPlaylist={onHandleAddToPlaylist}
                onHandleCreatePlaylist={onHandleCreatePlaylist}
                setPlaylistName={setPlaylistName}
                onSetIsPlaylistMenuVisible={setIsPlaylistMenuVisible}
            />
        </>
    )
}
