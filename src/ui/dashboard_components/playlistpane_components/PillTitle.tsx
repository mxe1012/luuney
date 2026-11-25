import { useEffect, useRef, useState } from "react";
import { MiniIcon } from "../../Containers";
import type { PillTitleProps } from "../../../utils/types";

export default function PillTitle({heading, actionIcon, actionLabel, initialValue, onSubmit}: PillTitleProps) {

    const [isMenuVisible, setIsMenuVisible] = useState(false);
    const [value, setValue] = useState("");

    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleMouseDown = (e: MouseEvent) => {
            if (!wrapperRef.current?.contains(e.target as Node)) setIsMenuVisible(false);
        };

        document.addEventListener("mousedown", handleMouseDown);
        return () => document.removeEventListener("mousedown", handleMouseDown);
    }, []);

    return (
        <div ref={wrapperRef} className="PlaylistMenuWrapper PlaylistTitleCard">
            <h2 className="CreamColor CenterText NoMargin">{heading}</h2>
            <button className="ListActionBtn"
                onClick={() => {setIsMenuVisible(!isMenuVisible); setValue(initialValue)}}
                aria-label={actionLabel}>
                <MiniIcon src={actionIcon} size={16} />
            </button>
            <div className={isMenuVisible ? "PlaylistMenu OpensDown" : "PlaylistMenu OpensDown hidden"}>
                <div className="MenuActions">
                    <input className="PlaylistMenuInput" value={value} placeholder="Playlist name"
                        onChange={(e) => setValue(e.target.value)}
                    />
                    <button className="PlaylistMenuAddItemBtn" 
                        disabled={value.trim().length === 0}
                        onClick={() => onSubmit(value.trim())}>
                            <MiniIcon src="/assets/check.svg" size={12} />
                    </button>
                </div>
            </div>
        </div>
    )
}
