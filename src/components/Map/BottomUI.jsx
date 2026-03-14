import todo_list_logo from '../../assets/images/todo_list.svg'
import user_pf_logo from '../../assets/images/user_profile.svg'
import stamps_logo from '../../assets/images/stamps_logo.svg'

import Timer from './Timer.jsx'

export default function BottomUI(props) {
    return (
        <div className='bottom-UI'>
            {(!props.currentlyTravelling.current || props.currentlyPaused.current) && <div className='travel-time-bar'>{props.travelTimeLabel}</div>}
            {props.currentlyTravelling.current && !props.currentlyPaused.current && <div className='travel-time-bar'>
                <Timer duration = {props.timerDuration}/>
            </div>}
            <div className='buttons'>
                <button
                    className='feature-button todo-list-button'
                ><img src={todo_list_logo} alt="Todo list page logo" /></button>
                <button
                    className='feature-button stamps-button'
                    onClick = {props.toggleStampsWindow}
                ><img src={stamps_logo} alt="Stamps page logo" /></button>
                {!props.currentlyTravelling.current && 
                <button className='at-station-button'>
                    {props.nextStation.name}
                </button>}
                {props.currentlyTravelling.current && 
                <button className='at-station-button travelling'
                    onClick = {props.togglePauseState}
                >
                    {props.currentlyPaused.current ? "resume" : "pause"}
                </button>}
                <button
                    className='feature-button sound-button'
                ></button>
                <button
                    className='feature-button profile-button'
                ><img src={user_pf_logo} alt="User profile page logo" /></button>
            </div>
        </div>
    )
}