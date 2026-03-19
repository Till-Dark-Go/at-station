import './stamps.css'
import lux from '../../../assets/stamps images/luxembourg.png'
import zurich from '../../../assets/stamps images/zurich.png'
import bern from '../../../assets/stamps images/bern.png'

import close_popup_button from '../../../assets/images/cross_button.svg'

import CountryStamp from './CountryStamp.jsx'
import ExpandedStamp from './ExpandedStamp.jsx'

import { useState } from 'react'

export default function Stamps() {

    const [expandedOpen, setExpandedOpen] = useState([false, "", ""]);

    function toggle_stamp_open(name, pic) {
        console.log("Clicked the stamp");
        if (expandedOpen[0]) setExpandedOpen([false, "", ""]);
        else setExpandedOpen([true, name, pic]);  // Instead of JUST THE NAME we should probably pass in an ID of the station to quickly search
        //  through the db and find the entry we need - this depends on how we're going to store the dates !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    }

    return (
        <div className="stamps-container">
            {expandedOpen[0] && 
                <>
                    <button className='popup-close-button' onClick={toggle_stamp_open}><img src={close_popup_button} alt="Close popup button" /></button>
                    <ExpandedStamp name = {expandedOpen[1]} pic = {expandedOpen[2]} />
                </>
            }
            {!expandedOpen[0] && 
            <>
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
                        toggleStamp = {() => toggle_stamp_open('Luxembourg', lux)}
                        stationPic = {lux}
                        name = "Luxembourg"
                        country = "Luxembourg"
                        date = "01.03.2026"
                    />
                    <CountryStamp 
                        toggleStamp = {() => toggle_stamp_open('Zurich', zurich)}
                        stationPic = {zurich}
                        name = "Zurich"
                        country = "Switzerland"
                        date = "12.02.2026"
                    />
                    <CountryStamp 
                        toggleStamp = {() => toggle_stamp_open('Bern', bern)}
                        stationPic = {bern}
                        name = "Bern"
                        country = "Switzerland"
                        date = "24.02.2026"
                    />
                </div>
            </>
            }
        </div>
    )
}