import { useState, useEffect, useRef } from "react";
import "../../assets/styles/todo.css";
import {
	createTodo,
	getTodos,
	updateTodo,
	deleteTodo,
} from "../../api/todo-db";
import { auth } from "../../api/firebase";
import plus_icon from "../../assets/images/plus_icon.svg";

function TrashIcon() {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="24"
			height="24"
			viewBox="0 0 24 24"
		>
			<g fill="none" stroke="currentColor" stroke-width="1.5">
				<path
					stroke-linecap="round"
					d="M20.5 6h-17m15.333 2.5l-.46 6.9c-.177 2.654-.265 3.981-1.13 4.79s-2.196.81-4.856.81h-.774c-2.66 0-3.991 0-4.856-.81c-.865-.809-.954-2.136-1.13-4.79l-.46-6.9M9.5 11l.5 5m4.5-5l-.5 5"
				/>
				<path d="M6.5 6h.11a2 2 0 0 0 1.83-1.32l.034-.103l.097-.291c.083-.249.125-.373.18-.479a1.5 1.5 0 0 1 1.094-.788C9.962 3 10.093 3 10.355 3h3.29c.262 0 .393 0 .51.019a1.5 1.5 0 0 1 1.094.788c.055.106.097.23.18.479l.097.291A2 2 0 0 0 17.5 6" />
			</g>
		</svg>
	);
}

export default function Todo() {
	const [todos, setTodos] = useState([]);
	const [inputValue, setInputValue] = useState("");
	const inputRef = useRef(null);

	const userId = auth.currentUser?.uid;

	// Format today's date as "march 1"
	const today = new Date().toLocaleDateString("en-US", {
		month: "long",
		day: "numeric",
	});

	useEffect(() => {
		if (!userId) return;
		getTodos(userId).then(setTodos);
	}, [userId]);

	const handleToggle = async (todo) => {
		await updateTodo(userId, todo.id, { completed: !todo.completed });
		setTodos(
			todos.map((t) =>
				t.id === todo.id ? { ...t, completed: !t.completed } : t,
			),
		);
	};

	const handleDelete = async (todoId) => {
		await deleteTodo(userId, todoId);
		setTodos(todos.filter((t) => t.id !== todoId));
	};

	const handleCreate = async () => {
		const value = inputValue.trim();
		if (!value) return;
		const id = await createTodo(userId, value);
		setTodos([...todos, { id, title: value, completed: false }]);
		setInputValue("");
		inputRef.current?.focus();
	};

	const handleKeyDown = (e) => {
		if (e.key === "Enter") handleCreate();
	};

	const incomplete = todos.filter((t) => !t.completed);
	const completed = todos.filter((t) => t.completed);

	console.log(completed.length, incomplete.length);

	return (
		<div className="todo-list fade-in">
			<h2 className="todo-list-title">To do list</h2>
			<p className="todo-list-date">{today}</p>

			<div className="todo-input-row">
				<input
					ref={inputRef}
					className="todo-input"
					type="text"
					placeholder="Create a task..."
					value={inputValue}
					onChange={(e) => setInputValue(e.target.value)}
					onKeyDown={handleKeyDown}
				/>
				<button className="todo-add-btn" onClick={handleCreate}>
					<img src={plus_icon} alt="Add task icon" />
				</button>
			</div>

			<div className="todo-tasks">
				{incomplete.length == 0 && completed.length == 0 && (
					<div className="no-tasks">Nothing planned yet.</div>
				)}

				{incomplete.map((todo) => (
					<TodoItem
						key={todo.id}
						todo={todo}
						onToggle={handleToggle}
						onDelete={handleDelete}
					/>
				))}

				{completed.length > 0 && (
					<>
						<div className="todo-divider" />
						{completed.map((todo) => (
							<TodoItem
								key={todo.id}
								todo={todo}
								onToggle={handleToggle}
								onDelete={handleDelete}
							/>
						))}
					</>
				)}
			</div>
		</div>
	);
}

function TodoItem({ todo, onToggle, onDelete }) {
	return (
		<div className={`todo-task${todo.completed ? " completed" : ""}`}>
			<label className="todo-task-inner">
				<input
					type="checkbox"
					className="task-checkbox"
					checked={todo.completed}
					onChange={() => onToggle(todo)}
				/>
				<span className="custom-checkbox">
					{todo.completed && (
						<svg
							width="12"
							height="12"
							viewBox="0 0 12 12"
							fill="none"
						>
							<polyline
								points="2,6 5,9 10,3"
								stroke="white"
								strokeWidth="1.8"
								strokeLinecap="round"
								strokeLinejoin="round"
							/>
						</svg>
					)}
				</span>
				<span className="todo-task-text" title={todo.title}>
					{todo.title}
				</span>
			</label>
			<button
				className="delete-btn"
				onClick={() => onDelete(todo.id)}
				aria-label="Delete task"
			>
				<TrashIcon />
			</button>
		</div>
	);
}
