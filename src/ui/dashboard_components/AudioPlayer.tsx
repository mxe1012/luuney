import type { AudioPlayerProps } from "../../utils/types";

import { useRef, useState, type ChangeEvent } from "react";

import { formatTime } from "../../utils/helpers";

import AudioPlayerButton from "./audioplayer_components/AudioPlayerButton";

import { CoverImage } from "../Containers";

export default function AudioPlayer({track}: AudioPlayerProps) {

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

    return (
        <>
            <audio 
            ref={audioRef}
            src={track.url || undefined}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onEnded={() => setIsPlaying(false)}
            onLoadedData={handleLoadedMetadata}
            onTimeUpdate={handleTimeUpdate}
            onVolumeChange={handleElementVolumeChange} />
            <div className="AudioPlayer">
                <div style={{display: "flex", justifyContent: "center"}}>
                    <CoverImage styles={{borderRadius: '15px'}} src={track.artwork} size={256}/>
                </div>
                <div>
                    <h2 style={{textAlign: "center"}}>{track.title}</h2>
                    <h3 style={{textAlign: "center"}}>{track.handle}</h3>   
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
                        {formatTime(currentTime)}
                    </div>
                    <div>
                        {formatTime(duration)}
                    </div>
                </div>
                <div style={{display: "flex", justifyContent: "center"}}>
                    <AudioPlayerButton onClick={handleRewind} size={36} label="Fast Forward" src="/assets/audio_player_icons/rewind.svg" />
                    <AudioPlayerButton 
                    onClick={handleTogglePlay} size={64} toggleAction={isPlaying} 
                    labelTrue="Pause" labelFalse="Play"
                    srcTrue="/assets/audio_player_icons/pause.svg" srcFalse="/assets/audio_player_icons/play.svg" />
                    <AudioPlayerButton onClick={handleFastForward} size={36} label="Fast Forward" src="/assets/audio_player_icons/fast-forward.svg" />
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
