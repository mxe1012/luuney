import { useState } from "react";

import type { PlaylistSelectionProps } from "../../../utils/types";

import { formatTime, getDurationSum } from "../../../utils/helpers";

import CoverImage from "../../CoverImage";
import ListButton from "./ListButton";

export default function PlaylistSelectionList({list, visible, isSelectedPlaylist, onIsSelectedPlaylist, onSetIsPlaylistSelectionVisible, onDeletePlaylist, onDeletePlaylistEntry, onAddToFavorites, isFavorited, onSetPlaylist, onHandleFetch, onIsPlaying, onSetTrackQueue, onSetCurrentTrackIndex}: PlaylistSelectionProps) {

    const [playlistId, setPlaylistId] = useState<string | null>("");

    return (
        <>
            {!isSelectedPlaylist ? 
                <ul className={visible ? "PlaylistPaneFolderList" : "PlaylistPaneFolderList hidden"}>
                    {list.map((playlist) => (
                        <li key={playlist.id}>
                            <div style={{display: "flex", justifyContent:"flex-start", gap: "6px"}}>
                                <button className="PlaylistButton" onClick={() => {
                                    onIsSelectedPlaylist(true)
                                    onSetIsPlaylistSelectionVisible(false);
                                    setPlaylistId(playlist.id);
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
                                    onClick={(e) => {
                                        e.stopPropagation();
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
                :
                <ul className="PlaylistPaneFolderList">
                    <div>
                        <button id="PlaylistBackBtn"
                        onClick={() => {
                            onSetIsPlaylistSelectionVisible(true)
                            onIsSelectedPlaylist(false)
                            setPlaylistId("");
                        }}>
                            Back</button>
                    </div>
                    {list.map((playlist) => (
                    <ul key={playlist.id} 
                        style={{
                            display: playlist.id !== playlistId ? "none" : "",
                            visibility: playlist.id !== playlistId ? "hidden" : "visible"
                        }} 
                        className={"PlaylistPaneFolderList"}>
                        {playlist.id === playlistId && playlist.tracks.map((element, index) => (
                            <li key={element.track_id} className="PlaylistPaneFolderList">
                                <ListButton
                                    list={playlist.tracks}
                                    track={element}
                                    playlist={playlist}
                                    index={index}
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
                    ))}
                </ul>
            }
        </>
    )
}
