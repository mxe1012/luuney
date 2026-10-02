// import { useRef, useState, type ChangeEvent } from "react";

import AudioPlayer from "./dashboard_components/AudioPlayer";

import type { MusicDashboardProps } from "../utils/types";

export default function Dashboard({coverArt}: MusicDashboardProps) {

    return (
        <>
            <AudioPlayer coverArt={coverArt} />
        </>
    )
}
