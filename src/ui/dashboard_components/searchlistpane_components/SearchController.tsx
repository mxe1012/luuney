import type { SearchControllerProps } from "../../../utils/types";

export default function SearchController({searchType, searchTypes, searchTrack, searchArtist, onHandleSearchTracks, onHandleSearchArtists, onHandleSearchType}: SearchControllerProps) {

    return (
        <>
            <div className="SearchController">
                <input 
                    className="SearchInput"
                    size={14}
                    value={searchType === "tracks" ? searchTrack : searchArtist} 
                    placeholder={searchType === "tracks" ? "Search Tracks..." : "Search Artists..."}
                    onChange={searchType === "tracks" ? onHandleSearchTracks : onHandleSearchArtists}>
                </input>
                <select value={searchType} className="PlaylistPaneControllerButton" onChange={onHandleSearchType}>
                    <option value={searchTypes[0]}>Tracks</option>
                    <option value={searchTypes[1]}>Artists</option>
                </select>
            </div>
        </>
    )
}