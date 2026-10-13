import type { ListButtonProps } from "../../../utils/types";

import { CoverImage } from "../../Containers";

export default function ListButton({list, track, onHandleFetch, onIsPlaying, onAddToFavorites, isFavorited, onListDeleteEntry, onDeleteEntry, hasDeleteButton, hasFavoriteButton}: ListButtonProps) {

    return (
        <>
            <div style={{display: "flex", justifyContent:"flex-start", gap: "6px"}}>
                <div style={{flex: 1, minWidth: 0, gap: '2px'}}>
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
                            </div>
                    </button>
                </div>
                    <div style={{display: "grid", alignItems: "center", flexShrink: 0}}>
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
                                    onListDeleteEntry?.(onDeleteEntry(list, track));
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
