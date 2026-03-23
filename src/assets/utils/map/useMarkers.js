import { useEffect } from "react";
import mapboxgl from "mapbox-gl";
import marker_logo from "../../images/marker.svg";
import hovered_marker_logo from "../../images/hovered_marker.svg";
import user_marker_logo from "../../images/current_station_marker.svg";
import { calcStationParameters } from "./mapCalculations.js";
import { arrayOfStations } from "./useStations.js";

export function useMarkers({
	mapRef,
	markersRef,
	userStartingPoint,
	openPopup,
	popupOpenRef,
	currentlyTravelling,
	setNextStation,
	setTravelTimeLabel,
}) {
	useEffect(() => {
		if (!mapRef.current) return;

		arrayOfStations.forEach((station) => {
			let stationMarker = new mapboxgl.Marker()
				.setLngLat([station["longitude"], station["latitude"]])
				.addTo(mapRef.current);

			stationMarker.getElement().classList.add(station["id"]);

			// Store marker with its station data
			markersRef.current.push({
				marker: stationMarker,
				station: station,
			});
		});

		markersRef.current.forEach(({ marker, station }) => {
			const markerElement = marker.getElement();
			const isUserMarker =
				station.longitude == userStartingPoint.lng &&
				station.latitude == userStartingPoint.lat;

			// Remove old userMarker class from all
			markerElement.classList.remove("userMarker");

			// Clear previous event listeners and content
			markerElement.innerHTML = "<img>";
			const marker_img = markerElement.children[0];

			if (isUserMarker) {
				markerElement.classList.add("userMarker");
				marker_img.src = user_marker_logo;
			} else {
				marker_img.src = marker_logo;
				let hoverResults;

				marker_img.onmouseenter = () => {
					marker_img.src = hovered_marker_logo;
					setNextStation({
						name: station.id,
						country: station.country,
					});

					hoverResults = calcStationParameters(
						station,
						userStartingPoint,
					);
					if (hoverResults.hoursVar > 0) {
						setTravelTimeLabel(
							`Travel time: ${hoverResults.hoursVar} hr ${hoverResults.minutesVar} min`,
						);
					} else {
						setTravelTimeLabel(
							`Travel time: ${hoverResults.minutesVar} min`,
						);
					}
				};

				marker_img.onmouseleave = () => {
					if (!popupOpenRef.current) marker_img.src = marker_logo;
					if (!popupOpenRef.current) {
						setNextStation({ name: "at station", country: "" });
						setTravelTimeLabel("Awaiting travelling...");
						currentlyTravelling.current = false;
					}
				};

				marker_img.onclick = () => {
					marker_img.src = hovered_marker_logo;
					openPopup(
						hoverResults.hoursVar,
						hoverResults.minutesVar,
						hoverResults.nextLngVar,
						hoverResults.nextLatVar,
						station.id,
					);
					// console.log(popupWindow);
				};
			}
		});
	}, [userStartingPoint]);
}
