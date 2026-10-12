import { useState } from "react";

import type { PlaylistSelectionProps, TrackObject } from "../../../utils/types";

import { CoverImage } from "../../Containers";

export default function PlaylistSelectionList({list, visible, isSelectedPlaylist, onIsSelectedPlaylist, onSetIsPlaylistSelectionVisible, onHandleAddToPlaylist, onHandleCreatePlaylist}: PlaylistSelectionProps) {

    const [playlistId, setPlaylistId] = useState<string | null>("");
    

    const TEST_TRACK: TrackObject = {
        track_id: 111,
        artwork: "",
        title: "Test Track",
        handle: "Test Artist",
        url: "",
    };

    const TEST_TRACK_2: TrackObject = {
        track_id: 222,
        artwork: "",
        title: "Test Track 2",
        handle: "Test Artist 2",
        url: "",
    };

    const TEST_TRACK_3: TrackObject = {
        track_id: 333,
        artwork: "",
        title: "Test Track 3",
        handle: "Test Artist 3",
        url: "",
    };

    return (
        <>
            {!isSelectedPlaylist ? 
                <ul className={visible ? "PlaylistPaneList" : "PlaylistPaneList hidden"}>
                    <button onClick={() => onHandleCreatePlaylist("Palylist One", TEST_TRACK)}>add playlist 1</button>
                    <button onClick={() => onHandleCreatePlaylist("Playlist Two", TEST_TRACK_2)}>add playlist 2</button>
                    <button
                    onClick={() => list[1] && onHandleAddToPlaylist(list[1].id, TEST_TRACK_3)}>
                    add to second
                    </button>
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
