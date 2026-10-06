import { useState } from "react";

import { fetchTrackById } from "../utils/data";

import AudioPlayer from "./dashboard_components/AudioPlayer";
import type { TrackObject } from "../utils/types";
import SearchListPane from "./dashboard_components/SearchListPane";
import { useSnackbar } from "../hooks/SnackbarContext";

export default function Dashboard() {

    const [track, setTrack] = useState<TrackObject>({
        track_id: 0,
        artwork: "/assets/placeholder-cover.svg",
        title: "Title",
        handle: "Artist",
        url: ""
    });

    const [isPlaying, setIsPlaying] = useState(false);

    const { showSnackbar } = useSnackbar();

    async function handleFetch(id: number) {

        showSnackbar("Loading track...");

        try {
            const result = await fetchTrackById(id);

            const { track_id, artwork, title, user: { handle }, stream: { url } } = result.data;
            setTrack({ 
                track_id,
                artwork: artwork?.["480x480"] ?? "/assets/placeholder-cover.svg",
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

    return (
        <>
            <div className="MusicDashboard">
                <div>
                    <AudioPlayer track={track} isPlaying={isPlaying} onIsPlaying={setIsPlaying}/>
                </div>
                <div>
                    <SearchListPane onHandleFetch={handleFetch} onIsPlaying={setIsPlaying}/>
                </div>
            </div>
        </>
    )
}
