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

// The fields of an Audius API track that Luuney reads.
export interface ApiTrack {
    track_id: number;
    title: string;
    duration: number;
    artwork?: { "480x480"?: string } | null;
    user: { handle: string };
    stream: { url: string };
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
    isShuffle: boolean;
    shuffleTrackQueue: TrackObject[];
    onSetCurrentTrackIndex:  React.Dispatch<React.SetStateAction<number>>;
    onSetIsShuffle: React.Dispatch<React.SetStateAction<boolean>>;
    onSetShuffleTrackQueue: React.Dispatch<React.SetStateAction<TrackObject[]>>;
    onSetTrackQueue: React.Dispatch<React.SetStateAction<TrackObject[]>>;
    onHandleFetch: (id: number) => Promise<void>;
    onHandleCreatePlaylist: (name: string, entry: TrackObject) => void;
    onHandleAddToPlaylist: (playlistId: string, entry: TrackObject) => void
    onAddToFavorites: (entry: TrackObject) => void;
    onIsPlaying:  React.Dispatch<React.SetStateAction<boolean>>;
    onRemoveFromQueue: (entry: TrackObject) => void;
}

export interface SearchListPaneProps {
    playlists: Playlist[];
    onHandleFetch: (id: number) => Promise<void>;
    onHandlePlayNext: (entry: TrackObject) => void;
    isFavorited: (entry: TrackObject) => boolean;
    onAddToFavorites: (entry: TrackObject) => void
    onIsPlaying:  React.Dispatch<React.SetStateAction<boolean>>;
    onSetTrackQueue?: (list: TrackObject[]) => void;
    onSetCurrentTrackIndex?:  React.Dispatch<React.SetStateAction<number>>;
    onHandleAddToPlaylist: (playlistId: string, entry: TrackObject) => void;
    onHandleCreatePlaylist: (name: string, entry?: TrackObject) => void;
}

export interface PlaylistPaneProps {
    recents: TrackObject[];
    favorites: TrackObject[];
    playlist: Playlist[];
    onRecentsList: React.Dispatch<React.SetStateAction<TrackObject[]>>;
    onFavoritesList: React.Dispatch<React.SetStateAction<TrackObject[]>>
    onSetPlaylist: React.Dispatch<React.SetStateAction<Playlist[]>>
    onHandleRenamePlaylist: (playlistId: string, newName: string) => void;
    isFavorited: (entry: TrackObject) => boolean;
    onDeleteEntry: (list: TrackObject[], entry: TrackObject) => (prev: TrackObject[]) => TrackObject[];
    onClearQueue: (source: string) => void;
    onHandleCreatePlaylist: (name: string, entry?: TrackObject) => void;
    onDeletePlaylist: (entry: Playlist) => (prev: Playlist[]) => Playlist[];
    onDeletePlaylistEntry: (playlistId: string, entry: TrackObject) => void
    onAddToFavorites: (entry: TrackObject) => void
    onHandleFetch: (id: number) => Promise<void>;
    onSetCurrentTrackIndex:  React.Dispatch<React.SetStateAction<number>>;
    onIsPlaying:  React.Dispatch<React.SetStateAction<boolean>>;
    onSetTrackQueue: (list: TrackObject[]) => void;
    onHandleAddToPlaylist: (playlistId: string, entry: TrackObject) => void;
    onHandlePlayNext: (entry: TrackObject) => void;
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
    onDeleteEntry: (list: TrackObject[], entry: TrackObject) => (prev: TrackObject[]) => TrackObject[];
    onClearQueue?: (source: string) => void;
    onAddToFavorites?: (entry: TrackObject) => void
    onHandleFetch: (id: number) => Promise<void>;
    onIsPlaying:  React.Dispatch<React.SetStateAction<boolean>>;
    onSetCurrentTrackIndex?:  React.Dispatch<React.SetStateAction<number>>;
    onSetTrackQueue?: (list: TrackObject[]) => void;
    playlists: Playlist[];
    onHandleAddToPlaylist: (playlistId: string, entry: TrackObject) => void;
    onHandleCreatePlaylist: (name: string, entry?: TrackObject) => void;
    onHandlePlayNext: (entry: TrackObject) => void;
}

export interface PlaylistSelectionProps {
    list: Playlist[]
    visible: boolean;
    isSelectedPlaylist: boolean;
    onIsSelectedPlaylist:  React.Dispatch<React.SetStateAction<boolean>>;
    onSetIsPlaylistSelectionVisible: React.Dispatch<React.SetStateAction<boolean>>;
    onSetPlaylist: React.Dispatch<React.SetStateAction<Playlist[]>>
    onHandleRenamePlaylist: (playlistId: string, newName: string) => void;
    isFavorited?: (entry: TrackObject) => boolean;
    onRecentsList?: React.Dispatch<React.SetStateAction<TrackObject[]>>;
    onFavoritesList?: React.Dispatch<React.SetStateAction<TrackObject[]>>
    onHandleCreatePlaylist: (name: string, entry?: TrackObject) => void;
    onDeletePlaylist: (entry: Playlist) => (prev: Playlist[]) => Playlist[];
    onDeletePlaylistEntry: (playlistId: string, entry: TrackObject) => void
    onClearQueue?: (source: string) => void;
    onAddToFavorites?: (entry: TrackObject) => void
    onHandleFetch: (id: number) => Promise<void>;
    onIsPlaying:  React.Dispatch<React.SetStateAction<boolean>>;
    onSetCurrentTrackIndex?:  React.Dispatch<React.SetStateAction<number>>;
    onSetTrackQueue?: (list: TrackObject[]) => void;
    onHandleAddToPlaylist: (playlistId: string, entry: TrackObject) => void;
    onHandlePlayNext: (entry: TrackObject) => void;
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
    placeholderSrc?: string;
}

export interface SnackbarContextType {
    showSnackbar: (message: string, duration?: number, isPersist?: boolean) => void;
    hideSnackbar: () => void;
}

// the library actions that the lists, their items and the player's playlist menu all need, provided by Dashboard
export interface LibraryContextType {
    playlists: Playlist[];
    isFavorited: (entry: TrackObject) => boolean;
    onAddToFavorites: (entry: TrackObject) => void;
    onHandleAddToPlaylist: (playlistId: string, entry: TrackObject) => void;
    onHandleCreatePlaylist: (name: string, entry?: TrackObject) => void;
    onHandlePlayNext: (entry: TrackObject) => void;
    onHandleFetch: (id: number) => Promise<void>;
    onIsPlaying: React.Dispatch<React.SetStateAction<boolean>>;
    onSetTrackQueue: (list: TrackObject[]) => void;
    onSetCurrentTrackIndex: React.Dispatch<React.SetStateAction<number>>;
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
    onAddToFavorites?: (entry: TrackObject) => void
    isFavorited?: (entry: TrackObject) => boolean;
    onListDeleteEntry?: React.Dispatch<React.SetStateAction<TrackObject[]>>;
    onDeleteEntry?: (list: TrackObject[], entry: TrackObject) => (prev: TrackObject[]) => TrackObject[];
    onDeletePlaylistEntry?: (playlistId: string, entry: TrackObject) => void
    playlists: Playlist[];
    onHandlePlayNext: (entry: TrackObject) => void;
    onHandleAddToPlaylist: (playlistId: string, entry: TrackObject) => void;
    onHandleCreatePlaylist: (name: string, entry?: TrackObject) => void;
    onSetTrackQueue?: (list: TrackObject[]) => void;
    onSetCurrentTrackIndex?:  React.Dispatch<React.SetStateAction<number>>;
    hasDeleteButton: boolean;
    hasFavoriteButton: boolean;
}

export interface ExtraListPaneProps {
    list: TrackObject[];
    heading: string;
    isLoaded: boolean;
    onHandleFetch: (id: number) => Promise<void>;
    onIsPlaying:  React.Dispatch<React.SetStateAction<boolean>>;
    onSetTrackQueue: (list: TrackObject[]) => void;
    onSetCurrentTrackIndex:  React.Dispatch<React.SetStateAction<number>>;
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
    playlists: Playlist[];
    onHandleFetch: (id: number) => Promise<void>;
    onHandlePlayNext: (entry: TrackObject) => void;
    onAddToFavorites: (entry: TrackObject) => void;
    onIsPlaying: React.Dispatch<React.SetStateAction<boolean>>;
    isFavorited: (entry: TrackObject) => boolean;
    onSetTrackQueue?: (list: TrackObject[]) => void;
    onSetCurrentTrackIndex?:  React.Dispatch<React.SetStateAction<number>>;
    onHandleAddToPlaylist: (playlistId: string, entry: TrackObject) => void;
    onHandleCreatePlaylist: (name: string, entry?: TrackObject) => void;
}

export interface ArtistSearchListProps {
    list: ArtistObject[]
    onHandleFetchTracksByUserId: (id: number) => Promise<void>;
    onSetArtistList: React.Dispatch<React.SetStateAction<ArtistObject[]>>;
}

export interface SearchControllerProps {
    searchType: string;
    searchTypes: string[];
    searchTrack: string;
    searchArtist: string;
    onHandleSearchTracks: (e: React.ChangeEvent<HTMLInputElement, Element>) => Promise<void>;
    onHandleSearchArtists: (e: React.ChangeEvent<HTMLInputElement, Element>) => Promise<void>;
    onHandleSearchType: (e: React.ChangeEvent<HTMLSelectElement, Element>) => void;
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
    onHandleSkipNext: () => void;
    onHandleSkipPrev: () => void;
    onHandleTogglePlay: () => Promise<void>
    onHandleFastForward:  () => void
    onHandleToggleMute: () => void;
    onHandleVolumeChange: (e: ChangeEvent<HTMLInputElement, Element>) => void;
    onCycleRepeatMode: () => void;
    onAddToFavorites: (entry: TrackObject) => void;
    onHandleAddToPlaylist: (playlistId: string, entry: TrackObject) => void
    onHandleCreatePlaylist: (name: string, entry: TrackObject) => void
    onHandleUpNextVisibility: () => void;
}

export interface VisualizerProps {
    audioRef: React.RefObject<HTMLAudioElement | null>;
    isPlaying: boolean;
}

export interface MiniIconProps {
    src: string;
    alt?: string;
    size?: number;
}

export interface UpNextListProps {
    queue: TrackObject[]
    isUpNextVisible: boolean;
    onRemoveFromQueue: (entry: TrackObject) => void;
}

export interface PillTitleProps {
    heading: string;
    actionIcon: string;
    actionLabel: string;
    initialValue: string;
    onSubmit: (name: string) => void;
}

export interface MediaSessionHandlers {
    onTogglePlay: () => void | Promise<void>;
    onSkipNext: () => void;
    onSkipPrev: () => void;
    onRewind: () => void;
    onFastForward: () => void;
    onSeekTo: (time: number) => void;
}

export interface PlayerShortcutHandlers {
    onTogglePlay: () => void | Promise<void>;
    onToggleMute: () => void;
    onChangeVolume: (delta: number) => void;
    onRewind: () => void;
    onFastForward: () => void;
}

export interface AddToPlaylistProps {
    track: TrackObject;
    playlists: Playlist[];
    onHandleAddToPlaylist: (playlistId: string, entry: TrackObject) => void;
    onHandleCreatePlaylist: (name: string, entry: TrackObject) => void;
}
