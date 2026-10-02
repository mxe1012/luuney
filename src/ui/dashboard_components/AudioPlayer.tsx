import type { MusicDashboardProps } from "../../utils/types";

import { useRef, useState, type ChangeEvent } from "react";

import { formatTime } from "../../utils/helpers";


export default function AudioPlayer({coverArt}: MusicDashboardProps) {

    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    
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
                    <div style={{display: "flex", justifyContent: "center"}}>
                        <p>{formatTime(currentTime) + "/" + formatTime(duration)}</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
