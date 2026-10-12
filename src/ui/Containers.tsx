import { useState } from "react";

import type { ChildrenProps, CoverImageProps } from "../utils/types";

export function MainPane({children}: ChildrenProps) {
    return <>{children}</>;
}

export function CoverImage({ styles, src, size }: CoverImageProps) {
    const [failedSrc, setFailedSrc] = useState<string | null>(null);

    const showPlaceholder = !src || failedSrc === src;

    return (
        <img
            style={styles}
            src={showPlaceholder ? "/assets/placeholder-cover-purple.svg" : src}
            width={size}
            height={size}
            alt="Cover Image"
            onError={() => setFailedSrc(src ?? null)}
        />
    );
}
