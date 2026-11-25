import { vi } from "vitest";
import type { ChildrenProps, LibraryContextType } from "../utils/types";
import { LibraryContext } from "../hooks/LibraryContext";
import SnackbarProvider from "../hooks/SnackbarContext";

// Default library values for components that read from LibraryContext.
export function makeLibrary(overrides: Partial<LibraryContextType> = {}): LibraryContextType {
    return {
        playlists: [],
        isFavorited: () => false,
        onAddToFavorites: vi.fn(),
        onHandleAddToPlaylist: vi.fn(),
        onHandleCreatePlaylist: vi.fn(),
        onHandlePlayNext: vi.fn(),
        onHandleFetch: vi.fn().mockResolvedValue(undefined),
        onIsPlaying: vi.fn(),
        onSetTrackQueue: vi.fn(),
        onSetCurrentTrackIndex: vi.fn(),
        ...overrides,
    };
}

// Splits a test's overrides into the library's values and the component's own props,
// so a setup() can keep taking both in one object.
export function splitLibrary<P>(overrides: Partial<P & LibraryContextType>) {
    const keys = Object.keys(makeLibrary());
    const library: Partial<LibraryContextType> = {};
    const props: Partial<P> = {};

    for (const [key, value] of Object.entries(overrides)) {
        if (keys.includes(key)) Object.assign(library, { [key]: value });
        else Object.assign(props, { [key]: value });
    }

    return { library: makeLibrary(library), props };
}

// Wraps a component in the snackbar and the given library, the way Dashboard does.
export function withLibrary(library: LibraryContextType) {
    return function LibraryWrapper({ children }: ChildrenProps) {
        return (
            <SnackbarProvider>
                <LibraryContext value={library}>{children}</LibraryContext>
            </SnackbarProvider>
        );
    };
}
