import type { ChildrenProps } from "../utils/types";

export function MainPane({children}: ChildrenProps) {
    return <div style={{marginTop: "20px"}}>{children}</div>;
}
