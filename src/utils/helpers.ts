import type { Playlist } from "./types";

export function formatTime(seconds: number): string {
    if (!Number.isFinite(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    
    return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function getDurationSum(current: Playlist): number {

    let durationSum = 0;

    for (let index = 0; index < current.tracks.length; index++) {
        durationSum += (current.tracks[index].duration)
    }
    return durationSum;
}
