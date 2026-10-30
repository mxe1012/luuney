import { useState } from "react";

import type { PlaylistSelectionProps, TrackObject } from "../../../utils/types";

import { formatTime, getDurationSum } from "../../../utils/helpers";

import usePagination from "../../../hooks/usePagination"; 

import CoverImage from "../../CoverImage";
import ListButton from "./ListButton";
import PaginationController from "../../PaginationController";

export default function PlaylistSelectionList({list, visible, isSelectedPlaylist, onIsSelectedPlaylist, onSetIsPlaylistSelectionVisible, onDeletePlaylist, onDeletePlaylistEntry, onAddToFavorites, isFavorited, onSetPlaylist, onHandleFetch, onIsPlaying, onSetTrackQueue, onSetCurrentTrackIndex}: PlaylistSelectionProps) {

    const [playlistId, setPlaylistId] = useState<string | null>("");
    const [playlistIndex, setPlaylistIndex] = useState(0);

    const { pageItems, page, pageCount, hasPrev, hasNext, next, prev } = usePagination(list, 10);

    // module level, so the fallback array has a stable reference
    const EMPTY_TRACKS: TrackObject[] = [];

    // inside the component, next to your existing hook call
    const selectedPlaylist = list.find((p) => p.id === playlistId)?.tracks ?? EMPTY_TRACKS;;

    const {
        pageItems: trackPageItems,
        page: trackPage,
        pageCount: trackPageCount,
        hasPrev: trackHasPrev,
        hasNext: trackHasNext,
        next: trackNext,
        prev: trackPrev,
    } = usePagination(selectedPlaylist, 10);
    
    if(!isSelectedPlaylist) {
        return (
            <>
                <ul className={visible ? "PlaylistPaneFolderList" : "PlaylistPaneFolderList hidden"}>
                    {pageItems.map((playlist, index) => (
                        <li key={playlist.id} className="PlaylistPaneFolderList">
                            <div style={{display: "flex", justifyContent:"flex-start", gap: "6px"}}>
                                <button className="PlaylistButton" onClick={() => {
                                    onIsSelectedPlaylist(true)
                                    onSetIsPlaylistSelectionVisible(false);
                                    setPlaylistId(playlist.id);
                                    setPlaylistIndex(index);
                                }}>
                                    <div style={{display: "flex", justifyContent: "flex-start", alignItems: "center", gap: '12px'}}>
                                        <div style={{flexShrink: 0}}>
                                            <CoverImage styles={{borderRadius: '10px'}} src={"/assets/playlist-icon.svg"} size={64}/>
                                        </div>
                                        <div style={{textAlign: 'left', minWidth: 0, flex: 1}}>
                                            <h4>{playlist.name}</h4>
                                            <h5>({playlist.tracks.length} tracks)</h5>
                                        </div>
                                        <div style={{textAlign: 'right', minWidth: 0}}>
                                            <h6>{formatTime(getDurationSum(playlist))}</h6>
                                        </div>
                                    </div>
                                </button>
                                <div style={{display: "grid", alignItems: "center"}}>
                                    <button className="ListActionBtn"
                                    onClick={() => {
                                        onSetPlaylist(onDeletePlaylist(playlist));
                                    }}
                                    >
                                    <img src="/assets/delete.svg" />
                                    </button>
                                </div>
                            </div>
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
                    visible={visible}
                />
            </>
        );
    }
    return (
        <>
            <h2 style={{margin: 0, padding: 0, textAlign: "center", color: "#F3D9C7"}}>{list[playlistIndex].name}</h2>
            {list.map((playlist) => (
                <>
                <ul key={playlist.id} 
                    style={{
                        display: playlist.id !== playlistId ? "none" : "",
                        visibility: playlist.id !== playlistId ? "hidden" : "visible"
                    }} 
                    className={"PlaylistPaneFolderSelection"}>
                    {playlist.id === playlistId && trackPageItems.map((element) => (
                        <li key={element.track_id} className="PlaylistPaneFolderList">
                            <ListButton
                                list={playlist.tracks}
                                track={element}
                                playlist={playlist}
                                index={playlist.tracks.findIndex((t) => t.track_id === element.track_id)}
                                onHandleFetch={onHandleFetch}
                                onAddToFavorites={onAddToFavorites}
                                hasDeleteButton={true}
                                hasFavoriteButton={true}
                                isFavorited={isFavorited}
                                onIsPlaying={onIsPlaying}
                                onDeletePlaylistEntry={onDeletePlaylistEntry}
                                onSetCurrentTrackIndex={onSetCurrentTrackIndex}
                                onSetTrackQueue={onSetTrackQueue}
                            />
                        </li>
                    ))}
                </ul>
                {playlist.id === playlistId && 
                    <PaginationController 
                        className="Pagination"
                        page={trackPage} 
                        pageCount={trackPageCount} 
                        prev={trackPrev} 
                        hasPrev={trackHasPrev} 
                        next={trackNext} 
                        hasNext={trackHasNext} 
                        visible={true}
                    />
                }
                </>
            ))}
        </>
    )
}
