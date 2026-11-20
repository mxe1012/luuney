import { useState } from "react";

import type { CoverImageProps } from "../utils/types";

export default function CoverImage({ styles, src, size, placeholderSrc = "/assets/placeholder-cover-purple.svg" }: CoverImageProps) {
    const [failedSrc, setFailedSrc] = useState<string | null>(null);

    const showPlaceholder = !src || failedSrc === src;

    return (
        <img
            style={styles}
            src={showPlaceholder ? placeholderSrc : src}
            width={size}
            height={size}
            alt=""
            onError={() => setFailedSrc(src ?? null)}
        />
    );
}
