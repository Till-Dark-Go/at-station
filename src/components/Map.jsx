import { useRef, useEffect, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

import marker_logo from '../assets/marker.svg'

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
            zoom: 7,
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
            
            // CUSTOM MARKER SVG
            marker.innerHTML = "<img>";
            marker.children[0].src = marker_logo;
            
            // HOVERING 
            marker.onmouseenter = () => { 
                // Do something here that will pass the NAME of the station to the button below 
                // If clicked - then proceed to the confirmation window and then to movement
                // But when simply hovered over, we pass the info to the button and that's it
                // The expansion and glowing is done in css
            }

            // MOVING TO THE STATION
            marker.onclick = () => {
                mapRef.current.flyTo({
                    center: [8.191225, 46.015261],  // FLying back to the USER POINT and starting from there
                    zoom: 7,
                    speed: 0.2,
                    curve: 1,
                    easing(t) {
                        return t;
                    }
                });

                mapRef.current.once('moveend', () => {  // .once('moveend') is used to track when the PREV animation ENDED - then we start a new one, otherwise it will be jumpy
                    // Setting zoom and changing the style to the colorful one
                    mapRef.current.setMaxZoom(9);
                    mapRef.current.zoomTo(9, {
                        duration: 2000
                    });
                    // mapRef.current.setStyle("mapbox://styles/ulvenrev/cmik0ioyv003001sbcqbl2wi9");

                    // Moving
                    mapRef.current.once('moveend', () => {
                        console.log("ZOOMED");
                        if (markerClass == "userMarker")
                        {
                            mapRef.current.flyTo({
                                center: [8.191225, 46.015261],
                                zoom: 9,
                                speed: 0.2,
                                curve: 1,
                                easing(t) {
                                    return t;
                                }
                            });
                        } else {
                            mapRef.current.flyTo({
                                center: [8, 47],
                                zoom: 9,
                                speed: 0.2,
                                curve: 1,
                                easing(t) {
                                    return t;
                                }
                            });
                        }

                        // Changing the zoom back to normal
                        mapRef.current.once('moveend', () => {
                            mapRef.current.zoomTo(7, {
                                duration: 2000
                            });
                            mapRef.current.once('moveend', () => {     
                                mapRef.current.setMaxZoom(7);
                            });
                        });
                    });
                });
            };
        });
        
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