import { useEffect, useRef, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";

import type { ListButtonProps } from "../../../utils/types";

import { formatTime } from "../../../utils/helpers";

import CoverImage from "../../CoverImage";
import AddToPlaylist from "../../AddToPlaylist";

// roughly the menu's height; below this much room under the button, the menu opens upward instead
const MENU_SPACE = 280;
const MENU_GAP = 10;

export default function ListButton({list, track, playlist, index, playlists, onHandleFetch, onIsPlaying, onAddToFavorites, isFavorited, onListDeleteEntry, onDeleteEntry, onDeletePlaylistEntry, onHandleAddToPlaylist, onHandleCreatePlaylist, hasDeleteButton, hasFavoriteButton, onSetTrackQueue, onSetCurrentTrackIndex, onHandlePlayNext}: ListButtonProps) {

    const [isActionMenuVisible, setIsActionMenuVisible] = useState(false);
    const [menuPosition, setMenuPosition] = useState<CSSProperties>({});

    const actionButtonRef = useRef<HTMLButtonElement>(null);
    const actionMenuRef = useRef<HTMLDivElement>(null);

    // the menu is placed next to its button when it opens, so it closes rather than drifting away when the list scrolls
    useEffect(() => {
        if (!isActionMenuVisible) return;

        const handleMouseDown = (e: MouseEvent) => {
            const target = e.target as Node;
            if (!actionMenuRef.current?.contains(target) && !actionButtonRef.current?.contains(target)) setIsActionMenuVisible(false);
        };
        // scrolling the menu's own playlist list keeps it open
        const handleScroll = (e: Event) => {
            if (!actionMenuRef.current?.contains(e.target as Node)) setIsActionMenuVisible(false);
        };
        const handleResize = () => setIsActionMenuVisible(false);

        document.addEventListener("mousedown", handleMouseDown);
        window.addEventListener("scroll", handleScroll, true);
        window.addEventListener("resize", handleResize);
        return () => {
            document.removeEventListener("mousedown", handleMouseDown);
            window.removeEventListener("scroll", handleScroll, true);
            window.removeEventListener("resize", handleResize);
        };
    }, [isActionMenuVisible]);

    function handleToggleActionMenu() {
        const button = actionButtonRef.current;
        if (!button) return;

        // lines the menu's right edge up with the button, opening upward when there is not enough room below;
        // the page's own width and height leave out its scrollbars, unlike the window's
        const rect = button.getBoundingClientRect();
        const { clientWidth, clientHeight } = document.documentElement;
        const right = clientWidth - rect.right;
        const hasRoomBelow = clientHeight - rect.bottom >= MENU_SPACE;

        setMenuPosition(hasRoomBelow
            ? { top: rect.bottom + MENU_GAP, right }
            : { bottom: clientHeight - rect.top + MENU_GAP, right });
        setIsActionMenuVisible(!isActionMenuVisible);
    }

    function handlePlayNext() {
        onHandlePlayNext(track);
        setIsActionMenuVisible(false);
    }

    function handleRemove() {
        if (onDeleteEntry) {
            onListDeleteEntry?.(onDeleteEntry(list, track));
        }
        if (playlist?.id) {
            onDeletePlaylistEntry?.(playlist.id, track)
        }
        setIsActionMenuVisible(false);
    }

    return (
        <>
            <div className="ListRow">
                <div className="ListMain">
                    <button className="PlaylistButton" onClick={() => {
                        onHandleFetch(track.track_id);
                        onIsPlaying(false);
                        onSetCurrentTrackIndex?.(index);
                        onSetTrackQueue?.(list)
                        }}>
                            <div className="ListItem">
                                <div className="ListCover">
                                    <CoverImage styles={{borderRadius: '10px'}} src={track.artwork} size={64}/>
                                </div>
                                <div className="ListText">
                                    <h4>{track.title}</h4>
                                    <h5>{track.handle}</h5>
                                </div>
                                <div className="ListMeta">
                                    <h6><time>{formatTime(track.duration)}</time></h6>
                                </div>
                            </div>
                    </button>
                </div>
                    <div className="ListActions">
                        {hasFavoriteButton && 
                            <button className="ListActionBtn" aria-label={isFavorited?.(track) ? "Remove from Favorites" : "Add to Favorites"} 
                                onClick={() => {
                                    onAddToFavorites?.(track)
                                }}
                                >
                                <img src={isFavorited?.(track) ? "/assets/favorite_icons/favorited.svg" : "/assets/favorite_icons/not_favorited.svg"} alt="Favorite"/>
                            </button>
                        }
                        <button ref={actionButtonRef} className="ListActionBtn" 
                            aria-label={`More actions for ${track.title}`}
                            aria-expanded={isActionMenuVisible}
                            onClick={handleToggleActionMenu}>
                            <img src="/assets/ellipsis.svg" alt="" />
                        </button>
                    </div>
            </div>
            {/* rendered outside the list, so the list's scrolling and fade do not clip it */}
            {isActionMenuVisible && createPortal(
                <div ref={actionMenuRef} className="PlaylistMenu Floating" style={menuPosition}>
                    <AddToPlaylist
                        track={track}
                        playlists={playlists}
                        onHandleAddToPlaylist={onHandleAddToPlaylist}
                        onHandleCreatePlaylist={onHandleCreatePlaylist}
                    />
                    <button className="PlaylistMenuItem" onClick={handlePlayNext}>
                        Play Next
                    </button>
                    {hasDeleteButton && 
                        <button className="PlaylistMenuItem" onClick={handleRemove}>
                            Remove
                        </button>
                    }
                </div>,
                document.body
            )}
        </>
    )
}
