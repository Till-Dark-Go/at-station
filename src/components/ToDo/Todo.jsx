import { useState, useEffect } from "react";
import "./todo.css";
import x_icon from "../../assets/images/x_task.svg";
import { createTodo, getTodos, updateTodo, deleteTodo } from "../../api/todo-db";
import { auth } from "../../api/firebase";

export default function Todo() {
  const [tasks, setTasks] = useState([
    { id: 1, text: "Test task 1" },
    { id: 2, text: "Test task 1 very long Test task 1 very long" },
  ]);

  function addTask() {
    const value = prompt("Enter a task", "");
    if (value) {
      setTasks([...tasks, { id: Date.now(), text: value }]);
    }
  }

  function deleteTask(id) {
    setTasks(tasks.filter((task) => task.id !== id));
  }
  //state for the todolist and new task input
  const [todos, setTodos] = useState([]);
  const [newTitle, setNewTitle] = useState("");
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
    if (!newTitle.trim()) return;
    const id = await createTodo(userId, newTitle);
    setTodos([...todos, { id, title: newTitle, completed: false }]);
    setNewTitle("");
  };

  return (
    <div className="todo-list">
      <h2 className="todo-list-title">Todo List</h2>
      <div className="input-todo">
        <button className="input-todo-button" onClick={addTask}>
          Input
        </button>
      </div>
      <div className="todo-tasks">
        {tasks.map((task) => (
          <div className="todo-task" key={task.id}>
            <div className="checkbox-container">
              <input
                type="checkbox"
                id={`task-${task.id}`}
                className="task-checkbox"
              />
            </div>
            <div className="task-text-container">
              <label htmlFor={`task-${task.id}`} className="todo-task-text">
                {task.text}
              </label>
              <div className="delete-button">
                <img
                  src={x_icon}
                  alt="Button to remove the task"
                  className="close-button-icon"
                  onClick={() => deleteTask(task.id)}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
