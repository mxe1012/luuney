import type React from "react";

export interface ChildrenProps {
    children: React.ReactNode;
}

export interface AudioPlayerProps {
    track: TrackObject
    isPlaying: boolean;
    isFavorited: boolean;
    onAddToFavorites: (entry: TrackObject) => void
    onIsPlaying:  React.Dispatch<React.SetStateAction<boolean>>;
}

export interface SearchListPaneProps {
    onHandleFetch: (id: number) => Promise<void>;
    isFavorited: (entry: TrackObject) => boolean;
    onAddToFavorites: (entry: TrackObject) => void
    onAddToRecents: (entry: TrackObject) => void;
    onIsPlaying:  React.Dispatch<React.SetStateAction<boolean>>;
}

export interface PlaylistPaneProps {
    recents: TrackObject[];
    favorites: TrackObject[];
    onHandleFetch: (id: number) => Promise<void>;
    onIsPlaying:  React.Dispatch<React.SetStateAction<boolean>>;
}

export interface MainListProps {
    list: TrackObject[]
    visible: boolean;
    onHandleFetch: (id: number) => Promise<void>;
    onIsPlaying:  React.Dispatch<React.SetStateAction<boolean>>;
}

export interface TrackObject {
    track_id: number;
    artwork: string;
    title: string;
    handle: string;
    url: string;
}

export interface AudioPlayerButtonProps {
    onClick: React.MouseEventHandler<HTMLButtonElement>;
    size: number;
    toggleAction?: boolean;
    label?: string;
    labelTrue?: string;
    labelFalse?: string;
    src?: string
    srcTrue?: string;
    srcFalse?: string;
}

export interface CoverImageProps {
    styles?: React.CSSProperties
    src?: string;
    size: number;
}

export interface SnackbarContextType {
    showSnackbar: (message: string, duration?: number) => void;
}
