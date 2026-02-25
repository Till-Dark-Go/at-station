import "./todo.css";
import x_icon from "../../assets/images/x_task.svg";

export default function Todo() {
  return (
    <div className="todo-list">
      <h2 className="todo-list-title">Todo List</h2>
      <div className="todo-tasks">
        <div className="todo-task">
          <div className="checkbox-container">
            <input
              type="checkbox"
              id="test1"
              name="Task1"
              className="task-checkbox"
            ></input>
          </div>
          <div className="task-text-container">
            <label htmlFor="test1" className="todo-task-text">
              Test task 1
            </label>
            <div className="delete-button">
              <img
                src={x_icon}
                alt="Button to remove the task"
                className="close-button-icon"
              />
            </div>
          </div>
        </div>
        <div className="todo-task">
          <div className="checkbox-container">
            <input
              type="checkbox"
              id="test2"
              name="Task2"
              className="task-checkbox"
            ></input>
          </div>
          <div className="task-text-container">
            <label htmlFor="test2" className="todo-task-text">
              Test task 1 very long Test task 1 very long Test task 1 very long
              Test task 1 very long
            </label>
            <div className="delete-button">
              <img
                src={x_icon}
                alt="Button to remove the task"
                className="close-button-icon"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
