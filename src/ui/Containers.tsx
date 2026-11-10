import type { ChildrenProps, MiniIconProps } from "../utils/types";

export function MainPane({children}: ChildrenProps) {
    return <>{children}</>;
}

export function MiniIcon({src, size=18, alt}: MiniIconProps) {
    return <img src={src} width={size} height={size} alt={alt}/>
}

export function PlaylistControllerButtonMiniContainer({children}: ChildrenProps) {
    return (
        <div className="RowStart">
            {children}
        </div>
    )
}
