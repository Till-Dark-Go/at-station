export default function TopUI(props) {
    return (
        <div className='top-curr-station-name'>
            <div className='lable'>{
                props.currentlyTravelling.current ? "Currently on the way to" : "Current station is"
            }</div>
            <div className='station-name'>{props.userStartingPoint.name}</div>
            <div className='line'></div>
        </div>
    )
}