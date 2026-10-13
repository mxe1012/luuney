import type { MainListProps } from "../../../utils/types";

import ListButton from "./ListButton";

export default function RecentsList({list, visible, onRecentsList, onAddToFavorites, onDeleteEntry, isFavorited, onHandleFetch, onIsPlaying}: MainListProps) {
    
    return (
        <>
            <ul className={visible ? "PlaylistPaneList" : "PlaylistPaneList hidden"}>
                {list.map((element) => (
                    <li className="PlaylistPaneList" key={element.track_id}>
                        <ListButton 
                            list={list}
                            track={element}
                            onHandleFetch={onHandleFetch}
                            onAddToFavorites={onAddToFavorites}
                            onListDeleteEntry={onRecentsList}
                            onDeleteEntry={onDeleteEntry}
                            onIsPlaying={onIsPlaying}
                            isFavorited={isFavorited}
                            hasDeleteButton={true}
                            hasFavoriteButton={true}
                        />
                    </li>
                ))}
            </ul>
        </>
    )
}
