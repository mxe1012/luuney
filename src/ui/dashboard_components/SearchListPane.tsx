import { useState, useRef } from "react";

import { fetchTrackByQuery } from "../../utils/data";

import type { SearchListPaneProps, TrackObject } from "../../utils/types";

import { useSnackbar } from "../../hooks/SnackbarContext";
import ListButton from "./playlistpane_components/ListButton";
import SkeletonSearchListPane from "../skeletons/SkeletonSearchListPane";

export default function SearchListPane({onHandleFetch, isFavorited , onAddToFavorites, onAddToRecents, onIsPlaying}: SearchListPaneProps) {

    const [trackList, setTrackList] = useState<TrackObject[]>([]);
        
    const [search, setSearch] = useState("");

    const [isLoaded, setIsLoaded] = useState(true);

    const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const searchRef = useRef<string>("");

    const { showSnackbar } = useSnackbar();

    async function handleSearch(e: React.ChangeEvent<HTMLInputElement>) {

        setIsLoaded(false);

        const query = e.target.value;
        setSearch(query);
    
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

    return (
        <>
            <div className="SearchPane">
                <div className="SearchController">
                    <input className="SearchInput" value={search} placeholder="Search Track..." onChange={handleSearch}></input>
                </div>
                <SkeletonSearchListPane isLoaded={isLoaded}>
                    <ul className="SearchList">
                        {trackList.map((element, index) => (
                            <li className="SearchList" key={element.track_id}>
                                <ListButton 
                                    list={trackList}
                                    track={element}
                                    index={index}
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
                </SkeletonSearchListPane>
            </div>
        </>
    );
}
