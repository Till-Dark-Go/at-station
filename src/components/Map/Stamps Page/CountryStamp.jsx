import stamps_arrow from '../../../assets/images/stamps_arrow.svg'

export default function CountryStamp(props) {
    return (
        <div className='stamp-block' onClick = {props.open_stamp}>
            <div className='station-pic'>
                <img src={props.stationPic} alt="Luxembourg picture"/>
            </div>
            <div className='names'>
                <p className='station'>{props.name}</p>
                <p className='country-stamp'>{props.country}</p>
            </div>
            <div className='info-arrow'>
                <img src={stamps_arrow} alt="Arrow to expand the stamp" />
                <p className='last-visited'>Last visited:</p>
                <p className='date'>{props.date}</p>
            </div>
        </div>
    )
}