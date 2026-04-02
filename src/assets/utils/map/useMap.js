import { useRef, useState, useEffect } from "react";
import { getCurrentStationId } from "../../../api/users.js";
import { arrayOfStations } from "./useStations.js";
import { useMapSetup } from "./useMapSetup.js";
import { useMarkers } from "./useMarkers.js";
import { usePopup } from "./usePopup.js";
import { useTravel } from "./useTravel.js";

export function useMap() {
	const mapRef = useRef();
	const mapContainerRef = useRef();
	const markersRef = useRef([]);
	const UI_elements_div = useRef(null); // For the UI elements container to make it pointer-events: auto when the pop up is opened (so that we can't move the map)

	const currentlyTravelling = useRef(false);
	const currentlyPaused = useRef(false);
	const popupOpenRef = useRef(false);
	const startTimeRef = useRef(null);
	const endTimeRef = useRef(null);

	// useState for all the values that we need to keep between renders
	const [userStartingPoint, setUserStartingPoint] = useState({
		lng: null,
		lat: null,
		name: null,
		id: null,
	});

	const [nextStation, setNextStation] = useState({
		name: "at station",
		country: "",
	});
	const [travelTimeLabel, setTravelTimeLabel] = useState(
		"Awaiting travelling...",
	);
	const [timeAndCoords, setTimeAndCoords] = useState({
		hours: null,
		minutes: null,
		nextLng: null,
		nextLat: null,
		stationId: null,
	});

	// All the popups and their useStates:
	const [popupWindow, setPopupWindow] = useState(false);
	const [isTodoOpen, setIsTodoOpen] = useState(false);
	const [loadingScreen, setLoadingScreen] = useState(true);
	const [stampsWindow, setStampsWindow] = useState(false);
	const [isProfileOpen, setIsProfileOpen] = useState(false);
	const [isFinalMessageOpen, setIsFinalMessageOpen] = useState({
		state: false,
		dest: null,
		origin: null,
		timeStart: null,
		timeEnd: null,
	});

	// Load current station from database
	useEffect(() => {
		async function loadUserStation() {
			const stationId = await getCurrentStationId();
			if (!stationId) return;

			const station = arrayOfStations.find((s) => s.id === stationId); // Searching by the id
			if (!station) return;

			// Resetting the useState of the user => triggers a rerender of the Map component and shows the updates instantly
			setUserStartingPoint({
				lng: station.longitude,
				lat: station.latitude,
				name: station.name,
				id: station.id,
			});
		}

		loadUserStation();
	}, []);

	// Setting up the map:
	useMapSetup({
		mapRef,
		mapContainerRef,
		markersRef,
		userStartingPoint,
		setLoadingScreen,
	});

	// Two functions: open and close the station popup (the one before started travelling)
	const { openPopup, closePopup } = usePopup({
		currentlyTravelling,
		popupOpenRef,
		UI_elements_div,
		setPopupWindow,
		setTimeAndCoords,
		setStampsWindow,
		setIsTodoOpen,
	});

	// Setting up the custom markers: their onClicks/onHovers, custom svg etc
	useMarkers({
		mapRef,
		markersRef,
		userStartingPoint,
		openPopup,
		popupOpenRef,
		currentlyTravelling,
		setNextStation,
		setTravelTimeLabel,
	});

	// Map movement animation, pausing and exiting travelling logic
	const { animateMapMovement, stopTravelling, togglePauseState } = useTravel({
		mapRef,
		userStartingPoint,
		setUserStartingPoint,
		UI_elements_div,
		popupOpenRef,
		currentlyTravelling,
		currentlyPaused,
		startTimeRef,
		endTimeRef,
		timeAndCoords,
		setTimeAndCoords,
		setPopupWindow,
		setNextStation,
		setTravelTimeLabel,
		toggleFinalMessage,
	});

	// Functions to toggle popup windows:
	function openTodoList() {
		setStampsWindow(false);
		setIsTodoOpen((prev) => !prev);
	}

	function toggleStampsWindow() {
		setIsTodoOpen(false);
		setStampsWindow((prev) => !prev);
	}

	function toggleProfilePageWindow() {
		setStampsWindow(false);
		setIsTodoOpen(false);
		setIsProfileOpen((prev) => !prev);
		UI_elements_div.current.style.pointerEvents = isProfileOpen.current
			? "none"
			: "auto";
	}

	function toggleFinalMessage(
		dest = null,
		origin = null,
		timeStart = null,
		timeEnd = null,
	) {
		if (!isFinalMessageOpen.state) {
			setStampsWindow(false);
			setIsTodoOpen(false);
			setIsProfileOpen(false);
			closePopup(popupOpenRef);
			setIsFinalMessageOpen({
				state: true,
				dest: dest,
				origin: origin,
				timeStart: timeStart,
				timeEnd: timeEnd,
			});
		} else {
			setIsFinalMessageOpen({
				state: false,
				dest: null,
				origin: null,
				timeStart: null,
				timeEnd: null,
			});
		}
		UI_elements_div.current.style.pointerEvents = isFinalMessageOpen.state
			? "none"
			: "auto";
	}

	return {
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
	};
}
