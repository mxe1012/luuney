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