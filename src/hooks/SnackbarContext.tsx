import { createContext, useState, useRef, useContext, useCallback } from "react";

import type { ChildrenProps, SnackbarContextType } from "../utils/types";

const SnackbarContext = createContext<SnackbarContextType | undefined>(undefined);

export default function SnackbarProvider({ children }: ChildrenProps) {
    const [notice, setNotice] = useState("");
    const [visible, setVisible] = useState(false);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const showSnackbar = useCallback((message: string, duration = 2000, isPersist = false) => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        setNotice(message);
        setVisible(true);

        if(!isPersist){
            timeoutRef.current = setTimeout(() => {
                setVisible(false);
            }, duration);
        }
    }, [])

    const hideSnackbar = useCallback(() => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        setVisible(false);
    }, [])

    return (
        <SnackbarContext.Provider value={{ showSnackbar, hideSnackbar }}>
            {children}
            <div id="snackbar" className={visible ? "show" : ""}>{notice}</div>
        </SnackbarContext.Provider>
    );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useSnackbar() {
    const context = useContext(SnackbarContext);
    if (!context) {
        throw new Error("useSnackbar must be used within a SnackbarProvider");
    }
    return context;
}
