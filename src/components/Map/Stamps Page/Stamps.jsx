import './stamps.css'
import lux from '../../../assets/stamps images/luxembourg.png'
import zurich from '../../../assets/stamps images/zurich.png'
import bern from '../../../assets/stamps images/bern.png'

import CountryStamp from './CountryStamp.jsx'

export default function Stamps() {
    function open_stamp() {
        console.log("Clicked the stamp");
    }

    return (
        <div className="stamps-container">
            <div className='top-info'>
                <p className='name'>Stamps collection</p>
                <div className='stats'>
                    <p className='collected'>collected: 23</p>
                    <p className='total'>total: 105</p>
                </div>
            </div>
            <div className='stamps-mini'>
                <p className='sorting'>
                    <label htmlFor="sorting-options">Sorted by:</label>
                    <select id="sorting-options">
                        <option value="last-visited">Last visited</option>
                        <option value="alphab">Aa - Zz</option>
                    </select>
                </p>
                <CountryStamp 
                    openStamp = {open_stamp}
                    stationPic = {lux}
                    name = "Luxembourg"
                    country = "Luxembourg"
                    date = "01.03.2026"
                />
                <CountryStamp 
                    openStamp = {open_stamp}
                    stationPic = {zurich}
                    name = "Zurich"
                    country = "Switzerland"
                    date = "12.02.2026"
                />
                <CountryStamp 
                    openStamp = {open_stamp}
                    stationPic = {bern}
                    name = "Bern"
                    country = "Switzerland"
                    date = "24.02.2026"
                />
            </div>
        </div>
    )
}