import { useState } from "react";

import { fetchTrackById } from "../utils/data";

import AudioPlayer from "./dashboard_components/AudioPlayer";
import type { Playlist, TrackObject } from "../utils/types";
import SearchListPane from "./dashboard_components/SearchListPane";
import { useSnackbar } from "../hooks/SnackbarContext";

import PlaylistPane from "./dashboard_components/PlaylistPane";

export default function Dashboard() {

    const [track, setTrack] = useState<TrackObject>({
        track_id: 0,
        artwork: "/assets/placeholder-cover-purple.svg",
        title: "Title",
        handle: "Artist",
        url: ""
    });

    const [isPlaying, setIsPlaying] = useState(false);

    const [recents, setRecents] = useState<TrackObject[]>([]);

    const [favorites, setFavorites] = useState<TrackObject[]>([]);

    const isSameEntry = (a: TrackObject, b: TrackObject) => {
        return a.track_id === b.track_id
    } 

    const isCurrentTrackFavorited = favorites.some((element) => isSameEntry(element, track));

    const isListTrackInFavorites = (entry: TrackObject) => {
        return favorites.some((element) => isSameEntry(element, entry));
    }

    const [playlists, setPlaylists] = useState<Playlist[]>([]);

    const { showSnackbar } = useSnackbar();

    async function handleFetch(id: number) {

        showSnackbar("Loading track...");

        try {
            const result = await fetchTrackById(id);

            const { track_id, artwork, title, user: { handle }, stream: { url } } = result.data;
            setTrack({ 
                track_id,
                artwork: artwork?.["480x480"] ?? "/assets/placeholder-cover-purple.svg",
                title, 
                handle, 
                url 
            });

            showSnackbar("Now playing:\n" + title + "\n" + handle)

        }
        catch(e) {
            showSnackbar("Error in loading track!", 12000)
            console.log(e);
        }
        
    }

    function handleAddToRecents(entry: TrackObject) {
        const maxed = recents.length >= 20 ? recents.slice(0, 19) : recents
        const filtered = maxed.filter((element) => element.track_id !== entry.track_id);

        setRecents([
            entry,
            ...filtered
        ])
    }

    function handleAddToFavorites(entry: TrackObject) {
        const isInList = favorites.some((element) => isSameEntry(element, entry));

        if(isInList) {
            const filtered = favorites.filter((element) => element.track_id !== entry.track_id);
            setFavorites(filtered)
            showSnackbar("Removed track from favorites!") 
        }
        else {
            setFavorites([
                ...favorites,
                entry
            ])
            showSnackbar("Added track to favorites!") 
        }
    }

    function handleCreatePlaylist(name: string, entry: TrackObject) {
        const trimmed = name.trim();

        setPlaylists(prev => [
            ...prev,
            {
                id: crypto.randomUUID(),
                name: trimmed,
                tracks: [entry],
            },
        ]);
    }

    function handleAddToPlaylist(playlistId: string, entry: TrackObject) {
        setPlaylists(prev =>
            prev.map(playlist =>
                playlist.id !== playlistId || playlist.tracks.some(t => t.track_id === entry.track_id)
                    ? playlist
                    : { ...playlist, tracks: [...playlist.tracks, entry] }
                )
            );
    }

    function handleDeleteEntry(list: TrackObject[], entry: TrackObject) {
        const filtered = list.filter((element) => element.track_id !== entry.track_id);
        showSnackbar("Removed track from list.")
        return filtered;
    }

    function handleDeletePlaylist(entry: Playlist) {
        const filtered = playlists.filter((element) => element.id !== entry.id);
        showSnackbar("Removed playlist.")
        return filtered;
    }

    function handleDeletePlaylistEntry(playlistId: string, entry: TrackObject) {
    setPlaylists(prev =>
        prev.map(playlist =>
            playlist.id === playlistId
                ? {
                    ...playlist,
                    tracks: playlist.tracks.filter(t => t.track_id !== entry.track_id),
                  }
                : playlist
            )
        );
    }

    return (
        <>
            <div className="MusicDashboard">
                <div>
                    <PlaylistPane recents={recents} favorites={favorites} playlist={playlists}
                    onRecentsList={setRecents} onFavoritesList={setFavorites} onSetPlaylist={setPlaylists}
                    isFavorited={isListTrackInFavorites} onDeletePlaylist={handleDeletePlaylist} onDeletePlaylistEntry={handleDeletePlaylistEntry}
                    onDeleteEntry={handleDeleteEntry} onAddToFavorites={handleAddToFavorites} onHandleFetch={handleFetch} 
                    onIsPlaying={setIsPlaying} />
                </div>
                <div>
                    <AudioPlayer track={track} playlists={playlists} isPlaying={isPlaying} isFavorited={isCurrentTrackFavorited} 
                    onAddToFavorites={handleAddToFavorites} onIsPlaying={setIsPlaying}
                    onHandleCreatePlaylist={handleCreatePlaylist} onHandleAddToPlaylist={handleAddToPlaylist}
                    />
                </div>
                <div>
                    <SearchListPane onHandleFetch={handleFetch} isFavorited={isListTrackInFavorites} 
                    onAddToFavorites={handleAddToFavorites} onAddToRecents={handleAddToRecents} onIsPlaying={setIsPlaying}/>
                </div>
            </div>
        </>
    )
}
