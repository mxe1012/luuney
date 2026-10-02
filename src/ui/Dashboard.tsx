import { useState } from "react";

import { fetchTrack } from "../utils/data";

import AudioPlayer from "./dashboard_components/AudioPlayer";

export default function Dashboard() {

    // const [track, setTrack] = useState();
    const [artwork, setArtwork] = useState("/assets/placeholder-cover.svg");

    const [title, setTitle] = useState("Title");
    const [artist, setArtist] = useState("Artist");

    const [streamUrl, setStreamUrl] = useState("");

    async function handleFetch() {

        try {
            const result = await fetchTrack()

            setArtwork(result.data.artwork?.["480x480"] ?? "/assets/placeholder-cover.svg");

            setTitle(result.data.title);
            setArtist(result.data.user.handle);
            
            setStreamUrl(result.data.stream.url);

        }
        catch(e) {
            console.log(e);
        }
        
    }

    return (
        <>
            <AudioPlayer coverArt={artwork} title={title} artist={artist} streamUrl={streamUrl}/>
            <br />
            <button onClick={handleFetch}>fetch track</button>
        </>
    )
}
