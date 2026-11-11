import type { ListButtonProps } from "../../../utils/types";

import { formatTime } from "../../../utils/helpers";

import CoverImage from "../../CoverImage";

export default function ListButton({list, track, playlist, index, onHandleFetch, onIsPlaying, onAddToFavorites, isFavorited, onListDeleteEntry, onDeleteEntry, onDeletePlaylistEntry, hasDeleteButton, hasFavoriteButton, onSetTrackQueue, onSetCurrentTrackIndex}: ListButtonProps) {

    return (
        <>
            <div className="ListRow">
                <div className="ListMain">
                    <button className="PlaylistButton" onClick={() => {
                        onHandleFetch(track.track_id);
                        onIsPlaying(false);
                        onSetCurrentTrackIndex?.(index);
                        onSetTrackQueue?.([...list])
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
                        {hasDeleteButton && 
                            <button className="ListActionBtn" aria-label="Delete Entry"
                                onClick={() => {
                                    if (onDeleteEntry) {
                                        onListDeleteEntry?.(onDeleteEntry(list, track));
                                    }
                                    if (playlist?.id) {
                                    onDeletePlaylistEntry?.(playlist?.id, track)
                                    }
                                }}
                                >
                                <img src="/assets/delete.svg" alt="Delete" />
                            </button>
                        }
                    </div>
            </div>
        </>
    )
}
