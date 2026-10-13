import type { ListButtonProps } from "../../../utils/types";

import { CoverImage } from "../../Containers";

export default function ListButton({list, track, onHandleFetch, onIsPlaying, onAddToFavorites, isFavorited, onRecentsList, onDeleteEntry, hasDeleteButton, hasFavoriteButton}: ListButtonProps) {

    return (
        <>
            <button className="PlaylistButton" onClick={() => {
                onHandleFetch(track.track_id);
                onIsPlaying(false)
                }}>
                    <div style={{display: "flex", justifyContent: "flex-start", alignItems: "center", gap: '12px'}}>
                        <div style={{flexShrink: 0}}>
                            <CoverImage styles={{borderRadius: '10px'}} src={track.artwork} size={64}/>
                        </div>
                        <div style={{textAlign: 'left', minWidth: 0, flex: 1}}>
                            <h4>{track.title}</h4>
                            <h5>{track.handle}</h5>
                        </div>
                        <div style={{display: "flex", justifyContent: "center", flexShrink: 0, gap: '5px'}}>
                            {hasFavoriteButton && 
                                <button className="ListFavoriteBtn"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onAddToFavorites?.(track)
                                    }}
                                    >
                                    <img src={isFavorited?.(track) ? "/assets/favorite_icons/favorited.svg" : "/assets/favorite_icons/not_favorited.svg"} aria-label="favorite" alt="favorite" />
                                </button>
                            }
                            {hasDeleteButton && 
                                <button className="ListFavoriteBtn"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onRecentsList?.(onDeleteEntry(list, track));
                                    }}
                                    >
                                    <img src="/assets/delete.svg" />
                                </button>
                            }
                        </div>
                    </div>
            </button>
        </>
    )
}
