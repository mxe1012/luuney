import { useState, useRef } from "react";

import { fetchTrackByQuery, fetchTracksByUser, fetchUsers } from "../../utils/data";

import type { ArtistObject, SearchListPaneProps, TrackObject } from "../../utils/types";

import { useSnackbar } from "../../hooks/SnackbarContext";
import ListButton from "./playlistpane_components/ListButton";
import SkeletonSearchListPane from "../skeletons/SkeletonSearchListPane";
import  usePagination  from "../../hooks/usePagination";
import PaginationController from "../PaginationController";
import CoverImage from "../CoverImage";

export default function SearchListPane({onHandleFetch, isFavorited , onAddToFavorites, onAddToRecents, onIsPlaying}: SearchListPaneProps) {

    const searchTypes: string[] = ["tracks", "artists"]
    const [searchType, setSearchType] = useState(searchTypes[0]);

    const [trackList, setTrackList] = useState<TrackObject[]>([]);
    const [artistList, setArtistList] = useState<ArtistObject[]>([]);

    const [searchTrack, setSearchTrack] = useState("");
    const [searchArtist, setSearchArtist] = useState("");

    const [isLoaded, setIsLoaded] = useState(true);

    const { pageItems, page, pageCount, hasPrev, hasNext, next, prev, start } =
    usePagination(trackList, 10);

    const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const searchRef = useRef<string>("");

    const { showSnackbar } = useSnackbar();

    function handleSearchType(e: React.ChangeEvent<HTMLSelectElement>) {
        setSearchType(e.target.value);
    }

    async function handleSearchTracks(e: React.ChangeEvent<HTMLInputElement>) {

        setIsLoaded(false);

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

            const newList: TrackObject[] = result.data.filter((element) => element.stream?.url).map((element) => {

                const { track_id, artwork, title, duration } = element;

                const { handle } = element.user;

                const { url } = element.stream;

                return {
                    track_id,
                    artwork: artwork?.["480x480"] ?? "/assets/placeholder-cover.svg",
                    title,
                    handle,
                    url,
                    duration
                }

            })

            setTrackList(newList);
            setIsLoaded(true);
            console.log(newList)
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

            const newList: TrackObject[] = result.data.filter((element) => element.stream?.url).map((element) => {

                const { track_id, artwork, title, duration } = element;

                const { handle } = element.user;

                const { url } = element.stream;

                return {
                    track_id,
                    artwork: artwork?.["480x480"] ?? "/assets/placeholder-cover.svg",
                    title,
                    handle,
                    url,
                    duration
                }

            })

            setTrackList(newList);
            setIsLoaded(true);
            console.log(newList)
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
                        <option value={searchTypes[0]} onClick={() => setArtistList([])}>Tracks</option>
                        <option value={searchTypes[1]} onClick={() => setTrackList([])}>Artists</option>
                    </select>
                </div>
                <SkeletonSearchListPane isLoaded={isLoaded}>
                    <ul className="SearchList">
                        {pageItems.map((element, index) => (
                            <li className="SearchList" key={element.track_id}>
                                <ListButton 
                                    list={trackList}
                                    track={element}
                                    index={start + index}
                                    onHandleFetch={onHandleFetch}
                                    onAddToFavorites={onAddToFavorites}
                                    onAddToRecents={onAddToRecents}
                                    onIsPlaying={onIsPlaying}
                                    isFavorited={isFavorited}
                                    hasDeleteButton={false}
                                    hasFavoriteButton={true}
                                />
                            </li>
                        ))}
                    </ul>
                    <ul className="SearchList">
                        {artistList.map((element) => (
                            <li className="SearchList" key={element.user_id}>
                                <button className="PlaylistButton" 
                                    onClick={() => {
                                    handleFetchTracksByUserId(element.user_id);
                                    setArtistList([]);
                                }}>
                                    <div style={{display: "flex", justifyContent: "flex-start", alignItems: "center", gap: '12px'}}>
                                        <div style={{flexShrink: 0}}>
                                            <CoverImage styles={{borderRadius: '10px'}} src={element.profile_picture} size={64}/>
                                        </div>
                                        <div style={{textAlign: 'left', minWidth: 0, flex: 1}}>
                                            <h4>{element.name}</h4>
                                            <h5>{element.handle}</h5>
                                        </div>
                                    </div>
                                </button>
                            </li>
                        ))}
                    </ul>
                    <PaginationController 
                        className="Pagination"
                        page={page} 
                        pageCount={pageCount} 
                        prev={prev} 
                        hasPrev={hasPrev} 
                        next={next} 
                        hasNext={hasNext}
                    />
                </SkeletonSearchListPane>
            </div>
        </>
    );
}
