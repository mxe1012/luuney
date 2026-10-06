import { useState, useRef } from "react";

import { fetchTrackByQuery } from "../../utils/data";

import type { SearchListPaneProps, TrackObject } from "../../utils/types";
import { CoverImage } from "../Containers";

export default function SearchListPane({onHandleFetch}: SearchListPaneProps) {

    const [trackList, setTrackList] = useState<TrackObject[]>([]);
        
    const [search, setSearch] = useState("");

    const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const searchRef = useRef<string>("");

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
                console.log(e);
            }
    
        }

    return (
        <>
            <div className="SearchPane">
                <input className="SearchInput" value={search} placeholder="Search Track..." onChange={handleSearch}></input>
                <ul className="SearchList">
                    {trackList.map((element) => (
                        <li className="SearchList" key={element.track_id}>
                            <button className="SearchListButton" onClick={() => {onHandleFetch(element.track_id)}}>
                                <div>
                                    <CoverImage src={element.artwork} size={64}/>
                                </div>
                                <div style={{display: 'flex', justifyContent: 'center', textAlign: 'left'}}>
                                    <h4>{element.title}</h4>
                                </div>
                                <div>
                                    {element.handle}
                                </div>
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
        </>
    );
}
