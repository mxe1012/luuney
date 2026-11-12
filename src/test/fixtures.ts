import type { ArtistObject, Playlist, TrackObject } from "../utils/types";

// Shared builders so tests only spell out the fields they care about.

export function makeTrack(id: number, overrides: Partial<TrackObject> = {}): TrackObject {
    return {
        track_id: id,
        artwork: `https://example.com/art/${id}.jpg`,
        title: `Track ${id}`,
        handle: `artist${id}`,
        url: `https://example.com/stream/${id}`,
        duration: 60 + id,
        ...overrides,
    };
}

export function makeTracks(count: number, startId = 1): TrackObject[] {
    return Array.from({ length: count }, (_, i) => makeTrack(startId + i));
}

export function makeArtist(id: number, overrides: Partial<ArtistObject> = {}): ArtistObject {
    return {
        user_id: id,
        profile_picture: `https://example.com/pfp/${id}.jpg`,
        name: `Artist ${id}`,
        handle: `artist${id}`,
        track_count: 3,
        ...overrides,
    };
}

export function makePlaylist(id: string, tracks: TrackObject[] = [], name = `Playlist ${id}`): Playlist {
    return { id, name, tracks };
}

// Shape of a track as returned by the Audius API (before mapping to TrackObject).
export function makeApiTrack(id: number, overrides: Record<string, unknown> = {}) {
    return {
        id: `api${id}`,
        track_id: id,
        title: `Track ${id}`,
        duration: 60 + id,
        artwork: { "480x480": `https://example.com/art/${id}.jpg` },
        user: { handle: `artist${id}` },
        stream: { url: `https://example.com/stream/${id}` },
        ...overrides,
    };
}

// Shape of a user as returned by the Audius API.
export function makeApiUser(id: number, overrides: Record<string, unknown> = {}) {
    return {
        user_id: id,
        name: `Artist ${id}`,
        handle: `artist${id}`,
        track_count: 3,
        profile_picture: { "480x480": `https://example.com/pfp/${id}.jpg` },
        ...overrides,
    };
}
