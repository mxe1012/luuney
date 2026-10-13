import { useState } from "react";

import type { PlaylistPaneProps } from "../../utils/types";

import RecentsList from "./playlistpane_components/RecentsList";
import FavoritesList from "./playlistpane_components/FavoritesList";

import PlaylistSelectionList from "./playlistpane_components/PlaylistSelectionList";

export default function PlaylistPane({recents, favorites, playlist, onFavoritesList, onRecentsList, isFavorited, onSetPlaylist, onDeleteEntry, onDeletePlaylist, onDeletePlaylistEntry, onAddToFavorites, onHandleFetch, onIsPlaying}: PlaylistPaneProps) {

    const [isRecentsVisible, setIsRecentsVisible] = useState(false);
    const [isFavoritesVisible, setIsFavoritesVisible] = useState(false);
    const [isPlaylistSelectionVisible, setIsPlaylistSelectionVisible] = useState(false);
    
    const [isSelectedPlaylist, setIsSelectedPlaylist] = useState(false);

    return (
        <div className="PlaylistPane">
            <div className="PlaylistPaneController">
                <button className={isRecentsVisible ? "PlaylistPaneControllerButton is-selected" : "PlaylistPaneControllerButton"} 
                onClick={() => {
                    setIsRecentsVisible(true);
                    setIsFavoritesVisible(false);
                    setIsPlaylistSelectionVisible(false);
                    setIsSelectedPlaylist(false);
                }}>
                    Recents
                </button>
                <button className={isFavoritesVisible ? "PlaylistPaneControllerButton is-selected" : "PlaylistPaneControllerButton"}  
                onClick={() => {
                    setIsRecentsVisible(false);
                    setIsFavoritesVisible(true);
                    setIsPlaylistSelectionVisible(false);
                    setIsSelectedPlaylist(false);
                }}>
                    Favorites
                </button>
                <button className={isPlaylistSelectionVisible ? "PlaylistPaneControllerButton is-selected" : "PlaylistPaneControllerButton"} 
                onClick={() => {
                    setIsRecentsVisible(false);
                    setIsFavoritesVisible(false);
                    setIsPlaylistSelectionVisible(true);
                    setIsSelectedPlaylist(false);
                }} 
                >
                    Playlists</button>
            </div>
            <RecentsList list={recents} onRecentsList={onRecentsList} onAddToFavorites={onAddToFavorites}
            onDeleteEntry={onDeleteEntry} isFavorited={isFavorited} visible={isRecentsVisible} onHandleFetch={onHandleFetch}
            onIsPlaying={onIsPlaying} />
            <FavoritesList list={favorites}  onFavoritesList={onFavoritesList} visible={isFavoritesVisible}
            onDeleteEntry={onDeleteEntry} onHandleFetch={onHandleFetch} onIsPlaying={onIsPlaying}/>
            <PlaylistSelectionList list={playlist} onSetPlaylist={onSetPlaylist}
            isSelectedPlaylist={isSelectedPlaylist} onIsSelectedPlaylist={setIsSelectedPlaylist}
            visible={isPlaylistSelectionVisible} isFavorited={isFavorited} onAddToFavorites={onAddToFavorites}
            onDeletePlaylist={onDeletePlaylist} onDeletePlaylistEntry={onDeletePlaylistEntry}
            onSetIsPlaylistSelectionVisible={setIsPlaylistSelectionVisible}
            onHandleFetch={onHandleFetch} onIsPlaying={onIsPlaying}
            />
        </div>
    )
}
