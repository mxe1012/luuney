import { useState } from "react";

import type { PlaylistSelectionProps } from "../../../utils/types";

import { CoverImage } from "../../Containers";

export default function PlaylistSelectionList({list, visible, isSelectedPlaylist, onIsSelectedPlaylist, onSetIsPlaylistSelectionVisible, onHandleFetch, onIsPlaying}: PlaylistSelectionProps) {

    const [playlistId, setPlaylistId] = useState<string | null>("");
    
    return (
        <>
            {!isSelectedPlaylist ? 
                <ul className={visible ? "PlaylistPaneFolderList" : "PlaylistPaneFolderList hidden"}>
                    {list.map((playlist) => (
                        <li key={playlist.id} >
                            <div>
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
                                    </div>
                                </button>
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
                        {playlist.id === playlistId && playlist.tracks.map((element) => (
                            <li key={element.track_id} className="PlaylistPaneFolderList">
                                <button className="PlaylistButton" onClick={() => {
                                    onHandleFetch(element.track_id);
                                    onIsPlaying(false);
                                }}>
                                    <div style={{display: "flex", justifyContent: "flex-start", alignItems: "center", gap: '12px'}}>
                                        <div style={{flexShrink: 0}}>
                                            <CoverImage styles={{borderRadius: '10px'}} src={element.artwork} size={64}/>
                                        </div>
                                        <div style={{textAlign: 'left', minWidth: 0, flex: 1}}>
                                            <h4>{element.title}</h4>
                                            <h5>{element.handle}</h5>
                                        </div>
                                    </div>
                                </button>
                            </li>
                        ))}
                    </ul>
                    ))}
                </ul>
            }
        </>
    )
}
