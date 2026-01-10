import { Link } from 'react-router-dom'  // Using <Link> and NOT useNavigate() because for the AuthPage we simply need to switch the page to sign up on the BUTTON CLICK
// We are NOT using the server's result to know that we need to go to the next page - this is suitable for going to Map after logging in successfully 
// and this will use useNavigate()

export default function GreetingScreen() {
    return (
        <div className = 'greetingText'>
            <div className = 'catchPhrase'>Nothing is impossible if you find your own way.</div>
            <div className = 'mainTitle'>
                <div className = 'gradientText'>There's a long road ahead. Keep going.</div>
                Keep reaching your goals.
            </div>
            <div className = 'subTitle'>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</div>

            {/* Wrapping our BUTTON into LINK and saying to which URL it will point when clicked - this way we simply load another page on the button press */}
            <Link to = '/auth/sign-up' className='authButton'>
                Start your journey
            </Link>
        </div>
    )
}