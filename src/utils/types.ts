import type React from "react";

export interface ChildrenProps {
    children: React.ReactNode;
}

export interface TrackObject {
    track_id: number;
    artwork: string;
    title: string;
    handle: string;
    url: string;
    duration: number;
}

export interface AudioPlayerProps {
    track: TrackObject
    tracks: TrackObject[];
    currentTrackIndex: number;
    playlists: Playlist[];
    isPlaying: boolean;
    isFavorited: boolean;
    onSetCurrentTrackIndex:  React.Dispatch<React.SetStateAction<number>>;
    onHandleFetch: (id: number) => Promise<void>;
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
    onSetCurrentTrackIndex:  React.Dispatch<React.SetStateAction<number>>;
    onIsPlaying:  React.Dispatch<React.SetStateAction<boolean>>;
    onSetTrackQueue:  React.Dispatch<React.SetStateAction<TrackObject[]>>;
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
    onSetCurrentTrackIndex?:  React.Dispatch<React.SetStateAction<number>>;
    onSetTrackQueue?:  React.Dispatch<React.SetStateAction<TrackObject[]>>;
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
    playlist?: Playlist;
    onHandleFetch: (id: number) => Promise<void>;
    onIsPlaying:  React.Dispatch<React.SetStateAction<boolean>>;
    onAddToRecents?: (entry: TrackObject) => void;
    onAddToFavorites?: (entry: TrackObject) => void
    isFavorited?: (entry: TrackObject) => boolean;
    onListDeleteEntry?: React.Dispatch<React.SetStateAction<TrackObject[]>>;
    onDeleteEntry?: (list: TrackObject[], entry: TrackObject) => TrackObject[];
    onDeletePlaylistEntry?: (playlistId: string, entry: TrackObject) => void
    onSetTrackQueue?:  React.Dispatch<React.SetStateAction<TrackObject[]>>;
    onSetCurrentTrackIndex?:  React.Dispatch<React.SetStateAction<number>>;
    hasDeleteButton: boolean;
    hasFavoriteButton: boolean;
}

export interface ExtraListPaneProps {
    list: TrackObject[];
    heading: string;
    onHandleFetch: (id: number) => Promise<void>;
    onAddToRecents: (entry: TrackObject) => void;
    onIsPlaying:  React.Dispatch<React.SetStateAction<boolean>>;
    isLoaded: boolean;
}

export interface SkeletonProps {
    children: React.ReactNode;
    isLoaded: boolean;
}
