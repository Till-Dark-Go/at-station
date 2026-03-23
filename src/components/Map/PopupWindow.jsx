import close_popup_button from '../../assets/images/cross_button.svg'

import { getStationImage } from '../../api/image-grabber';

export default function PopupWindow(props) {

    getStationImage('alanya');

    function nextStationInfo() {
        return (
            <div className='info'>
                <div className='small-lable'>Your next station is</div>
                <div className='main-lable'>{props.nextStation.name}</div>
                {props.timeAndCoords.hours > 0 && <div className='travel-time'>The road will take <strong>{props.timeAndCoords.hours} hr {props.timeAndCoords.minutes} min</strong></div>}
                {props.timeAndCoords.hours == 0 && <div className='travel-time'>The road will take <strong>{props.timeAndCoords.minutes} min</strong></div>}
                <div className='description-picture'>
                    <img src="" alt="" />
                </div>
                <div className='country'>Country: {props.nextStation.country}</div>
            </div>
        )
    }

    function stopTravellingInfo() {
        return (
            <div className='info'>
                <div className='small-lable'>You are about to end your journey!</div>
                <div className='main-lable progress-lost'>Your progress will be lost</div>
                {/* <div className='travel-time'>You have __:__ of the road left to get to your destination</div> */}
                <div className='description'>By clicking the button below, the travelling time will reset and you will be back at your starting station. Are you sure you want to proceed?</div>
            </div>
        )
    }

    return (
        <div className='popup-window'>
            <button className='popup-close-button' onClick={props.closePopup}><img src={close_popup_button} alt="Close popup button" /></button>
            <div className='window-info'>

                {!props.currentlyTravelling.current && nextStationInfo()}
                {props.currentlyTravelling.current && stopTravellingInfo()}

                <div className='button'>
                    {!props.currentlyTravelling.current &&
                        <button className='feature-button confirmation-button' onClick={props.animateMovement}>CONFIRM</button>
                    }

                    {props.currentlyTravelling.current && 
                        <button className='feature-button confirmation-button stop-travelling-button' 
                            onClick={props.stopTravelling}>STOP TRAVELLING</button>
                    }
                </div>
            </div>
        </div>
    )
}