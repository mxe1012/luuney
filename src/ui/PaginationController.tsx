import type { PaginationControllerProps } from "../utils/types";
import { MiniIcon } from "./Containers";


export default function PaginationController({className, page, pageCount, prev, hasPrev, next, hasNext, visible}: PaginationControllerProps) {

    if(!visible && !(visible == undefined)) {
        return
    }
    return (
        <>
            {(pageCount > 1) && (
                <div className={className}>
                    <div>
                        <button className="PlaylistPaneControllerButton" onClick={prev} disabled={!hasPrev}>
                            <MiniIcon src="/assets/chevron-left.svg" size={15}/>
                        </button>
                        {" "}
                        <span><b>{page + 1} / {pageCount}</b></span>
                        {" "}
                        <button className="PlaylistPaneControllerButton" onClick={next} disabled={!hasNext}>
                            <MiniIcon src="/assets/chevron-right.svg" size={15}/>
                        </button>
                    </div>
                </div>
            )}
        </>
    )
}