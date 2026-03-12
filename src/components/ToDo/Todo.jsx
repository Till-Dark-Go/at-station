import { useState, useEffect } from "react";
import "./todo.css";
import x_icon from "../../assets/images/x_task.svg";
import { createTodo, getTodos, updateTodo, deleteTodo } from "../../api/todo-db";
import { auth } from "../../api/firebase";

export default function Todo() {
  //state for the todolist and new task input
  const [todos, setTodos] = useState([]);

  //get current logged in user'sid
  const userId = auth.currentUser?.uid;

  //fetch todos from the firebase when the component is loaded
  useEffect(() => {
    if (!userId) return;
    getTodos(userId).then(setTodos);
  }, [userId]);

  //mark completed(or not)
  const handleToggle = async (todo) => {
    await updateTodo(userId, todo.id, { completed: !todo.completed });
    setTodos(todos.map((t) => t.id === todo.id ? { ...t, completed: !t.completed } : t));
  };

  //delete a todo on 'x'
  const handleDelete = async (todoId) => {
    await deleteTodo(userId, todoId);
    setTodos(todos.filter((t) => t.id !== todoId));
  };

  //create a new todo
  const handleCreate = async () => {
    const value = prompt("Enter a task", "");
    if (!value) return;
    const id = await createTodo(userId, value);
    setTodos([...todos, { id, title: value, completed: false }]);
  };

  return (
    <div className="todo-list">
      <h2 className="todo-list-title">Todo List</h2>
      <div className="input-todo">
        <button className="input-todo-button" onClick={handleCreate}>
          Input
        </button>
      </div>
      <div className="todo-tasks">
        {todos.map((todo) => (
          <div className="todo-task" key={todo.id}>
            <div className="checkbox-container">
              <input
                type="checkbox"
                id={`task-${todo.id}`}
                className="task-checkbox"
                checked={todo.completed}
                onChange={() => handleToggle(todo)}
              />
            </div>
            <div className="task-text-container">
              <label htmlFor={`task-${todo.id}`} className="todo-task-text">
                {todo.title}
              </label>
              <div className="delete-button">
                <img
                  src={x_icon}
                  alt="Button to remove the task"
                  className="close-button-icon"
                  onClick={() => handleDelete(todo.id)}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
