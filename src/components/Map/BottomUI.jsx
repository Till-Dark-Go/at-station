import todo_list_logo from '../../assets/images/todo_list.svg'
import user_pf_logo from '../../assets/images/user_profile.svg'

export default function BottomUI(props) {
    return (
        <div className='bottom-UI'>
            <div className='travel-time-bar'>{props.travelTimeLabel}</div>
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
                    onClick = {props.openPopup}
                >
                    end journey
                </button>}
                <button
                    className='profile-button'
                ><img src={user_pf_logo} alt="User profile page logo" /></button>
            </div>
        </div>
    )
}