import usePagination from "../../../hooks/usePagination";
import type { ArtistSearchListProps } from "../../../utils/types";
import CoverImage from "../../CoverImage";
import PaginationController from "../../PaginationController";

export default function ArtistSearchList({list, onHandleFetchTracksByUserId, onSetArtistList}: ArtistSearchListProps) {

    const { pageItems, page, pageCount, hasPrev, hasNext, next, prev } = usePagination(list, 10);

    return (
        <>
            <ul className="SearchList" style={{
                display: list.length === 0 ? "none" : "",
            }}>
                {pageItems.map((element) => (
                    <li className="SearchList" key={element.user_id}>
                        <button className="PlaylistButton" 
                            onClick={() => {
                            onHandleFetchTracksByUserId(element.user_id);
                            onSetArtistList([]);
                        }}>
                            <div className="ListItem">
                                <div className="ListCover">
                                    <CoverImage styles={{borderRadius: '10px'}} src={element.profile_picture} size={64}/>
                                </div>
                                <div className="ListText">
                                    <h4>{element.name}</h4>
                                    <h5>{element.handle}</h5>
                                </div>
                                <div className="ListMeta">
                                    <h6>
                                        {element.track_count + " "} 
                                        {element.track_count === 1 ? "track" : "tracks"}
                                    </h6>
                                </div>
                            </div>
                        </button>
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