import { useEffect } from "react";
import mapboxgl from "mapbox-gl";
import train_icon from "../../images/train_icon.png";
import { arrayOfStations } from "./useStations.js";

export function useMapSetup({
	mapRef,
	mapContainerRef,
	markersRef,
	userStartingPoint,
	setLoadingScreen,
}) {
	useEffect(() => {
		if (mapRef.current || userStartingPoint.lng == null) return;

		// Set up the map
		mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

		mapRef.current = new mapboxgl.Map({
			container: mapContainerRef.current,
			style: "mapbox://styles/ulven-rev/cml9m8wbr007001sj277u888r",
			center: [userStartingPoint.lng, userStartingPoint.lat],
			zoom: 7,
			minZoom: 5,
			maxZoom: 7,
			pitchWithRotate: false, // To disable the tilting ability
		});

		// This fires up after all the tiles of the map were fully loaded - then we remove the loading "screen"
		mapRef.current.on("idle", () => {
			setLoadingScreen(false);
		});

		// Create markers once
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

		mapRef.current.on("load", () => {
			mapRef.current.loadImage(train_icon, (error, image) => {
				if (error) throw error;

				// Pre-setting the line between two stations, will just change the opacity when needed to show it
				mapRef.current.addSource("route", {
					type: "geojson",
					data: {
						type: "Feature",
						properties: {},
						geometry: {
							type: "LineString",
							coordinates: [],
						},
					},
				});

				mapRef.current.addLayer({
					id: "route",
					type: "line",
					source: "route",
					layout: {
						"line-join": "round",
						"line-cap": "round",
					},
					paint: {
						"line-color": "#fff",
						"line-width": 3,
						"line-emissive-strength": 1,
						"line-opacity": 0,
						"line-opacity-transition": { duration: 1000, delay: 0 },
					},
				});

				mapRef.current.addImage("moving-icon", image);

				// Train marker which goes as a separate layer to ensure it's on the right coordinates as it's moving
				mapRef.current.addSource("moving-marker", {
					type: "geojson",
					data: {
						type: "Feature",
						geometry: {
							type: "Point",
							coordinates: [
								userStartingPoint.lng,
								userStartingPoint.lat,
							],
						},
					},
				});

				mapRef.current.addLayer({
					id: "moving-marker-layer",
					type: "symbol",
					source: "moving-marker",
					layout: {
						"icon-image": "moving-icon",
						"icon-size": 0.4,
						"icon-allow-overlap": true,
					},
					paint: {
						"icon-opacity": 0,
						"icon-opacity-transition": { duration: 1000, delay: 0 },
					},
				});
			});
		});

		return () => {
			// This runs when the dependency array changes
			// Clean up markers
			markersRef.current.forEach(({ marker }) => marker.remove());
			markersRef.current = [];
		};
	}, [userStartingPoint]);
}
