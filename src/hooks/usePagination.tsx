import { useEffect, useState } from "react";

export default function usePagination<T>(items: T[], pageSize: number) {
    const [page, setPage] = useState(0);

    const pageCount = Math.max(1, Math.ceil(items.length / pageSize));

    // Reset to the first page when the list changes (e.g. a new search)
    useEffect(() => {
        setPage(0);
    }, [items]);

    const start = page * pageSize;
    const pageItems = items.slice(start, start + pageSize);

    return {
        page,
        pageCount,
        pageItems,
        hasPrev: page > 0,
        hasNext: page < pageCount - 1,
        next: () => setPage((p) => Math.min(p + 1, pageCount - 1)),
        prev: () => setPage((p) => Math.max(p - 1, 0)),
    };
}