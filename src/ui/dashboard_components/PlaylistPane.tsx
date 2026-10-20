import { useState } from "react";

import type { PlaylistPaneProps } from "../../utils/types";

import RecentsList from "./playlistpane_components/RecentsList";
import FavoritesList from "./playlistpane_components/FavoritesList";

import PlaylistSelectionList from "./playlistpane_components/PlaylistSelectionList";
import PlaylistPaneController from "./playlistpane_components/PlaylistPaneController";

export default function PlaylistPane({recents, favorites, playlist, onFavoritesList, onRecentsList, isFavorited, onSetPlaylist, onDeleteEntry, onDeletePlaylist, onDeletePlaylistEntry, onAddToFavorites, onHandleFetch, onIsPlaying, onSetTrackQueue, onSetCurrentTrackIndex}: PlaylistPaneProps) {

    const [isRecentsVisible, setIsRecentsVisible] = useState(false);
    const [isFavoritesVisible, setIsFavoritesVisible] = useState(false);
    const [isPlaylistSelectionVisible, setIsPlaylistSelectionVisible] = useState(false);
    
    const [isSelectedPlaylist, setIsSelectedPlaylist] = useState(false);

    return (
        <div className="PlaylistPane">
            <PlaylistPaneController
                isRecentsVisible={isRecentsVisible}
                isFavoritesVisible={isFavoritesVisible}
                isPlaylistSelectionVisible={isPlaylistSelectionVisible} 
                onSetIsRecentsVisible={setIsRecentsVisible}
                onSetIsFavoritesVisible={setIsFavoritesVisible}
                onSetIsPlaylistSelectionVisible={setIsPlaylistSelectionVisible}
                onSetIsSelectedPlaylist={setIsSelectedPlaylist}
            />
            <RecentsList 
                list={recents} 
                onRecentsList={onRecentsList} 
                onAddToFavorites={onAddToFavorites}
                onDeleteEntry={onDeleteEntry} 
                isFavorited={isFavorited} 
                visible={isRecentsVisible} 
                onHandleFetch={onHandleFetch}
                onIsPlaying={onIsPlaying}
                onSetTrackQueue={onSetTrackQueue} 
            />
            <FavoritesList 
                list={favorites}  
                onFavoritesList={onFavoritesList} 
                visible={isFavoritesVisible}
                onDeleteEntry={onDeleteEntry} 
                onHandleFetch={onHandleFetch} 
                onIsPlaying={onIsPlaying}
                onSetTrackQueue={onSetTrackQueue} 
                onSetCurrentTrackIndex={onSetCurrentTrackIndex}
            />
            <PlaylistSelectionList 
                list={playlist} 
                onSetPlaylist={onSetPlaylist}
                isSelectedPlaylist={isSelectedPlaylist} 
                onIsSelectedPlaylist={setIsSelectedPlaylist}
                visible={isPlaylistSelectionVisible} 
                isFavorited={isFavorited} 
                onAddToFavorites={onAddToFavorites}
                onDeletePlaylist={onDeletePlaylist} 
                onDeletePlaylistEntry={onDeletePlaylistEntry}
                onSetIsPlaylistSelectionVisible={setIsPlaylistSelectionVisible}
                onHandleFetch={onHandleFetch} 
                onIsPlaying={onIsPlaying} 
            />
        </div>
    )
}
