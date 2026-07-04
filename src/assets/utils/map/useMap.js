import { useRef, useState, useEffect, useMemo } from "react";
import { getCurrentStationId } from "../../../api/users.js";
import { arrayOfStations } from "./useStations.js";
import { useMapSetup } from "./useMapSetup.js";
import { useMarkers } from "./useMarkers.js";
import { usePopup } from "./usePopup.js";
import { useTravel } from "./useTravel.js";
import { getClosestStations } from "./mapCalculations.js";
import { useAuth } from "../../../firebase/AuthContext.jsx";

function getStationLabel(station) {
	return station?.name || station?.id || "";
}

export function useMap() {
	const { currentUser } = useAuth();
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
	const [isNearestStationsOpen, setIsNearestStationsOpen] = useState(false);

	const nearestStations = useMemo(
		() => getClosestStations(userStartingPoint, arrayOfStations, 5),
		[userStartingPoint],
	);

	// Load current station from database
	useEffect(() => {
		if (!currentUser) return;

		async function loadUserStation() {
			const stationId = await getCurrentStationId();
			if (!stationId) return;

			const station = arrayOfStations.find((s) => s.id === stationId);
			if (!station) return;

			setUserStartingPoint({
				lng: station.longitude,
				lat: station.latitude,
				name: getStationLabel(station),
				id: station.id,
			});
		}

		loadUserStation();
	}, [currentUser]);

	// Setting up the map:
	useMapSetup({
		mapRef,
		mapContainerRef,
		markersRef,
		userStartingPoint,
		setLoadingScreen,
	});

	// Two functions: open and close the station popup (the one before started travelling)
	const { openPopup: openTravelPopup, closePopup } = usePopup({
		currentlyTravelling,
		popupOpenRef,
		UI_elements_div,
		setPopupWindow,
		setTimeAndCoords,
		setStampsWindow,
		setIsTodoOpen,
	});

	function openPopup(
		hoursVar,
		minutesVar,
		nextLngVar,
		nextLatVar,
		stationId,
	) {
		setIsNearestStationsOpen(false);
		openTravelPopup(
			hoursVar,
			minutesVar,
			nextLngVar,
			nextLatVar,
			stationId,
		);
	}

	// Setting up the custom markers: their onClicks/onHovers, custom svg etc
	useMarkers({
		mapRef,
		markersRef,
		userStartingPoint,
		openPopup,
		openNearestStationsPopup,
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

	function openNearestStationsPopup() {
		if (currentlyTravelling.current || !userStartingPoint.id) return;

		setStampsWindow(false);
		setIsTodoOpen(false);
		setIsProfileOpen(false);
		setPopupWindow(false);
		popupOpenRef.current = false;
		setTimeAndCoords({
			hours: null,
			minutes: null,
			nextLng: null,
			nextLat: null,
			stationId: null,
		});
		setIsNearestStationsOpen(true);
		if (UI_elements_div.current) {
			UI_elements_div.current.style.pointerEvents = "auto";
		}
	}

	function closeNearestStationsPopup() {
		setIsNearestStationsOpen(false);
		if (!popupOpenRef.current && UI_elements_div.current) {
			UI_elements_div.current.style.pointerEvents = "none";
		}
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
		isNearestStationsOpen,
		nearestStations,
		openNearestStationsPopup,
		closeNearestStationsPopup,
	};
}
