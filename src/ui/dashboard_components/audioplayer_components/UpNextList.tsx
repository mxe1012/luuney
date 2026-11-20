import type { UpNextListProps } from "../../../utils/types";

import { formatTime } from "../../../utils/helpers";
import usePagination from "../../../hooks/usePagination";
import PaginationController from "../../PaginationController";
import CoverImage from "../../CoverImage";

export default function UpNextList({queue, isUpNextVisible}: UpNextListProps) {

    const { pageItems, page, pageCount, hasPrev, hasNext, next, prev } = usePagination(queue, 5);

    return (
        <>
            <div className={isUpNextVisible ? "GlassCard NoBg UpNextList" : "GlassCard NoBg UpNextList hidden"}>
                <h3>Queue</h3>
                {queue.length === 0 ? (
                    <p className="UpNextEmpty">Nothing in the queue.</p>
                    ) : (
                    <>
                        <ul className="UpNextItems">
                            {pageItems.map((element) => (
                                <li className="UpNextItem" key={element.track_id}>
                                    <div className="ListItem">
                                        <CoverImage styles={{borderRadius: "8px"}} size={36} src={element.artwork}/>
                                    <div className="ColumnCenter ListText">
                                        <h4 className="UpNextTitle NoMargin">{element.title}</h4>
                                        <h5 className="UpNextArtist MutedLavenderColor NoMargin">{element.handle}</h5>
                                    </div>
                                        <time className="UpNextDuration">{formatTime(element.duration)}</time>
                                    </div>
                                </li>
                            ))}
                        </ul>
                        <div className="RowCenter">
                        <div>
                            <PaginationController 
                                className="Pagination"
                                page={page} 
                                pageCount={pageCount} 
                                prev={prev} 
                                hasPrev={hasPrev} 
                                next={next} 
                                hasNext={hasNext} 
                            />
                        </div>
                    </div>
                </>
                )}
            </div>
        </>
    )
}
