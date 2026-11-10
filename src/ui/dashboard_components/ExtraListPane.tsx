import usePagination from "../../hooks/usePagination";
import { formatTime } from "../../utils/helpers";
import type { ExtraListPaneProps } from "../../utils/types";
import CoverImage from "../CoverImage";
import PaginationController from "../PaginationController";
import SkeletonExtraListPane from "../skeletons/SkeletonExtraListPane";

export default function ExtraListPane({list, heading, isLoaded, onHandleFetch, onAddToRecents, onIsPlaying, onSetTrackQueue, onSetCurrentTrackIndex}: ExtraListPaneProps) {

    const { pageItems, page, pageCount, hasPrev, hasNext, start, next, prev } = usePagination(list, 10);

    return (
        <>  
            <SkeletonExtraListPane isLoaded={isLoaded}>
                <div className="RowCenter">
                    <div className="ExtraListPane">
                        <div className="RowBetween">
                            <div>
                                <h1 style={{color: '#F3D9C7'}}>{heading}</h1>
                            </div>
                            <div>
                                <PaginationController
                                    className="PaginationExtraList" 
                                    page={page} 
                                    pageCount={pageCount} 
                                    prev={prev} 
                                    hasPrev={hasPrev} 
                                    next={next} 
                                    hasNext={hasNext} 
                                />
                            </div>
                        </div>
                        <ul className="ExtraListItems">
                            {pageItems.map((element, index) => (
                                <li className="ExtraListItems" key={element.track_id}>
                                    <button className="ExtraListPaneButton" 
                                        onClick={() => {
                                            onHandleFetch(element.track_id)
                                            onAddToRecents(element)
                                            onIsPlaying(false)
                                            onSetCurrentTrackIndex(start + index)
                                            onSetTrackQueue([...list]);
                                        }}>
                                        <div className="ExtraItem">
                                            <div className="RowCenter ListCover"> 
                                                <CoverImage styles={{borderRadius: '10px'}} src={element.artwork} size={128}/>
                                            </div>
                                            <div className="ListText">
                                                <h4>{element.title}</h4>
                                                <div className="RowBetween">
                                                    <h5>{element.handle}</h5>
                                                    <h6 className="NoMargin">
                                                        <time>{formatTime(element.duration)}</time>
                                                    </h6>
                                                </div>
                                            </div>
                                        </div>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </SkeletonExtraListPane>
        </>
    )
}
