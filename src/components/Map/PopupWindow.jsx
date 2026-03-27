import close_popup_button from "../../assets/images/cross_button.svg";
import { useRef, useEffect } from "react";
import { setStationImage } from "../../api/image-grabber";

function NextStationInfo({ nextStation, timeAndCoords, imageRef }) {
	return (
		<div className="info">
			<div className="small-lable">Your next station is</div>
			<div className="main-lable">{nextStation.name}</div>
			<div className="travel-time">
				The road will take{" "}
				<strong>
					{timeAndCoords.hours > 0
						? `${timeAndCoords.hours} hr ${timeAndCoords.minutes} min`
						: `${timeAndCoords.minutes} min`}
				</strong>
			</div>
			<div className="description-picture">
				<img alt="Station picture" ref={imageRef} />
			</div>
			<div className="country">Country: {nextStation.country}</div>
		</div>
	);
}

function StopTravellingInfo() {
	return (
		<div className="info">
			<div className="small-lable">
				You are about to end your journey!
			</div>
			<div className="main-lable progress-lost">
				Your progress will be lost
			</div>
			{/* <div className='travel-time'>You have __:__ of the road left to get to your destination</div> */}
			<div className="description">
				By clicking the button below, the travelling time will reset and
				you will be back at your starting station. Are you sure you want
				to proceed?
			</div>
		</div>
	);
}

export default function PopupWindow(props) {
	//   console.log(props.nextStation.name);

	const imageRef = useRef();

	useEffect(() => {
		setStationImage(props.nextStation.name, imageRef);
	}, [props.nextStation.name]);

	return (
		<div className="popup-window">
			<button className="popup-close-button" onClick={props.closePopup}>
				<img src={close_popup_button} alt="Close popup button" />
			</button>
			<div className="window-info">
				{!props.currentlyTravelling.current && (
					<NextStationInfo
						nextStation={props.nextStation}
						timeAndCoords={props.timeAndCoords}
						imageRef={imageRef}
					/>
				)}
				{props.currentlyTravelling.current && <StopTravellingInfo />}

				{!props.currentlyTravelling.current && (
					<button
						className="feature-button confirmation-button"
						onClick={props.animateMovement}
					>
						CONFIRM
					</button>
				)}

				{props.currentlyTravelling.current && (
					<button
						className="feature-button confirmation-button stop-travelling-button"
						onClick={props.stopTravelling}
					>
						STOP TRAVELLING
					</button>
				)}
			</div>
		</div>
	);
}
