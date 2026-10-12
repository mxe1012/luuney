import { useState } from "react";
import type { PlaylistPaneProps } from "../../utils/types";
// import { CoverImage } from "../Containers";
import RecentsList from "./playlistpane_components/RecentsList";
import FavoritesList from "./playlistpane_components/FavoritesList";

import type { TrackObject } from "../../utils/types";

export default function PlaylistPane({recents, favorites, playlist, onFavoritesList, onRecentsList, isFavorited, onDeleteEntry, onAddToFavorites, onHandleFetch, onHandleCreatePlaylist, onHandleAddToPlaylist, onIsPlaying}: PlaylistPaneProps) {

    const [isRecentsVisible, setIsRecentsVisible] = useState(false);
    const [isFavoritesVisible, setIsFavoritesVisible] = useState(false);
    const [isCustomPlaylistVisible, setIsCustomPlaylistVisible] = useState(false)

    const TEST_TRACK: TrackObject = {
        track_id: 111,
        artwork: "",
        title: "Test Track",
        handle: "Test Artist",
        url: "",
    };

    const TEST_TRACK_2: TrackObject = {
        track_id: 121,
        artwork: "",
        title: "Test Track",
        handle: "Test Artist",
        url: "",
    };
    
    return (
        <div className="PlaylistPane">
            <div className="PlaylistPaneController">
                <button className="PlaylistPaneControllerButton" 
                onClick={() => {
                    setIsRecentsVisible(true);
                    setIsFavoritesVisible(false);
                    setIsCustomPlaylistVisible(false);
                }}>
                    Recents
                </button>
                <button className="PlaylistPaneControllerButton" 
                onClick={() => {
                    setIsRecentsVisible(false);
                    setIsFavoritesVisible(true);
                    setIsCustomPlaylistVisible(false);
                }}>
                    Favorites
                </button>
                <button className="PlaylistPaneControllerButton"
                onClick={() => {
                    setIsRecentsVisible(false);
                    setIsFavoritesVisible(false);
                    setIsCustomPlaylistVisible(true);
                }} 
                >
                    Playlists</button>
            </div>
            <RecentsList list={recents} onRecentsList={onRecentsList} onAddToFavorites={onAddToFavorites}
            onDeleteEntry={onDeleteEntry} isFavorited={isFavorited} visible={isRecentsVisible} onHandleFetch={onHandleFetch}
            onIsPlaying={onIsPlaying} />
            <FavoritesList list={favorites}  onFavoritesList={onFavoritesList} visible={isFavoritesVisible}
            onDeleteEntry={onDeleteEntry} onHandleFetch={onHandleFetch} onIsPlaying={onIsPlaying}/>
            <ul className={isCustomPlaylistVisible ? "PlaylistPaneList" : "PlaylistPaneList hidden"}>
                <button onClick={() => onHandleCreatePlaylist("aaaa", TEST_TRACK)}>add</button>
                <button
                onClick={() => playlist[0] && onHandleAddToPlaylist(playlist[0].id, TEST_TRACK_2)}>
                add to first
                </button>
                {playlist.map(playlist => (
                    <li key={playlist.id}>
                        <button>{playlist.name} ({playlist.tracks.length} tracks)</button>
                    </li>
                ))}
            </ul>
        </div>
    )
}
