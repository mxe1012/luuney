import usePagination from "../../../hooks/usePagination";
import type { MainListProps } from "../../../utils/types";

import PaginationController from "../../PaginationController";

import ListButton from "./ListButton";

export default function FavoritesList({list, visible, onFavoritesList, onDeleteEntry, onHandleFetch, onIsPlaying, onSetTrackQueue, onSetCurrentTrackIndex}: MainListProps) {
    
    const { pageItems, page, pageCount, hasPrev, hasNext, next, prev } =
        usePagination(list, 10);

    return (
        <>
            <ul className={visible ? "PlaylistPaneList" : "PlaylistPaneList hidden"}>
                {pageItems.map((element, index) => (
                    <li className="PlaylistPaneList" key={element.track_id}>
                        <ListButton 
                            list={list}
                            track={element}
                            index={index}
                            onHandleFetch={onHandleFetch}
                            onListDeleteEntry={onFavoritesList}
                            onDeleteEntry={onDeleteEntry}
                            onIsPlaying={onIsPlaying}
                            hasDeleteButton={true}
                            hasFavoriteButton={false}
                            onSetTrackQueue={onSetTrackQueue}
                            onSetCurrentTrackIndex={onSetCurrentTrackIndex}
                        />        
                    </li>
                ))}
            </ul>
            <PaginationController 
                page={page} 
                pageCount={pageCount} 
                prev={prev} 
                hasPrev={hasPrev} 
                next={next} 
                hasNext={hasNext} 
                visible={visible}
            />
        </>
    )
}
