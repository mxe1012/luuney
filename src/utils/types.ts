import type React from "react";

export interface ChildrenProps {
    children: React.ReactNode;
}

export interface AudioPlayerProps {
    coverArt: string;
    title: string;
    artist: string;
    streamUrl: string;
}

export interface AudioPlayerButtonProps {
    onClick: React.MouseEventHandler<HTMLButtonElement>;
    size: number;
    isPlaying?: boolean;
    isMuted?: boolean;
    alTrue: string;
    alFalse: string;
    srcTrue: string;
    srcFalse: string;
}
