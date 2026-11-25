import { useEffect, useRef, useState, type SubmitEvent } from "react";
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

    function handleSubmit(e: SubmitEvent<HTMLFormElement>) {
        e.preventDefault();

        const name = value.trim();
        if (name.length === 0) return;

        onSubmit(name);
        setIsMenuVisible(false);
    }

    return (
        <form onSubmit={handleSubmit}>
            <div ref={wrapperRef} className="PlaylistMenuWrapper PlaylistTitleCard">
                <h2 className="CreamColor CenterText NoMargin">{heading}</h2>
                <button type="button" className="ListActionBtn"
                    onClick={() => {setIsMenuVisible(!isMenuVisible); setValue(initialValue)}}
                    aria-label={actionLabel}>
                    <MiniIcon src={actionIcon} size={16} />
                </button>
                <div className={isMenuVisible ? "PlaylistMenu OpensDown" : "PlaylistMenu OpensDown hidden"}>
                    <div className="MenuActions">
                        <input className="PlaylistMenuInput" value={value} placeholder="Playlist name"
                            onChange={(e) => setValue(e.target.value)}
                            onKeyDown={(e) => { if (e.key === "Escape") setIsMenuVisible(false); }}
                        />
                        <button type="submit" className="PlaylistMenuAddItemBtn"
                            disabled={value.trim().length === 0}>
                                <MiniIcon src="/assets/check.svg" size={12} />
                        </button>
                    </div>
                </div>
            </div>
        </form>
    )
}
