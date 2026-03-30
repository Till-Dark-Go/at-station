import "mapbox-gl/dist/mapbox-gl.css";
import "../../assets/styles/map.css";
import exit from "../../assets/images/exit.svg";

import TopUI from "./TopUI.jsx";
import PopupWindow from "./PopupWindow.jsx";
import BottomUI from "./BottomUI.jsx";
import Stamps from "../Stamps Page/Stamps.jsx";
import Todo from "../ToDo/Todo.jsx";
import ProfilePage from "../Profile Page/ProfilePage.jsx";

import { useMap } from "../../assets/utils/map/useMap.js";

import { Activity, ViewTransition } from "react";
import FinishedTravellingMessage from "./FinishedTravellingMessage.jsx";

export default function Map() {
	const {
		mapContainerRef,
		UI_elements_div,
		loadingScreen,
		currentlyTravelling,
		currentlyPaused,
		popupOpenRef,
		popupWindow,
		isTodoOpen,
		stampsWindow,
		isProfileOpen,
		nextStation,
		travelTimeLabel,
		timeAndCoords,
		userStartingPoint,
		openPopup,
		closePopup,
		stopTravelling,
		togglePauseState,
		toggleStampsWindow,
		toggleProfilePageWindow,
		openTodoList,
		animateMapMovement,
		toggleFinalMessage,
		isFinalMessageOpen,
	} = useMap();
	return (
		<>
			{loadingScreen && (
				<div className="loading-screen">
					<div className="loader"></div>
				</div>
			)}

			<div id="map-wrap">
				<div ref={mapContainerRef} id="map-container"></div>
			</div>

			<div className="UI-elements" ref={UI_elements_div}>
				<div className="at-station-logo">@station</div>

				{currentlyTravelling.current && (
					<button
						className="feature-button end-travelling-button"
						onClick={openPopup}
					>
						<img src={exit} alt="End travelling icon" />
					</button>
				)}

				<TopUI
					currentlyTravelling={currentlyTravelling}
					userStartingPoint={userStartingPoint}
					nextStationName={nextStation.name}
				/>

				{/* {isTodoOpen &&
				<Activity mode = {isTodoOpen ? 'visible' : 'hidden'}>
					<ViewTransition enter="auto" exit="auto" default="none"> 
						<Todo />
					</ViewTransition> 
				</Activity>
				} */}

				{stampsWindow && <Stamps />}
				{isTodoOpen && <Todo />}
				{isProfileOpen && (
					<ProfilePage
						toggleProfilePageWindow={toggleProfilePageWindow}
					/>
				)}

				{isFinalMessageOpen && (
					<FinishedTravellingMessage
						toggleFinalMessage={toggleFinalMessage}
					/>
				)}

				{popupOpenRef.current && (
					<PopupWindow
						nextStation={nextStation}
						timeAndCoords={timeAndCoords}
						currentlyTravelling={currentlyTravelling}
						animateMovement={() =>
							animateMapMovement(
								timeAndCoords.nextLng,
								timeAndCoords.nextLat,
								timeAndCoords.hours * 60 +
									timeAndCoords.minutes,
								timeAndCoords.stationId,
							)
						}
						stopTravelling={stopTravelling}
						closePopup={() => closePopup(popupOpenRef)}
					/>
				)}
				<BottomUI
					travelTimeLabel={travelTimeLabel}
					currentlyTravelling={currentlyTravelling}
					currentlyPaused={currentlyPaused}
					nextStation={nextStation}
					togglePauseState={togglePauseState}
					toggleStampsWindow={toggleStampsWindow}
					openTodoList={openTodoList}
					timerDuration={
						timeAndCoords.hours * 60 + timeAndCoords.minutes
					}
					toggleProfilePageWindow={toggleProfilePageWindow}
				/>
			</div>
		</>
	);
}
