import { useState, useEffect } from "react";

import type { Dispatch, SetStateAction } from "react";

function readStored<T>(key: string, fallback: T): T {
    
    const item = localStorage.getItem(key);

    if(!item) {
        return fallback
    }

    try {
        return JSON.parse(item);
    }
    catch(e) {
        console.error(e);
        return fallback
    }
}

export function useLocalStorage<T>(key: string, fallback: T): [T, Dispatch<SetStateAction<T>>] {
    
    const [value, setValue] = useState<T>(() => {
        return readStored(key, fallback)
    })

    useEffect(() => {
        try {
            localStorage.setItem(key, JSON.stringify(value))
        }
        catch(e) {
            console.error(e);
        }
        
    }, [key, value])

    return [value, setValue];

}
