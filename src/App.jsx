import Map from "./components/Map/Map";
import AuthPage from "./components/AuthPage/AuthPage";
import RouteGuard from "./firebase/RouteGuard";
import GreetingScreen from "./components/GreetingScreen/GreetingScreen";
import SignUp from "./components/AccountManagement/SignUp";
import LogIn from "./components/AccountManagement/LogIn";

import { createBrowserRouter, RouterProvider } from "react-router-dom";

const router = createBrowserRouter([
	{
		path: "/",
		element: (
			// private route require logged user so: if logged in render map, if not redirect to /home
			<RouteGuard requireAuth={true}>
				<Map />
			</RouteGuard>
		),
	},
	{
		path: "/home",
		element: (
			// public route doesn't require logged user so: If already logged in, navigate to map (/) blocking access to /home page, if not access authentication pages in nested routing
			<RouteGuard requireAuth={false}>
				<AuthPage />
			</RouteGuard>
		),
		children: [
			// Using NESTED routing
			{ path: "", element: <GreetingScreen /> }, // /home shows greeting
			{ path: "sign-up", element: <SignUp /> }, // /home/sign-up
			{ path: "log-in", element: <LogIn /> }, // /home/log-in
		],
	},
]);

// RouterProvider then checks the current browser's URL and uses our router map to get the correct component
export default function App() {
	return <RouterProvider router={router} />;
}

// HOW TO MANAGE ACTUAL SWITCHING BETWEEN PAGES: (google each of them to see the syntax)
// Use <Link> when you want a clickable element that goes somewhere -> look at GREETING SCREEN JSX for example
// Use useNavigate() when you need to redirect after some logic (like after login, form submission, etc.).
