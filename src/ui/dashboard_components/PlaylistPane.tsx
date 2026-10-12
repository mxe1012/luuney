import { useState } from "react";
import type { PlaylistPaneProps } from "../../utils/types";
// import { CoverImage } from "../Containers";
import RecentsList from "./playlistpane_components/RecentsList";
import FavoritesList from "./playlistpane_components/FavoritesList";

import type { TrackObject } from "../../utils/types";
import { CoverImage } from "../Containers";

export default function PlaylistPane({recents, favorites, playlist, onFavoritesList, onRecentsList, isFavorited, onDeleteEntry, onAddToFavorites, onHandleFetch, onHandleCreatePlaylist, onHandleAddToPlaylist, onIsPlaying}: PlaylistPaneProps) {

    const [isRecentsVisible, setIsRecentsVisible] = useState(false);
    const [isFavoritesVisible, setIsFavoritesVisible] = useState(false);

    const [isPlaylistSelectionVisible, setIsPlaylistSelectionVisible] = useState(false);
    
    const [playlistId, setPlaylistId] = useState<string | null>("");
    const [isSelectedPlaylist, setIsSelectedPlaylist] = useState(false);

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
        <div className="PlaylistPane">
            <div className="PlaylistPaneController">
                <button className="PlaylistPaneControllerButton" 
                onClick={() => {
                    setIsRecentsVisible(true);
                    setIsFavoritesVisible(false);
                    setIsPlaylistSelectionVisible(false);
                }}>
                    Recents
                </button>
                <button className="PlaylistPaneControllerButton" 
                onClick={() => {
                    setIsRecentsVisible(false);
                    setIsFavoritesVisible(true);
                    setIsPlaylistSelectionVisible(false);
                }}>
                    Favorites
                </button>
                <button className="PlaylistPaneControllerButton"
                onClick={() => {
                    setIsRecentsVisible(false);
                    setIsFavoritesVisible(false);
                    setIsPlaylistSelectionVisible(true);
                }} 
                >
                    Playlists</button>
            </div>
            <RecentsList list={recents} onRecentsList={onRecentsList} onAddToFavorites={onAddToFavorites}
            onDeleteEntry={onDeleteEntry} isFavorited={isFavorited} visible={isRecentsVisible} onHandleFetch={onHandleFetch}
            onIsPlaying={onIsPlaying} />
            <FavoritesList list={favorites}  onFavoritesList={onFavoritesList} visible={isFavoritesVisible}
            onDeleteEntry={onDeleteEntry} onHandleFetch={onHandleFetch} onIsPlaying={onIsPlaying}/>
            {!isSelectedPlaylist ? 
                <ul className={isPlaylistSelectionVisible ? "PlaylistPaneList" : "PlaylistPaneList hidden"}>
                    <button onClick={() => onHandleCreatePlaylist("Palylist One", TEST_TRACK)}>add playlist 1</button>
                    <button onClick={() => onHandleCreatePlaylist("Playlist Two", TEST_TRACK_2)}>add playlist 2</button>
                    <button
                    onClick={() => playlist[1] && onHandleAddToPlaylist(playlist[1].id, TEST_TRACK_3)}>
                    add to second
                    </button>
                    {playlist.map((playlist) => (
                        <li key={playlist.id}>
                            <button onClick={() => {
                                setIsSelectedPlaylist(true)
                                setIsPlaylistSelectionVisible(false);
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
                        setIsPlaylistSelectionVisible(true)
                        setIsSelectedPlaylist(false)
                        setPlaylistId("");
                    }}>
                        back</button>
                    {playlist.map((playlist) => (
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
        </div>
    )
}
