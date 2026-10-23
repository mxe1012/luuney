import { useState } from "react";

export default function usePagination<T>(items: T[], pageSize: number) {
    const [page, setPage] = useState(0);

    const pageCount = Math.max(1, Math.ceil(items.length / pageSize));

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