import { useEffect, useRef, useState } from "react";

import { fetchTrackById, fetchTrackLatest, fetchTrackTrending } from "../utils/data";

import AudioPlayer from "./dashboard_components/AudioPlayer";

import type { Playlist, TrackObject } from "../utils/types";

import SearchListPane from "./dashboard_components/SearchListPane";

import { useSnackbar } from "../hooks/SnackbarContext";

import PlaylistPane from "./dashboard_components/PlaylistPane";

import { useLocalStorage } from "../hooks/useLocalStorage";
import ExtraListPane from "./dashboard_components/ExtraListPane";
import { isOnline } from "../utils/helpers";

const MAX_LENGTH = 50;

export default function Dashboard() {

    const [track, setTrack] = useState<TrackObject>({
        track_id: 0,
        artwork: "/assets/placeholder-cover-purple.svg",
        title: "Title",
        handle: "Artist",
        url: "",
        duration: 0
    });

    const [isPlaying, setIsPlaying] = useState(false);

    const [recents, setRecents] = useLocalStorage<TrackObject[]>("recent_tracks", []);

    const [favorites, setFavorites] = useLocalStorage<TrackObject[]>("favorite_tracks", [])

    const [playlists, setPlaylists] = useLocalStorage<Playlist[]>("user_playlists", []);

    const isSameEntry = (a: TrackObject, b: TrackObject) => {
        return a.track_id === b.track_id
    }

    const isCurrentTrackFavorited = favorites.some((element) => isSameEntry(element, track));

    const isListTrackInFavorites = (entry: TrackObject) => {
        return favorites.some((element) => isSameEntry(element, entry));
    }

    const [trending, setTrending] = useState<TrackObject[]>([]);
    const [latest, setLatest] = useState<TrackObject[]>([]);

    const [isLoadedTrending, setIsLoadedTrending] = useState(false);
    const [isLoadedLatest, setIsLoadedLatest] = useState(false);

    const [trackQueue, setTrackQueue] = useState<TrackObject[]>([]);
    
    const [currentTrackIndex, setCurrentTrackIndex] = useState(0);

    const [isShuffle, setIsShuffle] = useState(false);

    const [shuffleTrackQueue, setShuffleTrackQueue] = useState<TrackObject[]>([]);

    // the list the queue was started from: "recents", "favorites", a playlist id, or null for any other list
    const [queueSource, setQueueSource] = useState<string | null>(null);

    const latestTrackRequestId = useRef(0);

    const { showSnackbar, hideSnackbar } = useSnackbar();

    async function handleFetch(id: number) {

        showSnackbar("Loading track...", undefined, true);

        latestTrackRequestId.current++;

        const trackRequestId = latestTrackRequestId.current;

        try {
            const result = await fetchTrackById(id);

            const { track_id, artwork, title, duration } = result.data;

            const { handle } = result.data.user;

            const { url } = result.data.stream;

            const newTrack: TrackObject = {
                track_id,
                artwork: artwork?.["480x480"] ?? "/assets/placeholder-cover-purple.svg",
                title,
                handle,
                url,
                duration,
            };

            if (latestTrackRequestId.current !== trackRequestId) return;

            setTrack(newTrack);
            showSnackbar("Now playing:\n" + title + "\n" + handle);
            handleAddToRecents(newTrack);

        }
        catch(e) {
            if (latestTrackRequestId.current !== trackRequestId) return;
            showSnackbar("Error loading track!", 12000)
            console.error(e);
        }
        
    }

    async function handleGetTrendingAndLatest() {

        const [trendingResult, latestResult] = await Promise.allSettled([
            fetchTrackTrending(),
            fetchTrackLatest(),
        ]);

        if (trendingResult.status === "fulfilled") {
            setTrending(toTrackObjects(trendingResult.value.data));
            setIsLoadedTrending(true);
        } 
        else {
            showSnackbar("Failed to fetch trending tracks.");
            console.error("Failed to fetch trending tracks:", trendingResult.reason);
        }

        if (latestResult.status === "fulfilled") {
            setLatest(toTrackObjects(latestResult.value.data));
            setIsLoadedLatest(true);
        } 
        else {
            showSnackbar("Failed to fetch latest tracks.");
            console.error("Failed to fetch latest tracks:", latestResult.reason);
        }
    }

    type TrackResponse = Awaited<ReturnType<typeof fetchTrackTrending>>;

    function toTrackObjects(data: TrackResponse["data"]): TrackObject[] {
        return data
            .filter((element) => element.stream?.url)
            .map((element) => {
                const { track_id, artwork, title, duration } = element;
                const { handle } = element.user;
                const { url } = element.stream;

                return {
                    track_id,
                    artwork: artwork?.["480x480"] ?? "/assets/placeholder-cover-purple.svg",
                    title,
                    handle,
                    url,
                    duration,
                };
            });
    }

    function handleAddToRecents(entry: TrackObject) {
       setRecents(prev => [
            entry,
            ...prev.filter(element => element.track_id !== entry.track_id),
        ].slice(0, MAX_LENGTH));
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

    function handleSetTrackQueue(list: TrackObject[]) {
        // lists are passed by reference, so the queue's source can be found before copying it
        if (list === recents) setQueueSource("recents");
        else if (list === favorites) setQueueSource("favorites");
        else setQueueSource(playlists.find((playlist) => playlist.tracks === list)?.id ?? null);

        setTrackQueue([...list]);
    }

    function removeFromQueue(source: string | null, entry: TrackObject) {
        // only a queue started from the same list is affected
        if (source === null || source !== queueSource) return;

        const activeQueue = isShuffle ? shuffleTrackQueue : trackQueue;
        const removedIndex = activeQueue.findIndex((element) => element.track_id === entry.track_id);

        if (removedIndex === -1) return;

        // keep the index on the playing track; if the playing track itself is removed,
        // it finishes and playback continues with the track that followed it
        if (removedIndex <= currentTrackIndex) setCurrentTrackIndex(currentTrackIndex - 1);

        const filteredQueue = activeQueue.filter((element) => element.track_id !== entry.track_id);

        // while shuffled only the shuffle queue changes, since changing trackQueue would reshuffle it
        if (isShuffle) setShuffleTrackQueue(filteredQueue);
        else setTrackQueue(filteredQueue);
    }

    function handleDeleteEntry(list: TrackObject[], entry: TrackObject) {
        const filteredList = list.filter((element) => element.track_id !== entry.track_id);
        showSnackbar("Removed track from list.");
        removeFromQueue(list === recents ? "recents" : list === favorites ? "favorites" : null, entry);
        return filteredList;
    }

    function handleClearQueue(source: string) {
        // only a queue started from the cleared list is emptied; the playing track still finishes
        if (source !== queueSource) return;

        setTrackQueue([]);
        setShuffleTrackQueue([]);
        setCurrentTrackIndex(0);
    }

    function handleDeletePlaylist(entry: Playlist) {
        const filtered = playlists.filter((element) => element.id !== entry.id);
        handleClearQueue(entry.id);
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
        removeFromQueue(playlistId, entry);
        showSnackbar("Removed track from playlist.")
    }

    useEffect(() => {

        const id = setTimeout(() => {
            handleGetTrendingAndLatest()
        }, 600)

        return () => clearTimeout(id)

    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    useEffect(() => {
        const notify = () => {
            showSnackbar("You are offline!\nConnect to a network.", undefined, true);
        }

        const backOnline = () => {
            hideSnackbar();
        }

        if (!isOnline()) notify(); else backOnline();

        window.addEventListener("offline", notify);
        window.addEventListener("online", backOnline)
        return () => {
            window.removeEventListener("offline", notify);
            window.removeEventListener("online", backOnline)
        }
    }, [showSnackbar, hideSnackbar]);

    return (
        <>
            <div className="MusicDashboard">
                <div>
                    <PlaylistPane 
                        recents={recents} 
                        favorites={favorites} 
                        playlist={playlists}
                        onRecentsList={setRecents} 
                        onFavoritesList={setFavorites} 
                        onSetPlaylist={setPlaylists}
                        isFavorited={isListTrackInFavorites} 
                        onDeletePlaylist={handleDeletePlaylist} 
                        onDeletePlaylistEntry={handleDeletePlaylistEntry}
                        onDeleteEntry={handleDeleteEntry} 
                        onClearQueue={handleClearQueue}
                        onAddToFavorites={handleAddToFavorites} 
                        onHandleFetch={handleFetch} 
                        onIsPlaying={setIsPlaying} 
                        onSetTrackQueue={handleSetTrackQueue}
                        onSetCurrentTrackIndex={setCurrentTrackIndex}
                    />
                </div>
                <div>
                    <AudioPlayer 
                        track={track} 
                        tracks={trackQueue}
                        currentTrackIndex={currentTrackIndex}
                        onSetCurrentTrackIndex={setCurrentTrackIndex}
                        playlists={playlists} 
                        isPlaying={isPlaying} 
                        isFavorited={isCurrentTrackFavorited} 
                        isShuffle={isShuffle}
                        shuffleTrackQueue={shuffleTrackQueue}
                        onSetIsShuffle={setIsShuffle}
                        onSetShuffleTrackQueue={setShuffleTrackQueue}
                        onSetTrackQueue={setTrackQueue}
                        onHandleFetch={handleFetch}
                        onAddToFavorites={handleAddToFavorites} 
                        onIsPlaying={setIsPlaying}
                        onHandleCreatePlaylist={handleCreatePlaylist} 
                        onHandleAddToPlaylist={handleAddToPlaylist}
                    />
                </div>
                <div>
                    <SearchListPane 
                        onHandleFetch={handleFetch} 
                        isFavorited={isListTrackInFavorites} 
                        onAddToFavorites={handleAddToFavorites} 
                        onIsPlaying={setIsPlaying}
                        onSetCurrentTrackIndex={setCurrentTrackIndex}
                        onSetTrackQueue={handleSetTrackQueue}
                    />
                </div>
            </div>
            <ExtraListPane 
                isLoaded={isLoadedTrending}
                list={trending}
                heading="Trending Tracks (Top 100)"
                onHandleFetch={handleFetch}
                onIsPlaying={setIsPlaying}
                onSetTrackQueue={handleSetTrackQueue}
                onSetCurrentTrackIndex={setCurrentTrackIndex}
            />
            <ExtraListPane 
                isLoaded={isLoadedLatest}
                list={latest}
                heading="Latest Tracks"
                onHandleFetch={handleFetch}
                onIsPlaying={setIsPlaying}
                onSetTrackQueue={handleSetTrackQueue}
                onSetCurrentTrackIndex={setCurrentTrackIndex}
            />
        </>
    )
}
