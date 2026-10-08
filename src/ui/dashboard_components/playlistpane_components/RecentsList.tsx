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
                            <div style={{display: "flex", justifyContent: "flex-start", gap: '5px'}}>
                                <div>
                                    <CoverImage styles={{borderRadius: '10px'}} src={element.artwork} size={64}/>
                                </div>
                                <div style={{textAlign: 'left'}}>
                                    <h4>{element.title}</h4>
                                </div>
                            </div>
                        <h5>{element.handle}</h5>
                    </button>
                </li>
            ))}
            </ul>
        </>
    )
}
