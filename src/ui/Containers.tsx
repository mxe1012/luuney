import { useRef, useState } from "react";
import type { ChildrenProps, MusicDashboardProps } from "../utils/types";

export function MainPane({children}: ChildrenProps) {
    return <div>{children}</div>;
}

export function MusicDashboard({coverArt}: MusicDashboardProps) {

    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);

    const audioRef = useRef<HTMLAudioElement>(null);

    return (
        <div style={{display: "flex", justifyContent: "center"}}>
            <div className="MusicDashboard">
                <div style={{display: "flex", justifyContent: "center"}}>
                    <img src={coverArt} width={256} height={256} alt="Cover Art"/>
                </div>
                <div>
                    <h2 style={{textAlign: "center"}}>Name of Song</h2>
                    <h3 style={{textAlign: "center"}}>Name of Artist</h3>
                    <audio ref={audioRef}>
                        <source src="/assets/test_song.mp3" type="audio/mpeg" />
                    </audio>
                </div>
            </div>
        </div>
    )
}
