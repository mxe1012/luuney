import { useState } from "react";

import { fetchTrackById } from "../utils/data";

import AudioPlayer from "./dashboard_components/AudioPlayer";
import type { TrackObject } from "../utils/types";
import SearchListPane from "./dashboard_components/SearchListPane";
import { useSnackbar } from "../hooks/SnackbarContext";

// import { CoverImage } from "./Containers";
import PlaylistPane from "./dashboard_components/PlaylistPane";

export default function Dashboard() {

    const [track, setTrack] = useState<TrackObject>({
        track_id: 0,
        artwork: "/assets/placeholder-cover-purple.svg",
        title: "Title",
        handle: "Artist",
        url: ""
    });

    const [isPlaying, setIsPlaying] = useState(false);

    const [recents, setRecents] = useState<TrackObject[]>([]);

    const { showSnackbar } = useSnackbar();

    async function handleFetch(id: number) {

        showSnackbar("Loading track...");

        try {
            const result = await fetchTrackById(id);

            const { track_id, artwork, title, user: { handle }, stream: { url } } = result.data;
            setTrack({ 
                track_id,
                artwork: artwork?.["480x480"] ?? "/assets/placeholder-cover-purple.svg",
                title, 
                handle, 
                url 
            });

            showSnackbar("Now playing:\n" + title + "\n" + handle)

        }
        catch(e) {
            showSnackbar("Error in loading track!", 12000)
            console.log(e);
        }
        
    }

    function addToRecents(entry: TrackObject) {
        const maxed = recents.length >= 20 ? recents.slice(0, 19) : recents
        const filtered = maxed.filter((element) => element.track_id != entry.track_id);

        setRecents([
            entry,
            ...filtered
        ])
    }

    return (
        <>
            <div className="MusicDashboard">
                <div>
                    <PlaylistPane recents={recents} onHandleFetch={handleFetch} onIsPlaying={setIsPlaying} />
                </div>
                <div>
                    <AudioPlayer track={track} isPlaying={isPlaying} onIsPlaying={setIsPlaying}/>
                </div>
                <div>
                    <SearchListPane onHandleFetch={handleFetch} onAddToRecents={addToRecents} onIsPlaying={setIsPlaying}/>
                </div>
            </div>
        </>
    )
}
