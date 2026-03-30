import { useEffect } from "react";
import { updateCurrentStation } from "../../../api/users.js";
import { createTravelEntry } from "../../../api/travel-log.js";
import { auth } from "../../../api/firebase";
import { calculateTravelTimeInMinutes } from "./mapCalculations.js";
import { arrayOfStations } from "./useStations.js";
import { updateStamp } from "../../../api/stamps.js";
import { Timestamp } from "firebase/firestore";

export function useTravel({
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
}) {
	const userId = auth.currentUser?.uid;

	const waitForEvent = (map, event) =>
		new Promise((resolve) => map.once(event, resolve)); // Helper function for animations - removes the nested loops by waiting for the previous event to finish and only then proceed to the next one

	useEffect(() => {
		if (!currentlyTravelling.current) {
			return;
		}

		function handleOnBeforeUnload(event) {
			event.preventDefault();
			return (event.returnValue = "");
		}
		window.addEventListener("beforeunload", handleOnBeforeUnload, {
			capture: true,
		});
		return () => {
			window.removeEventListener("beforeunload", handleOnBeforeUnload, {
				capture: true,
			});
		};
	}, [currentlyTravelling.current]);

	async function animateMapMovement(nextLng, nextLat, travelTime, stationId) {
		if (!currentlyPaused.current) {
			// We weren't UNPAUSING and calling this animation, we JUST STARTED it so fly back to the user point
			startTimeRef.current = Timestamp.fromMillis(Date.now());

			setPopupWindow((prev) => !prev);
			popupOpenRef.current = false;
			UI_elements_div.current.style.pointerEvents = "auto";
			currentlyTravelling.current = true;
			currentlyPaused.current = false;

			mapRef.current.flyTo({
				center: [userStartingPoint.lng, userStartingPoint.lat],
				zoom: 7,
				speed: 0.7,
				curve: 1,
				easing(t) {
					return t;
				},
			});
			await waitForEvent(mapRef.current, "moveend");
			if (!currentlyTravelling.current || currentlyPaused.current) return; // If NOT travelling or IS PAUSED - don't animate

			mapRef.current.setMaxZoom(11.8);
			mapRef.current.zoomTo(11.8, { duration: 3200 });
			await waitForEvent(mapRef.current, "zoomend");
			if (!currentlyTravelling.current || currentlyPaused.current) return;
		} else {
			// Otherwise, currentlyPaused was TRUE so change it to FALSE and start moving from the point we stopped on
			currentlyPaused.current = false;
		}

		// Displaying the train icon and the line between stations
		mapRef.current.setPaintProperty(
			"moving-marker-layer",
			"icon-opacity",
			1,
		);
		mapRef.current.setPaintProperty("route", "line-opacity", 1);

		// Starting the moving animation towards the new station
		mapRef.current.easeTo({
			center: [nextLng, nextLat],
			zoom: 11.8,
			// duration: 60000 * travelTime, // 1 minute = 60 000 ms and we set duration in ms
			duration: 10000,
			easing: (t) => t, // Linear animation - no slowdown at the end
		});

		// Displaing the train icon with new center coords everytime to make it move as we move
		mapRef.current.on("move", () => {
			const center = mapRef.current.getCenter();
			mapRef.current.getSource("moving-marker").setData({
				type: "Feature",
				geometry: {
					type: "Point",
					coordinates: [center.lng, center.lat],
				},
			});

			mapRef.current.getSource("route").setData({
				type: "Feature",
				geometry: {
					type: "LineString",
					coordinates: [
						[center.lng, center.lat],
						[nextLng, nextLat],
					],
				},
			});
		});

		await waitForEvent(mapRef.current, "moveend");
		if (!currentlyTravelling.current || currentlyPaused.current) return;

		// Hiding the train icon and the line between two stations
		mapRef.current.setPaintProperty(
			"moving-marker-layer",
			"icon-opacity",
			0,
		);
		mapRef.current.setPaintProperty("route", "line-opacity", 0);

		mapRef.current.zoomTo(7, { duration: 3200 });
		await waitForEvent(mapRef.current, "zoomend");
		if (!currentlyTravelling.current || currentlyPaused.current) return;

		if (currentlyTravelling.current || !currentlyPaused.current) {
			// Check this in case the user used stopTravelling() function but the code still reached this part - don't update any info if we interrupted the journey
			mapRef.current.setMaxZoom(7);
			setTimeAndCoords({
				hours: null,
				minutes: null,
				nextLng: null,
				nextLat: null,
				stationId: null,
			});
			UI_elements_div.current.style.pointerEvents = "none";
			currentlyTravelling.current = false;

			if (stationId) {
				try {
					// ADD starttime and endtime to database
					endTimeRef.current = Timestamp.fromMillis(Date.now());

					console.log("Destination:", stationId);
					console.log("Origin:", userStartingPoint.id);
					console.log("Start time:", startTimeRef.current);
					console.log("End time:", endTimeRef.current);

					toggleFinalMessage(
						stationId,
						userStartingPoint.id,
						startTimeRef.current,
						endTimeRef.current,
					);

					await createTravelEntry(
						userId,
						userStartingPoint.id,
						stationId,
						startTimeRef.current,
						endTimeRef.current,
					);
					// await zhopa(userId, stationId);
					await updateStamp(userId, stationId, endTimeRef.current);

					// update current station
					await updateCurrentStation(stationId).then(() => {
						console.log("Updated currentStationId: ", stationId);
					});

					// Update local state so app does not reset
					const station = arrayOfStations.find(
						(s) => s.id === stationId,
					);
					if (station) {
						setUserStartingPoint({
							lng: station.longitude,
							lat: station.latitude,
							name: station.name,
							id: station.id,
						});
					}
				} catch (err) {
					console.error("Failed to update currentStation:", err);
				}
			}
		}
	}

	async function stopTravelling() {
		setPopupWindow((prev) => !prev); // This re-render is triggered ONLY after the previous line
		popupOpenRef.current = false;
		currentlyTravelling.current = false;

		mapRef.current.zoomTo(7, {
			// Zooming back out
			duration: 5000,
		});
		await waitForEvent(mapRef.current, "moveend");

		mapRef.current.setMaxZoom(7);

		// Hiding the train icon and the line between two stations
		mapRef.current.setPaintProperty(
			"moving-marker-layer",
			"icon-opacity",
			0,
		);
		mapRef.current.setPaintProperty("route", "line-opacity", 0);

		UI_elements_div.current.style.pointerEvents = "none";
		setTimeAndCoords({
			hours: null,
			minutes: null,
			nextLng: null,
			nextLat: null,
			stationId: null,
		}); // Nothing new for the new coordinates, they stay empty until the user chooses the next destination
		setNextStation({ name: "at station", country: "" });
		setTravelTimeLabel("Awaiting travelling...");
	}

	function togglePauseState() {
		const pausePosition = {
			lng: mapRef.current.getCenter()[0],
			lat: mapRef.current.getCenter()[1],
		};

		// Calculate travel time left in minutes based on the CURRENT CENTER OF THE MAP (pausePosition) and the final coordinates
		const timeLeft = calculateTravelTimeInMinutes(
			mapRef.current.getCenter(),
			timeAndCoords.nextLng,
			timeAndCoords.nextLat,
		);

		if (!currentlyPaused.current) {
			// We clicked to PAUSE the animation
			mapRef.current.stop();
			currentlyPaused.current = true;
			setTravelTimeLabel("Session paused");
		} else {
			// If currentlyPaused is true, we clicked to UN-PAUSE the animation
			setTravelTimeLabel("Travelling..."); // Added only for re-rendering the code => updating the bottom UI
			animateMapMovement(
				timeAndCoords.nextLng,
				timeAndCoords.nextLat,
				timeLeft,
				timeAndCoords.stationId,
			);
		}
	}

	return { animateMapMovement, stopTravelling, togglePauseState };
}
