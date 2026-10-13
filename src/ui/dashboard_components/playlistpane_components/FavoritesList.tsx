import type { MainListProps } from "../../../utils/types";

import ListButton from "./ListButton";

export default function FavoritesList({list, visible, onFavoritesList, onDeleteEntry, onHandleFetch, onIsPlaying}: MainListProps) {
    
    return (
        <>
            <ul className={visible ? "PlaylistPaneList" : "PlaylistPaneList hidden"}>
                {list.map((element) => (
                    <li className="PlaylistPaneList" key={element.track_id}>
                        <ListButton 
                            list={list}
                            track={element}
                            onHandleFetch={onHandleFetch}
                            onListDeleteEntry={onFavoritesList}
                            onDeleteEntry={onDeleteEntry}
                            onIsPlaying={onIsPlaying}
                            hasDeleteButton={true}
                            hasFavoriteButton={false}
                        />        
                    </li>
                ))}
            </ul>
        </>
    )
}
