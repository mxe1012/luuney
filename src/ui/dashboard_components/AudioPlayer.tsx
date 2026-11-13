import type { AudioPlayerProps, TrackObject } from "../../utils/types";

import { useRef, useState, useEffect, type ChangeEvent, useEffectEvent } from "react";

import { useSnackbar } from "../../hooks/SnackbarContext";
import AudioPlayerUI from "./audioplayer_components/AudioPlayerUI";
import Visualizer from "./audioplayer_components/Visualizer";

const SCROLL_THRESHOLD = 555; 
const SKIP_PREV_THRESHOLD = 3;

export default function AudioPlayer({track, tracks, currentTrackIndex, onSetCurrentTrackIndex, playlists, isPlaying, isFavorited, onHandleFetch, onHandleCreatePlaylist, onHandleAddToPlaylist, onAddToFavorites, onIsPlaying}: AudioPlayerProps) {
    
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    
    const [volume, setVolume] = useState(1);
    const [isMuted, setIsMuted] = useState(false);

    const [isShuffle, setIsShuffle] = useState(false);
    
    const [shuffleTrackQueue, setShuffleTrackQueue] = useState<TrackObject[]>([]);

    const [isScrolled, setIsScrolled] = useState(false);

    const audioRef = useRef<HTMLAudioElement>(null);

    const REPEAT_MODES = ["off", "one", "all"] as const;
    type RepeatMode = (typeof REPEAT_MODES)[number];

    const [repeatMode, setRepeatMode] = useState<RepeatMode>("off");

    const progressTrack = duration > 0 ? (currentTime / duration) * 100 : 0;
    const progressVolume = (volume > 0 && !isMuted) ? volume * 100 : 0;

    const onMediaAction = useEffectEvent(({ action, seekTime }: MediaSessionActionDetails) => {
        if (action === "play") handleTogglePlay();
        if (action === "pause") handleTogglePlay();
        if (action === "nexttrack") handleSkipNext();
        if (action === "previoustrack") handleSkipPrev();
        if (action === "seekbackward") handleRewind();
        if (action === "seekforward") handleFastForward();
        if (action === "seekto" && seekTime !== undefined && audioRef.current) {
            audioRef.current.currentTime = seekTime;
            setCurrentTime(seekTime);
        }
    });

    const cycleRepeatMode = () => {
        const nextMode = REPEAT_MODES[(REPEAT_MODES.indexOf(repeatMode) + 1) % REPEAT_MODES.length];
        
        setRepeatMode(nextMode);
        showSnackbar("Repeat, " + nextMode);
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

        setCurrentTime(newTime > duration ? duration : newTime)
    }

    function handleRewind() {
        const audio = audioRef.current;
        if(!audio) return;

        const newTime = audio.currentTime - 10;

        audio.currentTime = newTime;

        setCurrentTime(newTime < 0 ? 0 : newTime)
    }

    function handleVolumeChange(e: ChangeEvent<HTMLInputElement>) {
        const audio = audioRef.current;
        if (!audio) return;

        const newVolume = Number(e.target.value);

        audio.volume = newVolume;

        if (audio.muted && newVolume > 0) {
            audio.muted = false;
        }

        showSnackbar("Volume: " + Math.round(newVolume * 100))
    };

    function handleToggleMute() {
        const audio = audioRef.current;
        if (!audio) return;

        if (audio.muted && audio.volume === 0) {
            audio.volume = 0.5;
        }

        audio.muted = !audio.muted;
        showSnackbar(!isMuted ? "Audio muted!" : "Audio unmuted!")
    };

    function handleElementVolumeChange() {
        const audio = audioRef.current;
        if (!audio) return;

        setVolume(audio.volume);
        setIsMuted(audio.muted);
    };

    function handleSkipNext() {
        const currentQueue = isShuffle ? shuffleTrackQueue : tracks;

        if (currentQueue.length  <= 1 ) return;

        const next = currentTrackIndex < (currentQueue.length - 1) ? currentTrackIndex + 1 : 0;

        onSetCurrentTrackIndex(next)
        onHandleFetch(currentQueue[next].track_id)
    }

    function handleSkipPrev() {
        const audio = audioRef.current;
        if(!audio) return;

        const currentQueue = isShuffle ? shuffleTrackQueue : tracks;

        if (currentQueue.length  <= 1 ) return;

        const prev = currentTrackIndex > 0 ? currentTrackIndex - 1 : (currentQueue.length - 1);
        
        if (currentTime > SKIP_PREV_THRESHOLD) {
            audio.currentTime = 0;
            setCurrentTime(audio.currentTime);
        }
        else {
        onSetCurrentTrackIndex(prev)
        onHandleFetch(currentQueue[prev].track_id)
        }
    }

    function handleOnEnded() {
        const currentQueue = isShuffle ? shuffleTrackQueue : tracks;
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
        if (!isShuffle) return;

        const playing = tracks[currentTrackIndex];
        const rest = tracks
            .filter(track => track.track_id !== playing?.track_id)
            .map(value => ({ value, sort: Math.random() }))
            .sort((a, b) => a.sort - b.sort)
            .map(({ value }) => value);

        // eslint-disable-next-line react-hooks/set-state-in-effect
        setShuffleTrackQueue(playing ? [playing, ...rest] : rest);
        onSetCurrentTrackIndex(0);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tracks]);

    useEffect(() => {

        const handleScroll = () => {
            const scrollTop = document.body.scrollTop || document.documentElement.scrollTop;
            setIsScrolled(scrollTop > SCROLL_THRESHOLD);
        }
        
        window.addEventListener("scroll", handleScroll)
        return () => window.removeEventListener("scroll", handleScroll)

    }, [])

    useEffect(() => {
        if (!track.url) return;

        if ("mediaSession" in navigator) {
            navigator.mediaSession.metadata = new MediaMetadata({
                title: track.title,
                artist: track.handle,
                artwork: [{ src: track.artwork, sizes: "480x480" }],
            });
        }
    }, [track])
    
    useEffect(() => {
        if (!("mediaSession" in navigator)) return;

        // setPositionState throws on an invalid duration or a position past the end,
        // which can happen briefly before a new track's duration has loaded.
        if (!Number.isFinite(duration) || duration <= 0) return;

        navigator.mediaSession.setPositionState({
            duration,
            position: Math.min(Math.max(currentTime, 0), duration),
        });
    }, [currentTime, duration])

    useEffect(() => {
        if (!("mediaSession" in navigator)) return;

        const actions: MediaSessionAction[] = [
            "play", "pause", "nexttrack", "previoustrack", "seekbackward", "seekforward", "seekto"
        ];
        actions.forEach((action) => navigator.mediaSession.setActionHandler(action, (details) => onMediaAction(details)));

        return () => actions.forEach((action) => navigator.mediaSession.setActionHandler(action, null));
    }, []);

    return (
        <>
            <audio
                loop={repeatMode === "one"}
                autoPlay
                crossOrigin="anonymous" 
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
                progressTrack={progressTrack}
                progressVolume={progressVolume}
                onHandleSeek={handleSeek}
                onHandleShuffle={handleShuffle}
                onHandleRewind={handleRewind}
                onHandleSkipNext={handleSkipNext}
                onHandleSkipPrev={handleSkipPrev}
                onHandleTogglePlay={handleTogglePlay}
                onHandleFastForward={handleFastForward}
                onHandleToggleMute={handleToggleMute}
                onHandleVolumeChange={handleVolumeChange}
                onCycleRepeatMode={cycleRepeatMode}
                onAddToFavorites={onAddToFavorites}
                onHandleAddToPlaylist={onHandleAddToPlaylist}
                onHandleCreatePlaylist={onHandleCreatePlaylist}
            />
            <Visualizer audioRef={audioRef} isPlaying={isPlaying}/>
        </>
    )
}
