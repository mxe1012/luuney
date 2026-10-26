import type { PaginationControllerProps } from "../utils/types";


export default function PaginationController({className, page, pageCount, prev, hasPrev, next, hasNext, visible}: PaginationControllerProps) {

    if(!visible && !(visible == undefined)) {
        return
    }
    return (
        <>
            {(pageCount > 1) && (
                <div className={className}>
                    <button className="PlaylistPaneControllerButton" onClick={prev} disabled={!hasPrev}>Prev</button>
                    <span>{page + 1} / {pageCount}</span>
                    <button className="PlaylistPaneControllerButton" onClick={next} disabled={!hasNext}>Next</button>
                </div>
            )}
        </>
    )
}