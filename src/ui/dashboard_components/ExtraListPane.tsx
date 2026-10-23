import usePagination from "../../hooks/usePagination";
import type { ExtraListPaneProps } from "../../utils/types";
import CoverImage from "../CoverImage";
import SkeletonExtraListPane from "../skeletons/SkeletonExtraListPane";

export default function ExtraListPane({list, heading, onHandleFetch, onAddToRecents, onIsPlaying, isLoaded}: ExtraListPaneProps) {

    const { pageItems, page, pageCount, hasPrev, hasNext, next, prev } =
            usePagination(list, 10);

    return (
        <>  
            <SkeletonExtraListPane isLoaded={isLoaded}>
                <div style={{display: "flex", justifyContent: "center"}}>
                    <div className="ExtraListPane">
                        <h1 style={{color: '#F3D9C7'}}>{heading}</h1>
                        {pageCount > 1 && (
                            <div className="Pagination">
                                <button className="PlaylistPaneControllerButton" onClick={prev} disabled={!hasPrev}>Prev</button>
                                <span>{page + 1} / {pageCount}</span>
                                <button className="PlaylistPaneControllerButton" onClick={next} disabled={!hasNext}>Next</button>
                            </div>
                        )}
                        <ul className="ExtraListItems">
                            {pageItems.map((element) => (
                                <li className="ExtraListItems" key={element.track_id}>
                                    <button className="ExtraListPaneButton" 
                                        onClick={() => {
                                            onHandleFetch(element.track_id)
                                            onAddToRecents(element)
                                            onIsPlaying(false)
                                        }}
                                    >
                                        <div style={{display: "grid", alignItems: "flex-start", gap: '12px'}}>
                                            <div style={{display: "flex", justifyContent: "center", flexShrink: 0}}> 
                                                <CoverImage styles={{borderRadius: '10px'}} src={element.artwork} size={128}/>
                                            </div>
                                            <div style={{textAlign: 'left', minWidth: 0, flex: 1}}>
                                                <h4>{element.title}</h4>
                                                <h5>{element.handle}</h5>
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
