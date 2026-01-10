import Map from './components/Map'
import AuthPage from './components/AuthPage'
import GreetingScreen from './components/GreetingScreen'
import SignUp from './components/SignUp'
import LogIn from './components/LogIn'

import { createBrowserRouter, RouterProvider } from 'react-router-dom'

// createBrowserRouter defines a MAP of URLs to components -> which URL relates to which component
const router = createBrowserRouter([
  {path: '/', element: <Map />},
  {
    path: '/auth', 
    element: <AuthPage />,
    children: [  // Using NESTED routing
      {path: '', element: <GreetingScreen />},  // /auth shows greeting
      {path: 'sign-up', element: <SignUp />},  // /auth/sign-up
      {path: 'log-in', element: <LogIn />}     // /auth/log-in
    ]
  },
]);

// RouterProvider then checks the current browser's URL and uses our router map to get the correct component
export default function App() {
  return (
    <RouterProvider router = {router} />
  )
}

// HOW TO MANAGE ACTUAL SWITCHING BETWEEN PAGES: (google each of them to see the syntax)
// Use <Link> when you want a clickable element that goes somewhere -> look at GREETING SCREEN JSX for example
// Use useNavigate() when you need to redirect after some logic (like after login, form submission, etc.).