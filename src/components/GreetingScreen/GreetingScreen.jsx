import { Link } from "react-router-dom";
import "../../assets/styles/greetingscreen.css";

export default function GreetingScreen() {
	
	return (
		<div className="main-block">
			<div className="catch-phrase">
				Start your productivity session
			</div>
			<div className="title">
				<div className="gradient-text">
					There's a long road ahead. Keep going
				</div>
					Nothing is impossible if you find your own way
				</div>
			<div className="sub-title">
				Be productive when traveling on a train around Europe. Collect stamps from visited stations and count hours of focused sessions, bringing you closer to your goals.
			</div>

			{/* Wrapping our BUTTON into LINK and saying to which URL it will point when clicked - this way we simply load another page on the button press */}
			<Link to="/home/log-in" className="action-button">
				Start your journey
			</Link>
		</div>
	);
}
