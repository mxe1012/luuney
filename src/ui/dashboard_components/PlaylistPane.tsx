import { useState } from "react";
import type { PlaylistPaneProps } from "../../utils/types";
// import { CoverImage } from "../Containers";
import RecentsList from "./playlistpane_components/RecentsList";
import FavoritesList from "./playlistpane_components/FavoritesList";


export default function PlaylistPane({recents, favorites, onFavoritesList, onRecentsList, isFavorited, onDeleteEntry, onAddToFavorites, onHandleFetch, onIsPlaying}: PlaylistPaneProps) {

    const [isRecentsVisible, setIsRecentsVisible] = useState(false);
    const [isFavoritesVisible, setIsFavoritesVisible] = useState(false);

    return (
        <div className="PlaylistPane">
            <div className="PlaylistPaneController">
                <button className="PlaylistPaneControllerButton" 
                onClick={() => {
                    setIsRecentsVisible(true);
                    setIsFavoritesVisible(false);
                }}>
                    Recents
                </button>
                <button className="PlaylistPaneControllerButton" 
                onClick={() => {
                    setIsRecentsVisible(false);
                    setIsFavoritesVisible(true);
                }}>
                    Favorites
                </button>
                <button className="PlaylistPaneControllerButton">Playlists</button>
                {/* <button className="PlaylistPaneControllerButton">Trending</button> */}
            </div>
            <RecentsList list={recents} onRecentsList={onRecentsList} onAddToFavorites={onAddToFavorites}
            onDeleteEntry={onDeleteEntry} isFavorited={isFavorited} visible={isRecentsVisible} onHandleFetch={onHandleFetch}
            onIsPlaying={onIsPlaying} />
            <FavoritesList list={favorites}  onFavoritesList={onFavoritesList} visible={isFavoritesVisible} onDeleteEntry={onDeleteEntry} onHandleFetch={onHandleFetch} onIsPlaying={onIsPlaying}/>
        </div>
    )
}
