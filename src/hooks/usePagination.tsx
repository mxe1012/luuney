import { useEffect, useState } from "react";

export default function usePagination<T>(items: T[], pageSize: number) {
    const [page, setPage] = useState(0);

    const pageCount = Math.max(1, Math.ceil(items.length / pageSize));
    
    const start = page * pageSize;
    const pageItems = items.slice(start, start + pageSize);

    useEffect(() => {
        if(pageItems.length === 0) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setPage(0);
        }
    }, [pageItems.length])

    return {
        page,
        pageCount,
        pageItems,
        hasPrev: page > 0,
        hasNext: page < pageCount - 1,
        start,
        next: () => setPage((p) => Math.min(p + 1, pageCount - 1)),
        prev: () => setPage((p) => Math.max(p - 1, 0)),
    };
}