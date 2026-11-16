
export default function EmptyListMessage({listName, extraMessage=""}) {
    return (
        <>
            <div className="ColumnCenter CenterText">
                <h2 className="CreamColor">No {listName} found!</h2>
                <p className="MutedLavenderColor">{extraMessage}</p>
            </div>
        </>
    )
}