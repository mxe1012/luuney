import { useSnackbar } from "../../../hooks/SnackbarContext";
import type { SearchController } from "../../../utils/types";

export default function SearchController({searchType, searchTypes, searchTrack, searchArtist, onHandleSearchTracks, onHandleSearchArtists, onHandleSearchType, onSetArtistList, onSetTrackList}: SearchController) {

    const { showSnackbar } = useSnackbar();

    return (
        <>
            <div className="SearchController">
                <input 
                    className="SearchInput" 
                    value={searchType === "tracks" ? searchTrack : searchArtist} 
                    placeholder={searchType === "tracks" ? "Search Tracks..." : "Search Artists..."}
                    onChange={searchType === "tracks" ? onHandleSearchTracks : onHandleSearchArtists}>
                </input>
                <select value={searchType} className="PlaylistPaneControllerButton" onChange={onHandleSearchType}>
                    <option value={searchTypes[0]} onClick={() => {onSetArtistList([]); showSnackbar("Searching by Tracks")}}>Tracks</option>
                    <option value={searchTypes[1]} onClick={() => {onSetTrackList([]); showSnackbar("Searching by Artists")}}>Artists</option>
                </select>
            </div>
        </>
    )
}