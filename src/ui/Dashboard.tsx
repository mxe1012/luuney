import { useState } from "react";

import { fetchTrack } from "../utils/data";

import AudioPlayer from "./dashboard_components/AudioPlayer";

export default function Dashboard() {

    const [artwork, setArtwork] = useState("/assets/placeholder-cover.svg");

    const [track, setTrack] = useState({
        title: "Title",
        handle: "Artist",
        url: ""
    });

    async function handleFetch() {

        try {
            const result = await fetchTrack()

            setArtwork(result.data.artwork?.["480x480"] ?? "/assets/placeholder-cover.svg");

            const { title, user: { handle }, stream: { url } } = result.data;
            setTrack({ 
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
            <AudioPlayer coverArt={artwork} track={track}/>
            <br />
            <button onClick={handleFetch}>fetch track</button>
        </>
    )
}
