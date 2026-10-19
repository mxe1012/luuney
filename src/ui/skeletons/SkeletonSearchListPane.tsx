import type { SkeletonProps } from "../../utils/types";

export default function SkeletonSearchListPane({children, isLoaded}: SkeletonProps) {
    
    if(!isLoaded) {
        return (
            <>
                <ul className="SearchList">
                    {Array.from({length: 4}, (_, i) => (
                        <li className="SearchList" key={i}>
                            <div className="skeleton skeleton-search-list-button"></div>
                        </li>
                    ))}
                </ul>
            </>
        )
    }
    return <>{children}</>;
}
