import { useRef, useEffect, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { getStations } from '../api/stations.js'

import marker_logo from '../assets/marker.svg'
// Writing this at the top outisde the function bc await only allowed here or in async - export default function Map() is NOT async, so writing here at the top
const arrayOfStations = await getStations();  // because ASYNC function getStations()

export default function Map() {
    const mapRef = useRef();
    const mapContainerRef = useRef();
 
    // This will be taken from Firebase when we have personal info about each user - including their last/current stop
    const userStartingPoint = { lng: 8.191225, lat: 46.015261};

    // Everything set up in useEffect only once when the map is first loaded
    useEffect(() => {
        mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_TOKEN;

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

        // Automatically plotting all the station markers on the map from the data we got from Firebase
        // Also adding their ids as their class names just in case
        arrayOfStations.forEach((station) => {
            let stationMarker = new mapboxgl.Marker().setLngLat([station['longitude'], station['latitude']]).addTo(mapRef.current);
            stationMarker.addClassName(station['id']); 
        });

        let markers = document.querySelectorAll(".mapboxgl-marker");
        // Setting custom svg for markers, handle the click of the station (NOT DONE YET) and how to move there
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

                // Get the marker's class
                console.log(markerClass);
                // Get the long and lat based on this class

                // Using the vector formula and USER'S long lat calculate the distance

                // Print to the console

                // Convert into some number of minutes

                // Based on the minutes set the speed for flyTo() below when clicked on the marker
                
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

    console.log(arrayOfStations);
    
    return (
        <div id = "map-wrap">
            <div ref={mapContainerRef} id = "map-container"></div>
        </div>
    )
}