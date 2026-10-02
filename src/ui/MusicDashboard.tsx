import { useRef, useState, type ChangeEvent } from "react";
import type { MusicDashboardProps } from "../utils/types";

export default function MusicDashboard({coverArt}: MusicDashboardProps) {

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

        const newTime = e.target.value;

        

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
                    >
                        <source src="/assets/test_song.mp3" type="audio/mpeg" />
                    </audio>
                    <button onClick={handleTogglePlay} aria-label={isPlaying ? "Pause" : "Play"}>{isPlaying ? "Pause" : "Play"}</button>
                </div>
            </div>
        </div>
    )
}
