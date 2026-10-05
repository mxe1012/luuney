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
    alt?: string;
    isPlaying?: boolean;
    isMuted?: boolean;
    al?: string;
    alTrue?: string;
    alFalse?: string;
    src?: string
    srcTrue?: string;
    srcFalse?: string;
}
