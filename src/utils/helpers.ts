import type { Playlist, TrackObject } from "./types";

export function isSameEntry(a: TrackObject, b: TrackObject): boolean {
    return a.track_id === b.track_id;
}

// the playing track goes first, so the rest of the shuffle follows it
export function shuffleWithPlayingFirst(tracks: TrackObject[], playing: TrackObject | undefined): TrackObject[] {
    const rest = tracks
        .filter((track) => track.track_id !== playing?.track_id)
        .map((value) => ({ value, sort: Math.random() }))
        .sort((a, b) => a.sort - b.sort)
        .map(({ value }) => value);

    return playing ? [playing, ...rest] : rest;
}

export function formatTime(seconds: number): string {
    if (!Number.isFinite(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    
    return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function getDurationSum(playlist: Playlist): number {

    let durationSum = 0;

    for (let index = 0; index < playlist.tracks.length; index++) {
        durationSum += (playlist.tracks[index].duration)
    }
    return durationSum;
}

export function isOnline(): boolean {
    return navigator.onLine;
}
