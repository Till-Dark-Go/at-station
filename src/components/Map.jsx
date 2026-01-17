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
        mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

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
        arrayOfStations.forEach((station) => {  // This DOES NOT return the HTML div - this is why I do the query selector for markers separately below
            let stationMarker = new mapboxgl.Marker().setLngLat([station['longitude'], station['latitude']]).addTo(mapRef.current);
            let stationID = station['id'];
            stationMarker.addClassName(stationID);
        });

        let markers = document.querySelectorAll(".mapboxgl-marker");
        // Setting custom svg for markers, handle the click of the station (NOT DONE YET) and how to move there
        // This one DOES RETURN THE HTML DIV - which is why I can set up the img and do onclick, it knows what HTML element to click on
        markers.forEach((marker) => {
            let markerIDClass = marker.className.split(' ')[marker.className.split(' ').length - 1];
        
            // Setting custom marker svg
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
                // Get the marker's class
                console.log(markerIDClass);

                // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
                // Here should be a check if (markerIDClass != userCurrentIDStationPosition) { do everything that's below }
                // This is needed so that we don't go through the whole animation and calculation if we clicked on the same station where we're standing
                // Just show in the console that you're already standing on this station so click on something else
                // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

                // Get the long and lat based on this class
                let nextLng, nextLat;
                arrayOfStations.forEach((station) => {
                    if (station['id'] == markerIDClass) {
                        console.log(station);
                        nextLng = station['longitude'];
                        nextLat = station['latitude'];
                    }
                });

                // Using the vector formula and USER'S long lat calculate the distance
                let userLng = userStartingPoint.lng;
                let userLat = userStartingPoint.lat;
                console.log(userLng, userLat, nextLng, nextLat);
                let distance = haversine(userLng, userLat, nextLng, nextLat);  // haversine() - customer function at the bottom of the code

                // Print to the console
                console.log(distance);

                // Convert into some number of minutes
                let travelTime = Math.floor(distance * 0.2);  // * by 0.2 cuz we assume the train is going in a straight line at 300-350 kmph => 160 km will take about 30 minutes
                console.log(travelTime + ' minutes');

                // Based on the minutes set the speed for flyTo() below when clicked on the marker


                // FLying back to the USER POINT and starting from there
                mapRef.current.flyTo({
                    center: [userLng, userLat], 
                    zoom: 7,
                    speed: 0.2,
                    curve: 1,
                    easing(t) {
                        return t;
                    }
                });

                mapRef.current.once('moveend', () => {  // .once('moveend') is used to track when the PREV animation ENDED - then we start a new one, otherwise it will be jumpy
                    // Setting zoom and changing the style to the colorful one
                    mapRef.current.setMaxZoom(15);
                    mapRef.current.zoomTo(15, {
                        duration: 10000
                    });
                    mapRef.current.once('zoomend', () => {
                        mapRef.current.setStyle("mapbox://styles/ulvenrev/cmik0ioyv003001sbcqbl2wi9");

                        mapRef.current.once('moveend', () => {
                            mapRef.current.easeTo({
                                center: [nextLng, nextLat],
                                zoom: 15,
                                duration: 60000*travelTime  // 1 minute = 60 000 ms and we set duration in ms
                            });

                            // Changing the zoom back to normal
                            mapRef.current.once('moveend', () => {
                                mapRef.current.zoomTo(7, {
                                    duration: 10000
                                });
                                mapRef.current.once('moveend', () => {     
                                    mapRef.current.setMaxZoom(7);
                                    mapRef.current.setStyle("mapbox://styles/ulvenrev/cmiisp64o00na01qtg8i24fpe");
                                });
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
        <>
        <div id = "map-wrap">
            <div ref={mapContainerRef} id = "map-container"></div>
        </div>

        {/* All UI components displayed "on top" of the map - the TODO LIST AS WELL */}
        <div className='UI-elements'>
                <button
                    className='todo-list-button'
                >Open TODO</button>
        </div>
        </>
    )
}

// This calculates the distance between two points considering MEDIANS - since this is a real world map, we can't just use the Euclidean distance formula
function haversine(lng1, lat1, lng2, lat2){
    // Converting to radians
    lng1 = lng1 * Math.PI / 180;
    lng2 = lng2 * Math.PI / 180;
    lat1 = lat1 * Math.PI / 180;
    lat2 = lat2 * Math.PI / 180;

    // Haversine formula itself - we won't care about how it works too much, it's just math
    const dlon = lng2 - lng1; 
    const dlat = lat2 - lat1;
    const a = Math.sin(dlat/2)**2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dlon/2)**2;
    const c = 2 * Math.asin(Math.sqrt(a));

    // Earth's radius in km
    const r = 6371;

    return c * r;  // Distance between two points in km
}
