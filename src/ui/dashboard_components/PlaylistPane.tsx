import { useState } from "react";

import type { PlaylistPaneProps } from "../../utils/types";
import { useLibrary } from "../../hooks/LibraryContext";

import RecentsList from "./playlistpane_components/RecentsList";
import FavoritesList from "./playlistpane_components/FavoritesList";

import PlaylistSelectionList from "./playlistpane_components/PlaylistSelectionList";
import PlaylistPaneController from "./playlistpane_components/PlaylistPaneController";
import EmptyListMessage from "./playlistpane_components/EmptyListMessage";
import PillTitle from "./playlistpane_components/PillTitle";

export default function PlaylistPane({recents, favorites, playlist, onFavoritesList, onRecentsList, onSetPlaylist, onHandleRenamePlaylist, onDeleteEntry, onClearQueue, onDeletePlaylist, onDeletePlaylistEntry}: PlaylistPaneProps) {

    const { onHandleCreatePlaylist } = useLibrary();

    const [isRecentsVisible, setIsRecentsVisible] = useState(true);
    const [isFavoritesVisible, setIsFavoritesVisible] = useState(false);
    const [isPlaylistSelectionVisible, setIsPlaylistSelectionVisible] = useState(false);
    
    const [isSelectedPlaylist, setIsSelectedPlaylist] = useState(false);

    return (
        <div className="GlassCard PlaylistPane">
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
                    onDeleteEntry={onDeleteEntry} 
                    visible={isRecentsVisible} 
                />
            }
            {favorites.length === 0 && isFavoritesVisible 
                ? 
                <EmptyListMessage 
                    listName="Favorites"
                    extraMessage="Click any ❤️ icon to favorite songs!"
                /> 
                : 
                <FavoritesList 
                    list={favorites}  
                    onFavoritesList={onFavoritesList} 
                    onClearQueue={onClearQueue}
                    visible={isFavoritesVisible}
                    onDeleteEntry={onDeleteEntry} 
                />
            }
            {playlist.length === 0 && isPlaylistSelectionVisible 
                ? 
                <>
                <PillTitle
                    heading="Create Playlist"
                    actionIcon="/assets/audio_player_icons/plus.svg"
                    actionLabel="create playlist"
                    initialValue=""
                    onSubmit={(name) => onHandleCreatePlaylist(name)}
                />
                <EmptyListMessage 
                    listName="Playlists"
                    extraMessage="Click the + icon to create a new playlist or add to an existing playlist!"
                />
                </> 
                : 
                <PlaylistSelectionList 
                    list={playlist} 
                    onSetPlaylist={onSetPlaylist}
                    isSelectedPlaylist={isSelectedPlaylist} 
                    onIsSelectedPlaylist={setIsSelectedPlaylist}
                    visible={isPlaylistSelectionVisible} 
                    onHandleRenamePlaylist={onHandleRenamePlaylist}
                    onDeletePlaylist={onDeletePlaylist} 
                    onDeletePlaylistEntry={onDeletePlaylistEntry}
                    onClearQueue={onClearQueue}
                    onSetIsPlaylistSelectionVisible={setIsPlaylistSelectionVisible}
                />
            }
        </div>
    )
}
