import { Fragment, useEffect, useRef, useState } from "react";

import type { PlaylistSelectionProps, TrackObject } from "../../../utils/types";

import { formatTime, getDurationSum } from "../../../utils/helpers";

import usePagination from "../../../hooks/usePagination"; 

import CoverImage from "../../CoverImage";
import ListButton from "./ListButton";
import PaginationController from "../../PaginationController";
import { useSnackbar } from "../../../hooks/SnackbarContext";
import { MiniIcon } from "../../Containers";

const EMPTY_TRACKS: TrackObject[] = [];

export default function PlaylistSelectionList({list, visible, isSelectedPlaylist, onIsSelectedPlaylist, onSetIsPlaylistSelectionVisible, onDeletePlaylist, onDeletePlaylistEntry, onClearQueue, onAddToFavorites, isFavorited, onSetPlaylist, onHandleFetch, onIsPlaying, onSetTrackQueue, onSetCurrentTrackIndex, onHandleRenamePlaylist, onHandleCreatePlaylist}: PlaylistSelectionProps) {

    const [playlistId, setPlaylistId] = useState("");

    const [isCreateMenuVisible, setIsCreateMenuVisible] = useState(false);
    const [isRenameMenuVisible, setIsRenameMenuVisible] = useState(false);

    const [createValue, setCreateValue] = useState("");
    const [renameValue, setRenameValue] = useState("");

    const renameWrapperRef = useRef<HTMLDivElement>(null);

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

    useEffect(() => {
        const handleMouseDown = (e: MouseEvent) => {
            if (!renameWrapperRef.current?.contains(e.target as Node)) {
                setIsRenameMenuVisible(false)
                setIsCreateMenuVisible(false);
            };
        };

        document.addEventListener("mousedown", handleMouseDown);
        return () => document.removeEventListener("mousedown", handleMouseDown);
    }, []);

    if(!isSelectedPlaylist) {
        return (
            <>
                <div ref={renameWrapperRef} className="PlaylistMenuWrapper PlaylistTitleCard">
                    <h2 className="CreamColor CenterText NoMargin">Create Playlist</h2>
                    <button className="ListActionBtn"
                        onClick={() => {setIsCreateMenuVisible(!isCreateMenuVisible); setCreateValue("")}}
                        aria-label="create playlist">
                        <MiniIcon src="/assets/audio_player_icons/plus.svg" size={16} />
                    </button>
                    <div className={isCreateMenuVisible ? "PlaylistMenu OpensDown" : "PlaylistMenu OpensDown hidden"}>
                        <div className="MenuActions">
                            <input className="PlaylistMenuInput" value={createValue} placeholder="Playlist name"
                                onChange={(e) => setCreateValue(e.target.value)}
                            />
                            <button className="PlaylistMenuAddItemBtn" 
                                disabled={createValue.trim().length === 0}
                                onClick={() => onHandleCreatePlaylist(createValue.trim())}>
                                    <MiniIcon src="/assets/check.svg" size={12} />
                            </button>
                        </div>
                    </div>
                </div>
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
                                            <h6><time>{formatTime(getDurationSum(playlist))}</time></h6>
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
                        onClick={() => {showSnackbar("All playlists cleared!"); onSetPlaylist?.([]); list.forEach(p => onClearQueue?.(p.id))}}>
                            Clear
                        </button>
                    </div>
                </div>
            </>
        );
    }
    return (
        <>
            <div ref={renameWrapperRef} className="PlaylistMenuWrapper PlaylistTitleCard">
                <h2 className="CreamColor CenterText NoMargin">{selectedPlaylistName}</h2>
                <button className="ListActionBtn"
                    onClick={() => {setIsRenameMenuVisible(!isRenameMenuVisible); setRenameValue(selectedPlaylistName)}}
                    aria-label="rename playlist">
                    <MiniIcon src="/assets/edit.svg" size={16} />
                </button>
                <div className={isRenameMenuVisible ? "PlaylistMenu OpensDown" : "PlaylistMenu OpensDown hidden"}>
                    <div className="MenuActions">
                        <input className="PlaylistMenuInput" value={renameValue} placeholder="Playlist name"
                            onChange={(e) => setRenameValue(e.target.value)}
                        />
                        <button className="PlaylistMenuAddItemBtn" 
                            disabled={renameValue.trim().length === 0}
                            onClick={() => onHandleRenamePlaylist(playlistId, renameValue.trim())}>
                                <MiniIcon src="/assets/check.svg" size={12} />
                        </button>
                    </div>
                </div>
            </div>
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
                                onClearQueue?.(playlistId);
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
