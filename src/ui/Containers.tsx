import type { ChildrenProps } from "../utils/types";

export function MainPane({children}: ChildrenProps) {
    return <div>{children}</div>;
}

export function CoverArtImage({src}) {
    return <img className="CovertArtImage" src={src} width={256} height={256} alt="Cover Art" />
}
