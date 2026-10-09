import type { MainListProps } from "../../../utils/types";

import { CoverImage } from "../../Containers";

export default function FavoritesList({list, visible, onFavoritesList, onDeleteEntry, onHandleFetch, onIsPlaying}: MainListProps) {
    
    return (
        <>
            <ul className={visible ? "PlaylistPaneList" : "PlaylistPaneList hidden"}>
                {list.map((element) => (
                    <li className="PlaylistPaneList" key={element.track_id}>
                        <button className="PlaylistButton" onClick={() => {
                        onHandleFetch(element.track_id);
                        onIsPlaying(false)
                        }}>
                            <div style={{display: "flex", justifyContent: "flex-start", alignItems: "center", gap: '12px'}}>
                                <div style={{flexShrink: 0}}>
                                    <CoverImage styles={{borderRadius: '10px'}} src={element.artwork} size={64}/>
                                </div>
                                <div style={{textAlign: 'left', minWidth: 0, flex: 1}}>
                                    <h4>{element.title}</h4>
                                    <h5>{element.handle}</h5>
                                </div>
                                <div style={{display: "flex", justifyContent: "center", flexShrink: 0, gap: '5px'}}>
                                    <button className="ListFavoriteBtn"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onFavoritesList?.(onDeleteEntry(list, element));
                                        }}
                                        >
                                        <img src="/assets/delete.svg" />
                                    </button>
                                </div>
                            </div>
                    </button>
                </li>
            ))}
            </ul>
        </>
    )
}
