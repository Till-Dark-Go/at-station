// src/components/Map.jsx
import React, { useRef, useEffect, useState } from 'react';
import * as maptilersdk from '@maptiler/sdk';
import "@maptiler/sdk/dist/maptiler-sdk.css";

import station_logo from '../assets/station_logo.svg';
import user_icon from '../assets/user_icon.svg';

import { getStations } from '../api/stations';

export default function Map() {
  const [stations, setStations] = useState([]); // Stores stations from Firestore

  const userStartingPoint = { lng: 8.191225, lat: 46.015261 }; // Initial user location

  const mapContainer = useRef(null); // Map DOM container
  const map = useRef(null);          // Map instance
  const zoom = 6;

  // Set MapTiler API key from .env
  maptilersdk.config.apiKey = import.meta.env.VITE_MAPTILER_API_KEY;

  // Fetch stations from Firestore ONCE
  useEffect(() => {
    getStations()
      .then(data => setStations(data))
      .catch(err => console.error("Error fetching stations:", err));
  }, []);

  // Initialize map and add markers
  useEffect(() => {
    // Only initialize once, wait until stations are loaded
    if (map.current || stations.length === 0) return;

    // Create the map
    map.current = new maptilersdk.Map({
      container: mapContainer.current,
      style: `https://api.maptiler.com/maps/019949c6-6b4d-7933-b72b-105fa9983748/style.json?key=${import.meta.env.VITE_MAPTILER_API_KEY}`,
      center: [userStartingPoint.lng, userStartingPoint.lat],
      zoom: zoom,
      minZoom: 5,
      maxZoom: 6.5,
    });

    // Add user marker
    const userMarker = new maptilersdk.Marker()
      .setLngLat(userStartingPoint)
      .addTo(map.current);

    // Replace default marker with custom user icon
    const userEl = userMarker.getElement();
    userEl.innerHTML = `<img src="${user_icon}" width="30" height="30" />`;
    userMarker.addClassName("userPoint");

    // Add station markers dynamically
    stations.forEach(station => {
      // Use flat fields
      const lat = station.latitude;
      const lng = station.longitude;

      const marker = new maptilersdk.Marker()
        .setLngLat([lng, lat])
        .addTo(map.current);

      // Use the Firestore document ID for unique identification
      // note: station.id comes from getStations() { id: doc.id, ... }
      marker.addClassName(station.id || station.stationId || station.name);

      // Replace default marker with station_logo
      const markerEl = marker.getElement();
      markerEl.innerHTML = `<img src="${station_logo}" width="28" height="28" alt="${station.name}" />`;

      // Click behavior: move map and user marker
      markerEl.onclick = () => {
        console.log(`Selected station: ${station.name}`);

        // Fly map to selected station
        map.current.flyTo({
          center: [lng, lat],
          zoom: zoom,
          speed: 0.04,
          curve: 1.5,
        });

        // Move user marker to station
        userMarker.setLngLat([lng, lat]);

        // Scale selected station icon using CSS class
        document.querySelectorAll(".maplibregl-marker img").forEach(img => {
          img.classList.remove("selected"); // Remove "selected" from all markers
        });
        const img = markerEl.querySelector("img");
        if (img) img.classList.add("selected"); // Add "selected" to clicked marker
      };
    });

  }, [stations]);

  return (
    <div className="map-wrap">
      <div ref={mapContainer} className="map" style={{ width: "100%", height: "100vh" }}></div>
    </div>
  );
}
