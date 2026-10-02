import type { MusicDashboardProps } from "../../utils/types";

import { useRef, useState, type ChangeEvent } from "react";

import { formatTime } from "../../utils/helpers";


export default function AudioPlayer({coverArt}: MusicDashboardProps) {

    const [isPlaying, setIsPlaying] = useState(false);

    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    
    const [volume, setVolume] = useState(1);
    const [isMuted, setIsMuted] = useState(false);

    const audioRef = useRef<HTMLAudioElement>(null);
    
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

    return (
        <div style={{display: "flex", justifyContent: "center"}}>
            <div className="MusicDashboard">
                <div style={{display: "flex", justifyContent: "center"}}>
                    <img src={coverArt} width={256} height={256} alt="Cover Art"/>
                </div>
                <div>
                    <h2 style={{textAlign: "center"}}>Name of Song</h2>
                    <h3 style={{textAlign: "center"}}>Name of Artist</h3>
                    <audio ref={audioRef}
                        onPlay={() => setIsPlaying(true)}
                        onPause={() => setIsPlaying(false)}
                        onEnded={() => setIsPlaying(false)}
                        onLoadedData={handleLoadedMetadata}
                        onTimeUpdate={handleTimeUpdate}
                        onVolumeChange={handleElementVolumeChange}
                    >
                        <source src="/assets/test_song.mp3" type="audio/mpeg" />
                    </audio>
                    <button onClick={handleTogglePlay} aria-label={isPlaying ? "Pause" : "Play"}>
                        {isPlaying ? "Pause" : "Play"}
                    </button>
                    <input 
                        type="range"
                        min={0}
                        max={duration}
                        step={0.1}
                        value={currentTime}
                        onChange={handleSeek} 
                        disabled={false}
                        aria-label="Seek"
                    />
                    <input
                        type="range"
                        min={0}
                        max={1}
                        step={0.01}
                        value={isMuted ? 0 : volume}
                        onChange={handleVolumeChange}
                        aria-label="Volume"
                    />
                    <button
                        onClick={handleToggleMute}
                        aria-label={isMuted ? "Unmute" : "Mute"}
                    >
                        {isMuted || volume === 0 ? "Unmute" : "Mute"}
                    </button>
                    <div style={{display: "flex", justifyContent: "center"}}>
                        <p>{formatTime(currentTime) + "/" + formatTime(duration)}</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
