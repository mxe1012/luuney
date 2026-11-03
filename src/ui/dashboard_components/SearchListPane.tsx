import { useState, useRef } from "react";

import { fetchTrackByQuery, fetchTracksByUser, fetchUsers } from "../../utils/data";

import type { ArtistObject, SearchListPaneProps, TrackObject } from "../../utils/types";

import { useSnackbar } from "../../hooks/SnackbarContext";

import SkeletonSearchListPane from "../skeletons/SkeletonSearchListPane";

import TrackSearchList from "./searchlistpane_components/TrackSearchList";
import ArtistSearchList from "./searchlistpane_components/ArtistSearchList";

export default function SearchListPane({onHandleFetch, isFavorited , onAddToFavorites, onAddToRecents, onIsPlaying}: SearchListPaneProps) {

    const searchTypes: string[] = ["tracks", "artists"]
    const [searchType, setSearchType] = useState(searchTypes[0]);

    const [trackList, setTrackList] = useState<TrackObject[]>([]);
    const [artistList, setArtistList] = useState<ArtistObject[]>([]);

    const [searchTrack, setSearchTrack] = useState("");
    const [searchArtist, setSearchArtist] = useState("");

    const [isLoaded, setIsLoaded] = useState(true);

    const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const searchRef = useRef<string>("");

    const { showSnackbar } = useSnackbar();

    function handleSearchType(e: React.ChangeEvent<HTMLSelectElement>) {
        setSearchType(e.target.value);
    }

    type TrackResponse = Awaited<ReturnType<typeof fetchTrackByQuery>>;

    function mapTracksData(data: TrackResponse["data"]): TrackObject[] {
        return data
            .filter((e) => e.stream?.url)
            .map((e) => {
                const { track_id, artwork, title, duration } = e;
                const { handle } = e.user;
                const { url } = e.stream;

                return {
                    track_id,
                    artwork: artwork?.["480x480"] ?? "/assets/placeholder-cover.svg",
                    title,
                    handle,
                    url,
                    duration,
                };
            });
    }

    async function handleSearchTracks(e: React.ChangeEvent<HTMLInputElement>) {

        setIsLoaded(false);
        setTrackList([]);
        setArtistList([]);

        const query = e.target.value;
        setSearchTrack(query);
    
        if(debounceTimer.current) {
            clearTimeout(debounceTimer.current);
        }

        searchRef.current = query;

        if (query.trim().length == 0) {
            setTrackList([]);
            setIsLoaded(true);
            return;
        }

        debounceTimer.current = setTimeout(() => {
            debouncedFetchTracks(query)
        }, 600)
    }
    
    async function debouncedFetchTracks(query: string) {

        try {
            const result = await fetchTrackByQuery(query);

            if(searchRef.current !== query) {
                setIsLoaded(true);
                return;
            }

            setTrackList(mapTracksData(result.data));
            setIsLoaded(true);
        }
        catch(e) {
            if(searchRef.current !== query) {
                setIsLoaded(true);
                return;
            }
            showSnackbar("Could not search for tracks.");
            console.error(e);
        }
    }

    async function handleSearchArtists(e: React.ChangeEvent<HTMLInputElement>) {

        setIsLoaded(false);
        setTrackList([]);
        setArtistList([]);

        const query = e.target.value;
        setSearchArtist(query);
    
        if(debounceTimer.current) {
            clearTimeout(debounceTimer.current);
        }

        searchRef.current = query;

        if (query.trim().length == 0) {
            setArtistList([]);
            setIsLoaded(true);
            return;
        }

        debounceTimer.current = setTimeout(() => {
            debouncedFetchTracksByArtists(query)
        }, 600)
    }

    async function debouncedFetchTracksByArtists(query: string) {

        try {
            const result = await fetchUsers(query);

            if(searchRef.current !== query) {
                setIsLoaded(true);
                return;
            }

            const newList: ArtistObject[] = result.data.map((element) => {

                const { user_id, profile_picture, name, handle } = element;

                return {
                    user_id,
                    profile_picture: profile_picture?.["480x480"] ?? "/assets/person-placeholder.svg",
                    name,
                    handle,
                }

            })

            setArtistList(newList);
            setIsLoaded(true);
            console.log(newList)
        }
        catch(e) {
            if(searchRef.current !== query) {
                setIsLoaded(true);
                return;
            }
            showSnackbar("Could not search for artists.");
            console.error(e);
        }
    }

    async function handleFetchTracksByUserId(id: number) {

        try {
            const result = await fetchTracksByUser(id);

            setTrackList(mapTracksData(result.data));
            setIsLoaded(true);
        }
        catch(e) {
            showSnackbar("Could not search for tracks by user.");
            console.error(e);
        }
    }

    return (
        <>
            <div className="SearchPane">
                <div className="SearchController">
                    <input 
                        className="SearchInput" 
                        value={searchType === "tracks" ? searchTrack : searchArtist} 
                        placeholder={searchType === "tracks" ? "Search Tracks..." : "Search Artists..."}
                        onChange={searchType === "tracks" ? handleSearchTracks : handleSearchArtists}>
                    </input>
                    <select value={searchType} className="PlaylistPaneControllerButton" onChange={handleSearchType}>
                        <option value={searchTypes[0]} onClick={() => {setArtistList([]); showSnackbar("Searching by Tracks")}}>Tracks</option>
                        <option value={searchTypes[1]} onClick={() => {setTrackList([]); showSnackbar("Searching by Artists")}}>Artists</option>
                    </select>
                </div>
                <SkeletonSearchListPane isLoaded={isLoaded}>
                    <TrackSearchList 
                        list={trackList}
                        onHandleFetch={onHandleFetch}
                        onAddToFavorites={onAddToFavorites}
                        onAddToRecents={onAddToRecents}
                        onIsPlaying={onIsPlaying}
                        isFavorited={isFavorited}
                    />
                    <ArtistSearchList 
                        list={artistList}
                        onHandleFetchTracksByUserId={handleFetchTracksByUserId}
                        onSetArtistList={setArtistList}
                    />
                </SkeletonSearchListPane>
            </div>
        </>
    );
}
