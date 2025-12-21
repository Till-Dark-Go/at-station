import { useRef } from 'react';

export default function AuthPage()
{

    // Getting a reference to each INPUT tag and BUTTON tag
    let signInEmail = useRef(null);  // Using useRef and NOT querySelector bc the actual DOM element hasn't been created yet 
    let signInPass = useRef(null);
    let signInButton = useRef(null);  // Not sure if this is needed, bc the function in binded right on the button TAG with onClick function as shown below, so we don't need to store the button ref in a separate variable

    let logInEmail = useRef(null);
    let logInPass = useRef(null);
    let logInButton = useRef(null);

    let googleButton = useRef(null);
    let githubButton = useRef(null);

    const consoleLogDetails = (operation, emailField, passwordField) =>
    {
        // emailField is the INPUT reference we send into the function
        // By doing input.value we can get the value typed into the field by the user - this is what we will record into our database
        console.log(operation, emailField.current.value, passwordField.current.value);
    }


    // And now in here we use ref = {variable from above} on the needed tags to actually place them into a reference
    return (
        <div className = 'authPage'>
            <div className = 'signIn'>
                <input type='email' className = 'signInEmail' ref={signInEmail}/>  
                <input type='password' className = 'signInPassword' ref={signInPass}/>
                <button className = 'signInButton' 
                    onClick={() => consoleLogDetails("Sign In Operation: ", signInEmail, signInPass)}
                    ref = {signInButton}>
                        Sign In
                </button>
            </div>
            <div className = 'logIn'>
                <input type='email' className = 'logInEmail' ref={logInEmail}/>
                <input type='password' className = 'logInPassword' ref={logInPass}/>
                <button className = 'logInButton'
                    onClick={() => consoleLogDetails("Log In Operation: ", logInEmail, logInPass)}
                    ref = {logInButton}>
                        Log In
                </button>
            </div>
            <div className = 'otherServices'>
                <button className = 'googleLogIn' ref={googleButton}>Log In with Google</button>
                <button className = 'githubLogIn' ref={githubButton}>Log In with Github</button>
            </div>
        </div>
    )
}