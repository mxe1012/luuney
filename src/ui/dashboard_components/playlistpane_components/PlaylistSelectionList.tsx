import { useState } from "react";

import type { PlaylistSelectionProps } from "../../../utils/types";

import { CoverImage } from "../../Containers";

export default function PlaylistSelectionList({list, visible, isSelectedPlaylist, onIsSelectedPlaylist, onSetIsPlaylistSelectionVisible}: PlaylistSelectionProps) {

    const [playlistId, setPlaylistId] = useState<string | null>("");
    
    return (
        <>
            {!isSelectedPlaylist ? 
                <ul className={visible ? "PlaylistPaneList" : "PlaylistPaneList hidden"}>
                    {list.map((playlist) => (
                        <li key={playlist.id}>
                            <button onClick={() => {
                                onIsSelectedPlaylist(true)
                                onSetIsPlaylistSelectionVisible(false);
                                setPlaylistId(playlist.id);
                            }}>
                                {playlist.name} ({playlist.tracks.length} tracks)
                            </button>
                        </li>
                    ))}
                </ul>
                :
                <ul>
                    <button onClick={() => {
                        onSetIsPlaylistSelectionVisible(true)
                        onIsSelectedPlaylist(false)
                        setPlaylistId("");
                    }}>
                        back</button>
                    {list.map((playlist) => (
                    <ul key={playlist.id} 
                        style={{
                            display: playlist.id !== playlistId ? "none" : "",
                            visibility: playlist.id !== playlistId ? "hidden" : "visible"
                        }} 
                        className={"PlaylistPaneFolderList"}>
                        {playlist.id === playlistId && playlist.tracks.map((element) => (
                            <li key={element.track_id} className="PlaylistPaneFolderList">
                                <button>
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
