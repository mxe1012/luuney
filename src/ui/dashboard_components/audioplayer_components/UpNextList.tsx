import type { UpNextListProps } from "../../../utils/types";

import { formatTime } from "../../../utils/helpers";

export default function UpNextList({queue, isUpNextVisible}: UpNextListProps) {

    return (
        <>
            <div className={isUpNextVisible ? "UpNextList" : "UpNextList hidden"}>
                <h3>Up Next</h3>
                {queue.length === 0 ? (
                    <p className="UpNextEmpty">Nothing up next.</p>
                ) : (
                    <ul className="UpNextItems">
                        {queue.map((element) => (
                            <li className="UpNextItem" key={element.track_id}>
                                <span className="UpNextTitle">{element.title}</span>
                                <time className="UpNextDuration">{formatTime(element.duration)}</time>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </>
    )
}
