import type { SkeletonProps } from "../../utils/types";

export default function SkeletonExtraListPane({children, isLoaded}: SkeletonProps) {
    
    if(!isLoaded) {
        return (
            <>
                <div className="RowCenter">
                    <div className="ExtraListPane">
                        <h1><div className="skeleton skeleton-heading"></div></h1>
                        <ul className="ExtraListItems">
                            {Array.from({length: 5}, (_, i) => (
                                <li key={i} className="ExtraListItems">
                                    <div className="skeleton skeleton-button"></div>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </>
        )
    }
    return <>{children}</>;
}
