import { Outlet } from 'react-router-dom'  // Outlet is used for the NESTED routing we use in App.jsx

export default function AuthPage() {
  return (
    <div className = 'authMainPage'>
        <div className = 'topBar'>
            <div className = 'logo'>@station</div>
        </div>
        <Outlet />  {/* This is where EITHER GreetingScreen or SignUp or LogIn will appear because we use NESTED routing*/}
        <div className = 'lightRaysPNG'></div>
    </div>
  )
}