import { useState } from "react";
import { useSnackbar } from "../hooks/SnackbarContext";
import type { AddToPlaylistProps } from "../utils/types";
import { useLibrary } from "../hooks/LibraryContext";

export default function AddToPlaylist({track}: AddToPlaylistProps) {

    const { playlists, onHandleAddToPlaylist, onHandleCreatePlaylist } = useLibrary();

    const [playlistName, setPlaylistName] = useState("");

    const { showSnackbar } = useSnackbar();

    return (
        <>
            <div className="MenuActions">
                <input className="PlaylistMenuInput" value={playlistName} placeholder="Playlist" 
                    onChange={(e) => {
                        setPlaylistName(e.target.value)
                    }} 
                    onClick={(e) => e.stopPropagation()} 
                />
                <button className="PlaylistMenuAddItemBtn" 
                    disabled={playlistName.trim().length === 0}
                    onClick={() => { 
                        onHandleCreatePlaylist(playlistName, track);
                        setPlaylistName("");
                        showSnackbar("Playlist created!");
                    }}>
                        +
                </button>
            </div>
            <div>
                <ul className="PlaylistMenuList">
                {playlists.map((element) => (
                    <li key={element.id}> 
                        <button className="PlaylistMenuItem" onClick={() => {
                            onHandleAddToPlaylist(element.id, track);
                            showSnackbar("Track added to " + element.name + "!")
                        }}>
                            <p className="NoMargin ListText">{element.name}</p>
                        </button>
                    </li>
                ))}
                </ul>
            </div>
        </>
    )
}
