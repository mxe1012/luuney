import { useState } from "react";
import type { PlaylistPaneProps } from "../../utils/types";
// import { CoverImage } from "../Containers";
import RecentsList from "./playlistpane_components/RecentsList";


export default function PlaylistPane({recents, onHandleFetch, onIsPlaying}: PlaylistPaneProps) {

    const [isRecentsVisible, setIsRecentsVisible] = useState(false);

    return (
        <div className="PlaylistPane">
            <div className="PlaylistPaneController">
                <button className="PlaylistPaneControllerButton" onClick={() => setIsRecentsVisible(true)}>Recents</button>
                <button className="PlaylistPaneControllerButton">Favorites</button>
            </div>
            <RecentsList recents={recents} visible={isRecentsVisible} onHandleFetch={onHandleFetch} onIsPlaying={onIsPlaying} />
        </div>
    )
}
