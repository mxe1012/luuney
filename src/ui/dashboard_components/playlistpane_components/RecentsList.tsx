import type { RecentListProps } from "../../../utils/types";

import { CoverImage } from "../../Containers";

export default function RecentsList({recents, visible, onHandleFetch, onIsPlaying}: RecentListProps) {
    
    return (
        <>
            <ul className={visible ? "PlaylistPaneList" : "PlaylistPaneList hidden"}>
                {recents.map((element) => (
                    <li className="PlaylistPaneList" key={element.track_id}>
                        <button className="PlaylistButton" onClick={() => {
                        onHandleFetch(element.track_id);
                        onIsPlaying(false)
                        }}>
                            <div style={{display: "flex", justifyContent: "flex-start", alignItems: "center", gap: '12px'}}>
                                <div style={{flexShrink: 0}}>
                                    <CoverImage styles={{borderRadius: '10px'}} src={element.artwork} size={64}/>
                                </div>
                                <div style={{textAlign: 'left', minWidth: 0}}>
                                    <h4>{element.title}</h4>
                                    <h5>{element.handle}</h5>
                                </div>
                            </div>
                    </button>
                </li>
            ))}
            </ul>
        </>
    )
}
