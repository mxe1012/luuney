import { useState } from "react";

import type { PlaylistPaneProps } from "../../utils/types";

import RecentsList from "./playlistpane_components/RecentsList";
import FavoritesList from "./playlistpane_components/FavoritesList";

import PlaylistSelectionList from "./playlistpane_components/PlaylistSelectionList";
import PlaylistPaneController from "./playlistpane_components/PlaylistPaneController";
import EmptyListMessage from "./playlistpane_components/EmptyListMessage";

export default function PlaylistPane({recents, favorites, playlist, onFavoritesList, onRecentsList, isFavorited, onSetPlaylist, onDeleteEntry, onClearQueue, onDeletePlaylist, onDeletePlaylistEntry, onAddToFavorites, onHandleFetch, onIsPlaying, onSetTrackQueue, onSetCurrentTrackIndex}: PlaylistPaneProps) {

    const [isRecentsVisible, setIsRecentsVisible] = useState(true);
    const [isFavoritesVisible, setIsFavoritesVisible] = useState(false);
    const [isPlaylistSelectionVisible, setIsPlaylistSelectionVisible] = useState(false);
    
    const [isSelectedPlaylist, setIsSelectedPlaylist] = useState(false);

    return (
        <div className="PlaylistPane">
            <PlaylistPaneController
                isRecentsVisible={isRecentsVisible}
                isFavoritesVisible={isFavoritesVisible}
                isPlaylistSelectionVisible={isPlaylistSelectionVisible} 
                isSelectedPlaylist={isSelectedPlaylist}
                onSetIsRecentsVisible={setIsRecentsVisible}
                onSetIsFavoritesVisible={setIsFavoritesVisible}
                onSetIsPlaylistSelectionVisible={setIsPlaylistSelectionVisible}
                onSetIsSelectedPlaylist={setIsSelectedPlaylist}
            />
            {recents.length === 0 && isRecentsVisible 
                ? 
                <EmptyListMessage 
                    listName="Recents"
                    extraMessage="Listen to some songs to get started!"
                /> 
                : 
                <RecentsList 
                    list={recents} 
                    onRecentsList={onRecentsList} 
                    onClearQueue={onClearQueue}
                    onAddToFavorites={onAddToFavorites}
                    onDeleteEntry={onDeleteEntry} 
                    isFavorited={isFavorited} 
                    visible={isRecentsVisible} 
                    onHandleFetch={onHandleFetch}
                    onIsPlaying={onIsPlaying}
                    onSetTrackQueue={onSetTrackQueue}
                    onSetCurrentTrackIndex={onSetCurrentTrackIndex} 
                />
            }
            {favorites.length === 0 && isFavoritesVisible 
                ? 
                <EmptyListMessage 
                    listName="Favorites"
                    extraMessage="Click on any ❤️ icon to favorite songs!"
                /> 
                : 
                <FavoritesList 
                    list={favorites}  
                    onFavoritesList={onFavoritesList} 
                    onClearQueue={onClearQueue}
                    visible={isFavoritesVisible}
                    onDeleteEntry={onDeleteEntry} 
                    onHandleFetch={onHandleFetch} 
                    onIsPlaying={onIsPlaying}
                    onSetTrackQueue={onSetTrackQueue} 
                    onSetCurrentTrackIndex={onSetCurrentTrackIndex}
                />
            }
            {playlist.length === 0 && isPlaylistSelectionVisible 
                ? 
                <EmptyListMessage 
                    listName="Playlists"
                    extraMessage="Click on the + icon in the playlist menu to create a playlist!"
                /> 
                : 
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
                    onClearQueue={onClearQueue}
                    onSetIsPlaylistSelectionVisible={setIsPlaylistSelectionVisible}
                    onHandleFetch={onHandleFetch} 
                    onIsPlaying={onIsPlaying} 
                    onSetCurrentTrackIndex={onSetCurrentTrackIndex}
                    onSetTrackQueue={onSetTrackQueue}
                />
            }
        </div>
    )
}
