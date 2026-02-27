import todo_list_logo from '../../assets/images/todo_list.svg'
import user_pf_logo from '../../assets/images/user_profile.svg'
import { useNavigate } from 'react-router-dom';

import Timer from './Timer.jsx'

export default function BottomUI(props) {
    const navigate = useNavigate();
    return (
        <div className='bottom-UI'>
            {!props.currentlyTravelling.current && <div className='travel-time-bar'>{props.travelTimeLabel}</div>}
            {props.currentlyTravelling.current && <div className='travel-time-bar'>
                <Timer duration = {props.timerDuration}/>
            </div>}
            <div className='buttons'>
                <button
                    className='todo-list-button'
                ><img src={todo_list_logo} alt="Todo list page logo" /></button>
                {!props.currentlyTravelling.current && 
                <button className='at-station-button'>
                    {props.nextStation.name}
                </button>}
                {props.currentlyTravelling.current && 
                <button className='at-station-button travelling'
                    onClick = {props.pauseTravelling}
                >
                    pause
                </button>}
                <button
                    className='profile-button'
                    onClick = {props.toggleProfileWindow}
                ><img src={user_pf_logo} alt="User profile page logo" /></button>
            </div>
        </div>
    )
}