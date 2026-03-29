import { useRef, useState, useEffect } from "react";
import { getCurrentStationId } from "../../../api/users.js";
import { arrayOfStations } from "./useStations.js";
import { useMapSetup } from "./useMapSetup.js";
import { useMarkers } from "./useMarkers.js";
import { usePopup } from "./usePopup.js";
import { useTravel } from "./useTravel.js";
import { useFinalMessagePopup } from "./useFinalMessagePopup.js";

// Writing this at the top outisde the function bc await only allowed here or in async - export default function Map() is NOT async, so writing here at the top

export function useMap() {
	const mapRef = useRef();
	const mapContainerRef = useRef();
	const markersRef = useRef([]);
	const UI_elements_div = useRef(null); // For the UI elements container to make it pointer-events: auto when the pop up is opened (so that we can't move the map)

	const currentlyTravelling = useRef(false);
	const currentlyPaused = useRef(false);
	const popupOpenRef = useRef(false);
	const startTimeRef = useRef(null);
	const endTimeRef = useRef(null); // For recording into the database

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
	}); // These need to be kept between renders => use useState for this

	const [popupWindow, setPopupWindow] = useState(false);
	const [isTodoOpen, setIsTodoOpen] = useState(false);
	const [loadingScreen, setLoadingScreen] = useState(true);
	const [stampsWindow, setStampsWindow] = useState(false);
	const [isProfileOpen, setIsProfileOpen] = useState(false);
	const [isFinalMessageOpen, setIsFinalMessageOpen] = useState(false);

	// Load current station from database
	useEffect(() => {
		async function loadUserStation() {
			const stationId = await getCurrentStationId();
			if (!stationId) return;

			const station = arrayOfStations.find((s) => s.id === stationId);
			if (!station) return;

			setUserStartingPoint({
				lng: station.longitude,
				lat: station.latitude,
				name: station.name,
				id: station.id,
			});
		}

		loadUserStation();
	}, []);

	useMapSetup({
		mapRef,
		mapContainerRef,
		markersRef,
		userStartingPoint,
		setLoadingScreen,
	});

	const { openPopup, closePopup } = usePopup({
		currentlyTravelling,
		popupOpenRef,
		UI_elements_div,
		setPopupWindow,
		setTimeAndCoords,
		setStampsWindow,
		setIsTodoOpen,
	});

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
		UI_elements_div.current.style.pointerEvents = isProfileOpen
			? "none"
			: "auto";
	}

	function toggleFinalMessage() {
		setStampsWindow(false);
		setIsTodoOpen(false);
		setIsProfileOpen(false);
		closePopup(popupOpenRef);
		setIsFinalMessageOpen((prev) => !prev);
		UI_elements_div.current.style.pointerEvents = isFinalMessageOpen
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
