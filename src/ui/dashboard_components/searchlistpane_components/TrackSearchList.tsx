import usePagination from "../../../hooks/usePagination";
import type { TrackSearchListProps } from "../../../utils/types";
import PaginationController from "../../PaginationController";
import ListButton from "../playlistpane_components/ListButton";

export default function TrackSearchList({list, onHandleFetch, onAddToFavorites, onAddToRecents, onIsPlaying, isFavorited, onSetCurrentTrackIndex, onSetTrackQueue}: TrackSearchListProps) {

    const { pageItems, page, pageCount, hasPrev, hasNext, next, prev, start } = usePagination(list, 10);

    return (
        <>
            <ul className="SearchList" style={{
                display: list.length === 0 ? "none" : "",
                visibility: list.length === 0 ? "hidden" : "visible"
            }}>
                {pageItems.map((element, index) => (
                    <li className="SearchList" key={element.track_id}>
                        <ListButton 
                            list={list}
                            track={element}
                            index={start + index}
                            onHandleFetch={onHandleFetch}
                            onAddToFavorites={onAddToFavorites}
                            onAddToRecents={onAddToRecents}
                            onIsPlaying={onIsPlaying}
                            isFavorited={isFavorited}
                            hasDeleteButton={false}
                            hasFavoriteButton={true}
                            onSetTrackQueue={onSetTrackQueue}
                            onSetCurrentTrackIndex={onSetCurrentTrackIndex}
                        />
                    </li>
                ))}
            </ul>
            <PaginationController 
                className="Pagination"
                page={page} 
                pageCount={pageCount} 
                prev={prev} 
                hasPrev={hasPrev} 
                next={next} 
                hasNext={hasNext}
            />
        </>
    )
}
