import type { ApiTrack, Playlist, TrackObject } from "./types";

const PLACEHOLDER_ARTWORK = "/assets/placeholder-cover-purple.svg";

export function isSameEntry(a: TrackObject, b: TrackObject): boolean {
    return a.track_id === b.track_id;
}

export function toTrackObject(apiTrack: ApiTrack): TrackObject {
    const { track_id, artwork, title, duration } = apiTrack;

    const { handle } = apiTrack.user;

    if (!apiTrack.stream?.url) throw new Error(`Track ${track_id} has no stream`);

    return {
        track_id,
        artwork: artwork?.["480x480"] ?? PLACEHOLDER_ARTWORK,
        title,
        handle,
        url:`https://api.audius.co/v1/tracks/${track_id}/stream`,
        duration,
    };
}

// tracks without a stream URL can't be played, so they are left out
export function toTrackObjects(apiTracks: ApiTrack[]): TrackObject[] {
    return apiTracks
        .filter((apiTrack) => apiTrack.stream?.url)
        .map(toTrackObject);
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

    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    return hrs === 0 
        ? `${mins}:${secs.toString().padStart(2, "0")}` 
        : `${hrs}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

export function getDurationSum(playlist: Playlist): number {

    let durationSum = 0;

    for (let index = 0; index < playlist.tracks.length; index++) {
        durationSum += (playlist.tracks[index].duration)
    }
    return durationSum;
}

export function switchVolumeIcon(volume: number): string {

    if (volume === 0) {
        return "/assets/audio_player_icons/volume-0.svg";
    }
    else if (volume <= .34) {
        return "/assets/audio_player_icons/volume-1.svg";
    }
    else if (volume <= .67) {
        return "/assets/audio_player_icons/volume-2.svg";
    }
    else {
        return "/assets/audio_player_icons/volume-3.svg";
    }

}

export function isOnline(): boolean {
    return navigator.onLine;
}
