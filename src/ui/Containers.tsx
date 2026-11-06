import type { ChildrenProps, MiniIconProps } from "../utils/types";

export function MainPane({children}: ChildrenProps) {
    return <>{children}</>;
}

export function MiniIcon({src, size=18}: MiniIconProps) {
    return <img src={src} width={size} height={size} />
}

export function PlaylistControllerButtonMiniContainer({children}: ChildrenProps) {
    return (
        <div style={{display: "flex", justifyContent: "flex-start"}}>
            {children}
        </div>
    )
}
