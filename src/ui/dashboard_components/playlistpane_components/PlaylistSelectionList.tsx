import { Fragment, useState } from "react";

import type { PlaylistSelectionProps, TrackObject } from "../../../utils/types";

import { formatTime, getDurationSum } from "../../../utils/helpers";

import usePagination from "../../../hooks/usePagination"; 

import CoverImage from "../../CoverImage";
import ListButton from "./ListButton";
import PaginationController from "../../PaginationController";
import { useSnackbar } from "../../../hooks/SnackbarContext";

const EMPTY_TRACKS: TrackObject[] = [];

export default function PlaylistSelectionList({list, visible, isSelectedPlaylist, onIsSelectedPlaylist, onSetIsPlaylistSelectionVisible, onDeletePlaylist, onDeletePlaylistEntry, onAddToFavorites, isFavorited, onSetPlaylist, onHandleFetch, onIsPlaying, onSetTrackQueue, onSetCurrentTrackIndex}: PlaylistSelectionProps) {

    const [playlistId, setPlaylistId] = useState("");

    const { pageItems, page, pageCount, hasPrev, hasNext, next, prev } = usePagination(list, 10);
    
    const selectedPlaylist = list.find((p) => p.id === playlistId)?.tracks ?? EMPTY_TRACKS;
    const selectedPlaylistName = list.find((p) => p.id === playlistId)?.name ?? "";

    const { showSnackbar } = useSnackbar();

    const {
        pageItems: trackPageItems,
        page: trackPage,
        pageCount: trackPageCount,
        hasPrev: trackHasPrev,
        hasNext: trackHasNext,
        next: trackNext,
        prev: trackPrev,
        start: trackStart
    } = usePagination(selectedPlaylist, 10);
    
    if(!isSelectedPlaylist) {
        return (
            <>
                <ul className={visible ? "PlaylistPaneFolderList" : "PlaylistPaneFolderList hidden"}>
                    {pageItems.map((playlist) => (
                        <li key={playlist.id} className="PlaylistPaneFolderList">
                            <div className="ListRow">
                                <button className="PlaylistButton" onClick={() => {
                                    onIsSelectedPlaylist(true)
                                    onSetIsPlaylistSelectionVisible(false);
                                    setPlaylistId(playlist.id);
                                }}>
                                    <div className="ListItem">
                                        <div className="ListCover">
                                            <CoverImage styles={{borderRadius: '10px'}} src={"/assets/playlist-icon.svg"} size={64}/>
                                        </div>
                                        <div  className="ListText">
                                            <h4>{playlist.name}</h4>
                                            <h5>({playlist.tracks.length} tracks)</h5>
                                        </div>
                                        <div className="ListMeta">
                                            <h6>{formatTime(getDurationSum(playlist))}</h6>
                                        </div>
                                    </div>
                                </button>
                                <div className="ListActions">
                                    <button className="ListActionBtn"
                                    onClick={() => {
                                        onSetPlaylist(onDeletePlaylist(playlist));
                                    }}
                                    aria-label="delete playlist">
                                        <img src="/assets/delete.svg" alt="delete" />
                                    </button>
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
                <div className="RowBetween">
                    <div>
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
                    </div>
                    <div>
                        <button 
                        style={{
                            display: (visible && list.length >= 1) ? "" : "none", 
                        }}
                        className="PlaylistPaneControllerButton" 
                        onClick={() => {showSnackbar("All playlists cleared!"); onSetPlaylist?.([])}}>
                            Clear
                        </button>
                    </div>
                </div>
            </>
        );
    }
    return (
        <>
            <h2 style={{margin: 0, padding: 0, textAlign: "center", color: "#F3D9C7"}}>{selectedPlaylistName}</h2>
            {list.map((playlist) => (
                <Fragment key={playlist.id}>
                <ul  
                    style={{
                        display: playlist.id !== playlistId ? "none" : "",
                        visibility: playlist.id !== playlistId ? "hidden" : "visible"
                    }} 
                    className="PlaylistPaneFolderSelection">
                    {playlist.id === playlistId && trackPageItems.map((element, index) => (
                        <li key={element.track_id} className="PlaylistPaneFolderList">
                            <ListButton
                                list={playlist.tracks}
                                track={element}
                                playlist={playlist}
                                index={trackStart + index}
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
                    <div className="RowBetween">
                        <div>
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
                        </div>
                        <div>
                            <button 
                                style={{
                                    display: selectedPlaylist.length >= 1 ? "" : "none", 
                                }}
                                className="PlaylistPaneControllerButton" 
                                onClick={() => {showSnackbar("Playlist cleared!"); 
                                onSetPlaylist(prev =>
                                    prev.map(p => p.id === playlistId ? { ...p, tracks: [] } : p)
                                );
                            }}>
                                Clear
                            </button>
                        </div>
                    </div>
                }
                </Fragment>
            ))}
        </>
    )
}
