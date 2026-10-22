import type { PlaylistPaneControllerProps } from "../../../utils/types";

export default function PlaylistPaneController({isRecentsVisible, isFavoritesVisible, isPlaylistSelectionVisible, isSelectedPlaylist, onSetIsRecentsVisible, onSetIsFavoritesVisible, onSetIsPlaylistSelectionVisible, onSetIsSelectedPlaylist}: PlaylistPaneControllerProps) {

    return (
        <>
            <div className="PlaylistPaneController">
                <button className={isRecentsVisible ? "PlaylistPaneControllerButton is-selected" : "PlaylistPaneControllerButton"} 
                onClick={() => {
                    onSetIsRecentsVisible(true);
                    onSetIsFavoritesVisible(false);
                    onSetIsPlaylistSelectionVisible(false);
                    onSetIsSelectedPlaylist(false);
                }}>
                    Recents
                </button>
                <button className={isFavoritesVisible ? "PlaylistPaneControllerButton is-selected" : "PlaylistPaneControllerButton"}  
                onClick={() => {
                    onSetIsRecentsVisible(false);
                    onSetIsFavoritesVisible(true);
                    onSetIsPlaylistSelectionVisible(false);
                    onSetIsSelectedPlaylist(false);
                }}>
                    Favorites
                </button>
                <button className={isPlaylistSelectionVisible ? "PlaylistPaneControllerButton is-selected" : "PlaylistPaneControllerButton"} 
                onClick={() => {
                    onSetIsRecentsVisible(false);
                    onSetIsFavoritesVisible(false);
                    onSetIsPlaylistSelectionVisible(true);
                    onSetIsSelectedPlaylist(false);
                }} 
                >
                    {(!isPlaylistSelectionVisible || isPlaylistSelectionVisible) && !isSelectedPlaylist ? "Playlists" : "< Back"}</button>
            </div>
        </>
    )
}
