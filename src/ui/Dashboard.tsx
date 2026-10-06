import { useState } from "react";

import { fetchTrackById } from "../utils/data";

import AudioPlayer from "./dashboard_components/AudioPlayer";
import type { TrackObject } from "../utils/types";
import SearchListPane from "./dashboard_components/SearchListPane";

export default function Dashboard() {

    const [track, setTrack] = useState<TrackObject>({
        track_id: 0,
        artwork: "/assets/placeholder-cover.svg",
        title: "Title",
        handle: "Artist",
        url: ""
    });

    async function handleFetch(id: number) {

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
        }
        catch(e) {
            console.log(e);
        }
        
    }

    return (
        <>
            <div className="MusicDashboard">
                <div>
                    <AudioPlayer track={track}/>
                </div>
                <div>
                    <SearchListPane onHandleFetch={handleFetch} />
                </div>
            </div>
        </>
    )
}
