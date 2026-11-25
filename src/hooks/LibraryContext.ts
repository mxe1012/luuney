import { createContext, useContext } from "react";

import type { LibraryContextType } from "../utils/types";

export const LibraryContext = createContext<LibraryContextType | undefined>(undefined);

export function useLibrary() {
    const context = useContext(LibraryContext);
    if (!context) {
        throw new Error("useLibrary must be used within a LibraryContext provider");
    }
    return context;
}
