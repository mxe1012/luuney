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
    toggleAction?: boolean;
    label?: string;
    labelTrue?: string;
    labelFalse?: string;
    src?: string
    srcTrue?: string;
    srcFalse?: string;
}
