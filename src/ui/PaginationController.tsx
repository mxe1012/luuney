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
                        <button className="PaginationButton" onClick={prev} disabled={!hasPrev}>
                            <MiniIcon src="/assets/chevron-left.svg" size={15} alt="prev"/>
                        </button>
                        {" "}
                        <span><b>{page + 1} / {pageCount}</b></span>
                        {" "}
                        <button className="PaginationButton" onClick={next} disabled={!hasNext}>
                            <MiniIcon src="/assets/chevron-right.svg" size={15} alt="next"/>
                        </button>
                    </div>
                </div>
            )}
        </>
    )
}