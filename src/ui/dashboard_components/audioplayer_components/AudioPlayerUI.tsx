import type { AudioPlayerUIProps } from "../../../utils/types";

import MainAudioPlayer from "./audioplayerUI_components/MainAudioPlayer";

import MiniAudioPlayer from "./audioplayerUI_components/MiniAudioPlayer";


export default function AudioPlayerUI(props: AudioPlayerUIProps) {

    return (
        <>
            <MainAudioPlayer {...props}/>
            <MiniAudioPlayer {...props}/>
        </>
    )
}