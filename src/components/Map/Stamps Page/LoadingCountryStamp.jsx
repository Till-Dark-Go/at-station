import './stamps.css'

export const LoadingStamp = () => {
    return (
         <div className="loading-stamp-mini">
            <div className="loading-image"></div>
            <div className="loading-names"></div>
        </div>
    );
}

export const LoadingListStamps = () => {  // This is what's going to PULSE GREY on the page while we wait for a response
    const loadStamps = [1, 2, 3]
    return (
        <div className="to-load">
            {loadStamps.map(num => {return <LoadingStamp key={num}/>})}
        </div>
    );
}