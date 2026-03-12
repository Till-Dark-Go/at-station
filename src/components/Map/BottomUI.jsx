import todo_list_logo from "../../assets/images/todo_list.svg";
import user_pf_logo from "../../assets/images/user_profile.svg";
import Todo from "../ToDo/Todo.jsx";
import Timer from "./Timer.jsx";
import { useState } from "react";

export default function BottomUI(props) {
    return (
        <div className='bottom-UI'>
            {(!props.currentlyTravelling.current || props.currentlyPaused.current) && <div className='travel-time-bar'>{props.travelTimeLabel}</div>}
            {props.currentlyTravelling.current && !props.currentlyPaused.current && <div className='travel-time-bar'>
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
                    onClick = {props.togglePauseState}
                >
                    {props.currentlyPaused.current ? "resume" : "pause"}
                </button>}
                <button
                    className='profile-button'
                ><img src={user_pf_logo} alt="User profile page logo" /></button>
            </div>
        </div>
      )}
      <div className="buttons">
        <button className="todo-list-button" onClick={props.openTodoList}>
          <img src={todo_list_logo} alt="Todo list page logo" />
        </button>
        {!props.currentlyTravelling.current && (
          <button className="at-station-button">
            {props.nextStation.name}
          </button>
        )}
        {props.currentlyTravelling.current && (
          <button
            className="at-station-button travelling"
            onClick={props.pauseTravelling}
          >
            pause
          </button>
        )}
        <button className="profile-button">
          <img src={user_pf_logo} alt="User profile page logo" />
        </button>
      </div>
    </div>
  );
}
