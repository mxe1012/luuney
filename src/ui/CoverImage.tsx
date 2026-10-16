import { useState } from "react";

import type { CoverImageProps } from "../utils/types";

export default function CoverImage({ styles, src, size }: CoverImageProps) {
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
