import type { ArtistSearchListProps } from "../../../utils/types";
import CoverImage from "../../CoverImage";

export default function ArtistSearchList({list, onHandleFetchTracksByUserId, onSetArtistList}: ArtistSearchListProps) {


    return (
        <>
            <ul className="SearchList" style={{
                display: list.length === 0 ? "none" : "",
                visibility: list.length === 0 ? "hidden" : "visible"
            }}>
                {list.map((element) => (
                    <li className="SearchList" key={element.user_id}>
                        <button className="PlaylistButton" 
                            onClick={() => {
                            onHandleFetchTracksByUserId(element.user_id);
                            onSetArtistList([]);
                        }}>
                            <div style={{display: "flex", justifyContent: "flex-start", alignItems: "center", gap: '12px'}}>
                                <div style={{flexShrink: 0}}>
                                    <CoverImage styles={{borderRadius: '10px'}} src={element.profile_picture} size={64}/>
                                </div>
                                <div style={{textAlign: 'left', minWidth: 0, flex: 1}}>
                                    <h4>{element.name}</h4>
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