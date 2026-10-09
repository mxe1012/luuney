import { useState, useRef } from "react";

import { fetchTrackByQuery } from "../../utils/data";

import type { SearchListPaneProps, TrackObject } from "../../utils/types";
import { CoverImage } from "../Containers";
import { useSnackbar } from "../../hooks/SnackbarContext";

export default function SearchListPane({onHandleFetch, isFavorited ,onAddToFavorites, onAddToRecents, onIsPlaying}: SearchListPaneProps) {

    const [trackList, setTrackList] = useState<TrackObject[]>([]);
        
    const [search, setSearch] = useState("");

    const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const searchRef = useRef<string>("");

    const { showSnackbar } = useSnackbar();

    async function handleSearch(e: React.ChangeEvent<HTMLInputElement>) {

        const query = e.target.value;
        setSearch(query);
    
        if(debounceTimer.current) {
            clearTimeout(debounceTimer.current);
        }

        searchRef.current = query;

        if (query.trim().length == 0) {
            setTrackList([]);
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
                return;
            }

            const newList: TrackObject[] = result.data.filter((element) => element.stream?.url).map((element) => {

                const { track_id, artwork, title } = element;

                const { handle } = element.user;

                const { url } = element.stream;

                return {
                    track_id,
                    artwork: artwork?.["480x480"] ?? "/assets/placeholder-cover.svg",
                    title,
                    handle,
                    url
                }

            })

            setTrackList(newList);
            console.log(newList)
        }
        catch(e) {
            if(searchRef.current !== query) {
                return;
            }
            showSnackbar("Could not search for tracks.");
            console.log(e);
        }

    }

    return (
        <>
            <div className="SearchPane">
                <div className="SearchController">
                    <input className="SearchInput" value={search} placeholder="Search Track..." onChange={handleSearch}></input>
                </div>
                <ul className="SearchList">
                    {trackList.map((element) => (
                        <li className="SearchList" key={element.track_id}>
                            <button className="SearchListButton" onClick={() => {
                                onHandleFetch(element.track_id);
                                onAddToRecents(element)
                                onIsPlaying(false);
                                }}>
                                <div style={{display: "flex", justifyContent: "space-between", alignItems: "center", gap: '12px'}}>
                                    <div style={{flexShrink: 0}}>
                                        <CoverImage styles={{borderRadius: '10px'}} src={element.artwork} size={64}/>
                                    </div>
                                    <div style={{textAlign: 'left', minWidth: 0, flex: 1}}>
                                        <h4>{element.title}</h4>
                                        <h5>{element.handle}</h5>
                                    </div>
                                    <div style={{flexShrink: 0}}>
                                        <button className="ListFavoriteBtn"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onAddToFavorites(element)
                                            }}
                                        >
                                            <img src={isFavorited(element) ? "/assets/favorite_icons/favorited.svg" : "/assets/favorite_icons/not_favorited.svg"} aria-label="favorite" alt="favorite" />
                                        </button>
                                    </div>
                                </div>
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
        </>
    );
}
