import './expanded_stamp.css'

export default function ExpandedStamp(props) {

    function entry_info() {
        return (
            <>
            <div className="entry-info">
                <span className="label">Route:</span>
                <span className="label">Time:</span>
                <span className="label">Date:</span>
                <span className="label">Time taken:</span>

                <span>Innsbruck – Luxembourg</span>
                <span>13:01 – 15:09</span>
                <span>15.02.2026</span>
                <span>1:20</span>
            </div>
            <hr />
            </>
        )
    }

    return (
        <div className="expanded-stamp">
            <div className='names exp-names'>
                <p className='station'>{props.name}</p>
                <p className='country-stamp'>Luxembourg</p>
            </div>
            <div className='exp-station-pic'>
                <img src={props.pic} alt="Luxembourg picture"/>
            </div>
            <div className="travel-log">
                <div className="title">Travel Log</div>
                {entry_info()}
            </div>
        </div>
    )
}