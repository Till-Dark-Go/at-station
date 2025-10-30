import React, { useRef, useEffect, useState } from 'react'
import * as maptilersdk from '@maptiler/sdk'
import "@maptiler/sdk/dist/maptiler-sdk.css"

import station_logo from '../assets/station_logo.svg'
import user_icon from '../assets/user_icon.svg'

export default function Map() {
    const markers = {
        "Bern": [7.44744, 46.94809],
        "Zurih": [8.53918, 47.36864], 
        "Geneve": [6.143158, 46.204391],
        "Munich": [11.576124, 48.137154],
        "Spiez": [8.191225, 46.015261]
    }
    const userStartingPoint = { lng: 8.191225, lat: 46.015261};  // RETRIEVE THIS FROM THE JSON (?) FILE or from somewhere where the actual user location is stored - this will help keeping the user marker on a new posisiton every time they move and reload the page
    const mapContainer = useRef(null);
    const map = useRef(null);
    const zoom = 6;  // Max - 6.5, min - 5
    maptilersdk.config.apiKey = "u3NZICfBzGqtW8x9C022";

    // Not using useState bc map is a side effect rather than a variable to store (and interacts with DOM)
    useEffect(() => {
        if (map.current) return;  // So basically this function is called ONLY ONCE when you first load the page

        // Rerender of the MAP does NOT happen here - this is only the initial "drawing" of the map, the rendering is done with JS inside the maptiler logic
        map.current = new maptilersdk.Map({
            container: mapContainer.current,
            style: "https://api.maptiler.com/maps/019949c6-6b4d-7933-b72b-105fa9983748/style.json?key=u3NZICfBzGqtW8x9C022",
            center: [userStartingPoint.lng, userStartingPoint.lat],
            zoom: zoom,
            minZoom: 5,
            maxZoom: 6.5
        });

        const userMarker = new maptilersdk.Marker({color: "blue"})
            .setLngLat(userStartingPoint)
            .addTo(map.current)
        userMarker.addClassName("userPoint");  // Doing this separately and not in a chain, because apparently .addClassName will not return "this" at the end of the chain so I'll get an undefined in my userMarker variable

        Object.entries(markers).forEach(([name, coords]) => {
            let marker = new maptilersdk.Marker({color: "#FF0000"})
                .setLngLat(coords)
                .addTo(map.current)
            marker.addClassName(name)  // Instead of IDs?..
        });

        let markersDivs = document.querySelectorAll(".maplibregl-marker");
        markersDivs.forEach((markerDiv) => {
            let markerClass = markerDiv.className.split(' ')[markerDiv.className.split(' ').length - 1]
            markerDiv.innerHTML = "<img>";
            if (markerClass != "userPoint") {
                console.log(markerClass, markers[markerClass]);
                
                markerDiv.children[0].src = station_logo;
            } else {
                markerDiv.children[0].src = user_icon;
            }

            markerDiv.onclick = () => {
                const newCoords = markers[markerClass];
                map.current.flyTo({
                    center: newCoords,
                    zoom: zoom,
                    speed: 0.04,   // Depending on how much time we're gonna set for the travel, we will change THE SPEED OF HOW THE MAP IS MOVING - this will create a feeling the train is moving slower
                    curve: 1.5
                });
                userMarker.setLngLat(newCoords);
            };
        });

    }, []);  // No dependencies here because we will render the map only once anyway - the moving of it afterwards is handled by Maptiler

    return (
        <div className = "map-wrap">
            <div ref={mapContainer} className = "map"></div>
        </div>
    )
}