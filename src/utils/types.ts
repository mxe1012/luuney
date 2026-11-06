import type React from "react";

import type { ChangeEvent } from "react";

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

export interface ArtistObject {
    user_id: number;
    profile_picture: string;
    name: string;
    handle: string;
    track_count: number;
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
    isSelectedPlaylist: boolean;
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
    onSetCurrentTrackIndex?:  React.Dispatch<React.SetStateAction<number>>;
    onSetTrackQueue?:  React.Dispatch<React.SetStateAction<TrackObject[]>>;
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
    states?: AudioPlayerButtonStateProps[]
    stateIndex?: number;
}

export interface AudioPlayerButtonStateProps {
    label: string;
    src: string;
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
    index: number;
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

export interface PaginationControllerProps {
    className?: string;
    page: number;
    pageCount: number;
    prev: () => void;
    hasPrev: boolean;
    next: () => void;
    hasNext: boolean;
    visible?: boolean;
}

export interface TrackSearchListProps {
    list: TrackObject[];
    onHandleFetch: (id: number) => Promise<void>;
    onAddToFavorites: (entry: TrackObject) => void;
    onAddToRecents: (entry: TrackObject) => void;
    onIsPlaying: React.Dispatch<React.SetStateAction<boolean>>;
    isFavorited: (entry: TrackObject) => boolean;
}

export interface ArtistSearchListProps {
    list: ArtistObject[]
    onHandleFetchTracksByUserId: (id: number) => Promise<void>;
    onSetArtistList: React.Dispatch<React.SetStateAction<ArtistObject[]>>;
}

export interface SearchController {
    searchType: string;
    searchTypes: string[];
    searchTrack: string;
    searchArtist: string;
    onHandleSearchTracks: (e: React.ChangeEvent<HTMLInputElement, Element>) => Promise<void>;
    onHandleSearchArtists: (e: React.ChangeEvent<HTMLInputElement, Element>) => Promise<void>;
    onHandleSearchType: (e: React.ChangeEvent<HTMLSelectElement, Element>) => void;
    onSetTrackList:  React.Dispatch<React.SetStateAction<TrackObject[]>>;
    onSetArtistList:  React.Dispatch<React.SetStateAction<ArtistObject[]>>;
}

export interface AudioPlayerUIProps {
    track: TrackObject;
    playlists: Playlist[];
    duration: number;
    currentTime: number;
    isPlaying: boolean;
    isFavorited: boolean;
    isShuffle: boolean;
    isScrolled: boolean;
    isMuted: boolean;
    volume: number;
    repeatMode: "off" | "one" | "all";
    REPEAT_MODES: readonly ["off", "one", "all"];
    progressTrack: number;
    progressVolume: number;
    onHandleSeek: (e: ChangeEvent<HTMLInputElement, Element>) => void;
    onHandleShuffle:  () => void
    onHandleRewind:  () => void
    onHandleTogglePlay: () => Promise<void>
    onHandleFastForward:  () => void
    onHandleToggleMute: () => void;
    onHandleVolumeChange: (e: ChangeEvent<HTMLInputElement, Element>) => void;
    onCycleRepeatMode: () => void;
    onAddToFavorites: (entry: TrackObject) => void;
    onHandleAddToPlaylist: (playlistId: string, entry: TrackObject) => void
    onHandleCreatePlaylist: (name: string, entry: TrackObject) => void
}

export interface VisualizerProps {
    audioRef: React.RefObject<HTMLAudioElement | null>;
    isPlaying: boolean;
}

export interface MiniIconProps {
    src: string;
    size?: number;
}
