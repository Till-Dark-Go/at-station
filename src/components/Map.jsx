import React, { useRef, useEffect, useState } from 'react'
import * as maptilersdk from '@maptiler/sdk'
import "@maptiler/sdk/dist/maptiler-sdk.css"

export default function Map() {
    const [markers, setMarkers] = useState({});
    const mapContainer = useRef(null);
    const map = useRef(null);
    const switzerland = { lng: 8.2275, lat: 46.8182 };
    const zoom = 6;
    maptilersdk.config.apiKey = "u3NZICfBzGqtW8x9C022";

    // Not using useState bc map is a side effect rather than a variable to store (and interacts with DOM)
    useEffect(() => {
        if (map.current) return;

        map.current = new maptilersdk.Map({
            container: mapContainer.current,
            style: "https://api.maptiler.com/maps/019949c6-6b4d-7933-b72b-105fa9983748/style.json?key=u3NZICfBzGqtW8x9C022",
            center: [switzerland.lng, switzerland.lat],  // CHANGE TO USER'S POSITION
            zoom: zoom
        });

        new maptilersdk.Marker({color: "#FF0000"})
            .setLngLat([7.44744, 46.94809])
            .addTo(map.current)

        new maptilersdk.Marker({color: "#FF0000"})
            .setLngLat([8.53918, 47.36864])
            .addTo(map.current)

        setMarkers(prev => ({
            ...prev,
            "Bern": [7.44744, 46.94809],
            "Zurih": [8.53918, 47.36864]
        }));

    }, [switzerland.lng, switzerland.lat, zoom]);  // If any of these change (we move the map), useEffect will rerender the map so we see it in the new position

    useEffect(() => {
        console.log(markers);
    }, [markers]);

    return (
        <div className = "map-wrap">
            <div ref={mapContainer} className = "map"></div>
        </div>
    )
}