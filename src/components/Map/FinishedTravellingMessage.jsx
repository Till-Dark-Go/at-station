import "../../assets/styles/map.css";

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
						<span className="label">To/From:</span>
						<span className="label">Time:</span>
						<span className="label">Date:</span>

						<span>
							Destination
							<br />
							Origin
						</span>
						<span>
							13:01
							<br />
							15:09
						</span>
						<span>15.02.2026</span>
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
