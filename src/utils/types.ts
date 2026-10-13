import type React from "react";

export interface ChildrenProps {
    children: React.ReactNode;
}

export interface AudioPlayerProps {
    track: TrackObject
    playlists: Playlist[];
    isPlaying: boolean;
    isFavorited: boolean;
    onHandleCreatePlaylist: (name: string, entry: TrackObject) => void;
    onHandleAddToPlaylist: (playlistId: string, entry: TrackObject) => void
    onAddToFavorites: (entry: TrackObject) => void;
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
    playlist: Playlist[];
    onRecentsList: React.Dispatch<React.SetStateAction<TrackObject[]>>;
    onFavoritesList: React.Dispatch<React.SetStateAction<TrackObject[]>>
    onSetPlaylist: React.Dispatch<React.SetStateAction<Playlist[]>>
    isFavorited: (entry: TrackObject) => boolean;
    onDeleteEntry: (list: TrackObject[], entry: TrackObject) => TrackObject[];
    onDeletePlaylist: (entry: Playlist) => Playlist[];
    onDeletePlaylistEntry: (playlistId: string, entry: TrackObject) => void
    onAddToFavorites: (entry: TrackObject) => void
    onHandleFetch: (id: number) => Promise<void>;
    // onHandleCreatePlaylist: (name: string, entry: TrackObject) => void;
    // onHandleAddToPlaylist: (playlistId: string, entry: TrackObject) => void
    onIsPlaying:  React.Dispatch<React.SetStateAction<boolean>>;
}

export interface PlaylistPaneControllerProps {
    isRecentsVisible: boolean;
    isFavoritesVisible: boolean;
    isPlaylistSelectionVisible: boolean;
    onSetIsRecentsVisible: React.Dispatch<React.SetStateAction<boolean>>;
    onSetIsFavoritesVisible: React.Dispatch<React.SetStateAction<boolean>>;
    onSetIsPlaylistSelectionVisible: React.Dispatch<React.SetStateAction<boolean>>;
    onSetIsSelectedPlaylist: React.Dispatch<React.SetStateAction<boolean>>;
}

export interface MainListProps {
    list: TrackObject[]
    visible: boolean;
    isFavorited?: (entry: TrackObject) => boolean;
    onRecentsList?: React.Dispatch<React.SetStateAction<TrackObject[]>>;
    onFavoritesList?: React.Dispatch<React.SetStateAction<TrackObject[]>>
    onDeleteEntry: (list: TrackObject[], entry: TrackObject) => TrackObject[];
    onAddToFavorites?: (entry: TrackObject) => void
    onHandleFetch: (id: number) => Promise<void>;
    onIsPlaying:  React.Dispatch<React.SetStateAction<boolean>>;
}

export interface PlaylistSelectionProps {
    list: Playlist[]
    visible: boolean;
    isSelectedPlaylist: boolean;
    onIsSelectedPlaylist:  React.Dispatch<React.SetStateAction<boolean>>;
    onSetIsPlaylistSelectionVisible: React.Dispatch<React.SetStateAction<boolean>>;
    onSetPlaylist: React.Dispatch<React.SetStateAction<Playlist[]>>
    isFavorited?: (entry: TrackObject) => boolean;
    onRecentsList?: React.Dispatch<React.SetStateAction<TrackObject[]>>;
    onFavoritesList?: React.Dispatch<React.SetStateAction<TrackObject[]>>
    onDeletePlaylist: (entry: Playlist) => Playlist[];
    onDeletePlaylistEntry: (playlistId: string, entry: TrackObject) => void
    onAddToFavorites?: (entry: TrackObject) => void
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

export interface Playlist {
    id: string;
    name: string;
    tracks: TrackObject[];
}

export interface ListButtonProps {
    list: TrackObject[];
    track: TrackObject;
    onHandleFetch: (id: number) => Promise<void>;
    onIsPlaying:  React.Dispatch<React.SetStateAction<boolean>>;
    onAddToFavorites?: (entry: TrackObject) => void
    isFavorited?: (entry: TrackObject) => boolean;
    onListDeleteEntry?: React.Dispatch<React.SetStateAction<TrackObject[]>>;
    onDeleteEntry: (list: TrackObject[], entry: TrackObject) => TrackObject[];
    hasDeleteButton: boolean;
    hasFavoriteButton: boolean;
}