import type { PaginationControllerProps } from "../utils/types";


export default function PaginationController({page, pageCount, prev, hasPrev, next, hasNext, visible}: PaginationControllerProps) {

    if(!visible && !(visible == undefined)) {
        return
    }
    return (
        <>
            {(pageCount > 1) && (
                <div className="Pagination">
                    <button className="PlaylistPaneControllerButton" onClick={prev} disabled={!hasPrev}>Prev</button>
                    <span>{page + 1} / {pageCount}</span>
                    <button className="PlaylistPaneControllerButton" onClick={next} disabled={!hasNext}>Next</button>
                </div>
            )}
        </>
    )
}