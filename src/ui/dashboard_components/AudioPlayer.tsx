import type { AudioPlayerProps } from "../../utils/types";

import { useRef, useState, type ChangeEvent } from "react";

import { formatTime } from "../../utils/helpers";
import { CoverArtImage } from "../Containers";

export default function AudioPlayer({coverArt, title, artist, streamUrl}: AudioPlayerProps) {

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
            <div className="AudioPlayer">
                <div style={{display: "flex", justifyContent: "center"}}>
                    <CoverArtImage src={coverArt} />
                </div>
                <div>
                    <h2 style={{textAlign: "center"}}>{title}</h2>
                    <h3 style={{textAlign: "center"}}>{artist}</h3>
                    <audio 
                        ref={audioRef}
                        src={streamUrl || undefined}
                        onPlay={() => setIsPlaying(true)}
                        onPause={() => setIsPlaying(false)}
                        onEnded={() => setIsPlaying(false)}
                        onLoadedData={handleLoadedMetadata}
                        onTimeUpdate={handleTimeUpdate}
                        onVolumeChange={handleElementVolumeChange}
                    >
                    </audio>
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
                        aria-label="Seek"
                    />
                </div>
                <div style={{display: "flex", justifyContent: "space-between"}}>
                    <div>
                        {formatTime(currentTime)}
                    </div>
                    <div>
                        {formatTime(duration)}
                    </div>
                </div>
                <div style={{display: "flex", justifyContent: "center"}}>
                    <button 
                        className="AudioPlayerButton" 
                        onClick={handleTogglePlay} 
                        aria-label={isPlaying ? "Pause" : "Play"}>
                        <img 
                            width={64}
                            height={64}
                            src={isPlaying ? "/assets/audio_player_icons/pause.svg" : "/assets/audio_player_icons/play.svg"} 
                        />
                    </button>
                </div>
                <div style={{display: "flex", justifyContent: "space-evenly"}}>
                    <button 
                        className="AudioPlayerButton" 
                        onClick={handleToggleMute}
                        aria-label={isMuted ? "Unmute" : "Mute"}
                    >
                        <img 
                            width={40}
                            height={40}
                            src={isMuted || volume === 0 ? "/assets/audio_player_icons/volume-muted.svg" : "/assets/audio_player_icons/volume.svg"}
                        />
                    </button>
                    <input
                        type="range"
                        min={0}
                        max={1}
                        step={0.01}
                        value={isMuted ? 0 : volume}
                        onChange={handleVolumeChange}
                        aria-label="Volume"
                    />
                </div>
            </div>
        </div>
    )
}
