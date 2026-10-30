import { useSnackbar } from "../../../hooks/SnackbarContext";
import usePagination from "../../../hooks/usePagination";
import type { MainListProps } from "../../../utils/types";

import PaginationController from "../../PaginationController";

import ListButton from "./ListButton";

export default function FavoritesList({list, visible, onFavoritesList, onDeleteEntry, onHandleFetch, onIsPlaying, onSetTrackQueue, onSetCurrentTrackIndex}: MainListProps) {
    
    const { pageItems, page, pageCount, hasPrev, hasNext, next, prev, start} = usePagination(list, 10);

    const { showSnackbar } = useSnackbar();

    return (
        <>
            <ul className={visible ? "PlaylistPaneList" : "PlaylistPaneList hidden"}>
                {pageItems.map((element, index) => (
                    <li className="PlaylistPaneList" key={element.track_id}>
                        <ListButton 
                            list={list}
                            track={element}
                            index={start + index}
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
            <div style={{display: 'flex', justifyContent: "space-between"}}>
                <div>
                    <PaginationController 
                        className="Pagination"
                        page={page} 
                        pageCount={pageCount} 
                        prev={prev} 
                        hasPrev={hasPrev} 
                        next={next} 
                        hasNext={hasNext} 
                        visible={visible}
                    />
                </div>
                <div>
                    <button 
                    style={{
                        display: (visible && list.length >= 1) ? "" : "none", 
                        visibility: (visible && list.length >= 1) ? "visible" : "hidden"
                    }}
                    className="PlaylistPaneControllerButton" 
                    onClick={() => {showSnackbar("Favorites cleared!"); onFavoritesList?.([])}}>
                        Clear
                    </button>
                </div>
            </div>
        </>
    )
}
