import { db } from "./firebase";
import {
	collection,
	addDoc,
	getDocs,
	updateDoc,
	deleteDoc,
	doc,
	serverTimestamp,
} from "firebase/firestore";

//get the todos subcollection reference for a given user
const getTodosRef = (userId) => collection(db, "users", userId, "todos");

//add a new todo
export const createTodo = async (userId, title) => {
	const todosRef = getTodosRef(userId);
	const docRef = await addDoc(todosRef, {
		title,
		completed: false,
		createdAt: serverTimestamp(),
	});
	return docRef.id;
};

//fetch the todos
export const getTodos = async (userId) => {
	const todosRef = getTodosRef(userId);
	const snapshot = await getDocs(todosRef);
	return snapshot.docs.map((doc) => ({
		id: doc.id,
		...doc.data(),
	}));
};

//update title or completed status
export const updateTodo = async (userId, todoId, updates) => {
	const todoRef = doc(db, "users", userId, "todos", todoId);
	await updateDoc(todoRef, updates);
};

//remove a todo
export const deleteTodo = async (userId, todoId) => {
	const todoRef = doc(db, "users", userId, "todos", todoId);
	await deleteDoc(todoRef);
};
