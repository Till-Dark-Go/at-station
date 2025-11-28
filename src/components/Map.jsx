import { useRef, useEffect, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

export default function Map() {
    const mapRef = useRef();
    const mapContainerRef = useRef();
 
    const userStartingPoint = { lng: 8.191225, lat: 46.015261};
    const zurich = [8, 47];

    // Everything set up in useEffect only once when the map is first loaded
    useEffect(() => {
        mapboxgl.accessToken = 'pk.eyJ1IjoidWx2ZW5yZXYiLCJhIjoiY21paXNkdmhjMHNsZjNkczhndTB2cm1qdCJ9.ifCHVq0mhLsOdWQiMiGr2g';

        mapRef.current = new mapboxgl.Map({
            container: mapContainerRef.current,
            style: "mapbox://styles/ulvenrev/cmiisp64o00na01qtg8i24fpe",
            center: [userStartingPoint.lng, userStartingPoint.lat],
            zoom: 6.3,
            minZoom: 5,
            maxZoom: 7
        });

        // Plots the markers
        // You can add div into .Marker() to have a wrapper around the marker - come back to the docs
        let marker = new mapboxgl.Marker().setLngLat([userStartingPoint.lng, userStartingPoint.lat]).addTo(mapRef.current);
        marker.addClassName('userMarker');  // Adds the LAST class in the string for this marker
        marker = new mapboxgl.Marker().setLngLat(zurich).addTo(mapRef.current);
        marker.addClassName('stationMarker');

        let markers = document.querySelectorAll(".mapboxgl-marker");
        markers.forEach((marker) => {
            let markerClass = marker.className.split(' ')[marker.className.split(' ').length - 1];
            
            marker.onmouseenter = () => {  // When we hover over the marker instead of clicking it
                console.log(markerClass);  // it prints the name of the marker, i.e. the last class we added manually above
            }

        })
        
        return () => {
            mapRef.current.remove();
        }
    }, [])  // Empty dep array [] - useEffect run once when the map is first instantiated

    return (
        <div id = "map-wrap">
            <div ref={mapContainerRef} id = "map-container"></div>
        </div>
    )
}