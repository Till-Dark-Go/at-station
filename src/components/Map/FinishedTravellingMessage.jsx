import "../../assets/styles/map.css";

function formatLocation(location) {
	return location
		.split("-")
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(" ");
}

function formatTime(seconds) {
	const date = new Date(seconds * 1000);
	const hours = date.getHours().toString().padStart(2, "0");
	const minutes = date.getMinutes().toString().padStart(2, "0");
	return `${hours}:${minutes}`;
}

function formatDate(seconds) {
	const date = new Date(seconds * 1000);
	const day = date.getDate().toString().padStart(2, "0");
	const month = (date.getMonth() + 1).toString().padStart(2, "0");
	const year = date.getFullYear();
	return `${day}/${month}/${year}`;
}

export default function FinishedTravellingMessage(props) {
	return (
		<div className="popup-window fade-in">
			<div className="window-info">
				<div className="info">
					<div className="small-lable">
						The train comes to a halt...
					</div>
					<div className="main-lable">You've arrived @ station</div>
					<div className="description">
						Nice work focusing on your tasks.
						<br />
						Your route was the following:
					</div>
					<div className="entry-info final-message-entry">
						<span className="label">From/To:</span>
						<span className="label">Time:</span>
						<span className="label">Date:</span>

						<span
							title={
								formatLocation(props.origin) +
								" - " +
								formatLocation(props.dest)
							}
						>
							{formatLocation(props.origin)}
							<br />
							{formatLocation(props.dest)}
						</span>
						<span>
							{formatTime(props.timeStart.seconds)}
							<br />
							{formatTime(props.timeEnd.seconds)}
						</span>
						<span title={formatDate(props.timeStart.seconds)}>
							{formatDate(props.timeStart.seconds)}
						</span>
					</div>
					<div className="description">
						It's now added to your travel log.
						<br />
						Keep travelling!
					</div>
				</div>

				<button
					className="feature-button confirmation-button"
					onClick={props.toggleFinalMessage}
				>
					CONFIRM
				</button>
			</div>
		</div>
	);
}
