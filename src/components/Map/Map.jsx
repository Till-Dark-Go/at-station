import { useRef, useEffect, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { getStations } from '../../api/stations.js'
import './map.css'

import marker_logo from '../../assets/images/marker.svg'
import hovered_marker_logo from '../../assets/images/hovered_marker.png'
import user_marker_logo from '../../assets/images/black_user_marker.svg'
import train_icon from '../../assets/images/train_icon.png'
import exit from '../../assets/images/exit.svg'

import { calcStationParameters, calculateTravelTimeInMinutes } from '../../assets/utils/mapFunctions.js'

import { updateCurrentStation, getCurrentStationId } from '../../api/users.js';

import TopUI from './TopUI.jsx'
import PopupWindow from './PopupWindow.jsx'
import BottomUI from './BottomUI.jsx'

// Writing this at the top outisde the function bc await only allowed here or in async - export default function Map() is NOT async, so writing here at the top
const arrayOfStations = await getStations();  // because ASYNC function getStations()

export default function Map() {
    const mapRef = useRef();
    const mapContainerRef = useRef();

    const train_icon_div = useRef();
 
    const [userStartingPoint, setUserStartingPoint] = useState({lng: null, lat: null, name: null});

    const [nextStation, setNextStation] = useState({name: 'at station', country: ''});
    const [travelTimeLabel, setTravelTimeLabel] = useState('Awaiting travelling...');
    const [popupWindow, setPopupWindow] = useState(false);
    
    const popupOpenRef = useRef(false);

    const currentlyTravelling = useRef(false);
    const currentlyPaused = useRef(false);
    const waitForEvent = (map, event) => new Promise(resolve => map.once(event, resolve));  // Helper function for animations - removes the nested loops by waiting for the previous event to finish and only then proceed to the next one

    const [timeAndCoords, setTimeAndCoords] = useState({hours: null, minutes: null, nextLng: null, nextLat: null, stationId: null});  // These need to be kept between renders => use useState for this
    const UI_elements_div = useRef(null);  // For the UI elements container to make it pointer-events: auto when the pop up is opened (so that we can't move the map)

    const markersRef = useRef([]);

    useEffect(() => {
        if (!currentlyTravelling.current) {
            return;
        };

        function handleOnBeforeUnload(event) {
            event.preventDefault();
            return (event.returnValue = '');
        }
        window.addEventListener('beforeunload', handleOnBeforeUnload, { capture: true });
        return () => {
            window.removeEventListener('beforeunload', handleOnBeforeUnload, { capture: true });
        }
    }, [currentlyTravelling.current]);

    // Load current station
    useEffect(() => {
        async function loadUserStation() {
            const stationId = await getCurrentStationId();
            if (!stationId) return;

            const station = arrayOfStations.find(s => s.id === stationId);
            if (!station) return;

            setUserStartingPoint({
                lng: station.longitude,
                lat: station.latitude,
                name: station.name
            });
        }

        loadUserStation();
    }, []);

    useEffect(() => {
        
        if (mapRef.current || userStartingPoint.lng == null) return;
        
        mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

        mapRef.current = new mapboxgl.Map({
            container: mapContainerRef.current,
            style: "mapbox://styles/ulven-rev/cml9m8wbr007001sj277u888r",
            center: [userStartingPoint.lng, userStartingPoint.lat],
            zoom: 7,
            minZoom: 5,
            maxZoom: 7,
            pitchWithRotate: false  // Do disable the tilting ability
        });

        // Create markers once
        arrayOfStations.forEach((station) => {
            let stationMarker = new mapboxgl.Marker()
                .setLngLat([station['longitude'], station['latitude']])
                .addTo(mapRef.current);
            
            stationMarker.getElement().classList.add(station['id']);
            
            // Store marker with its station data
            markersRef.current.push({
                marker: stationMarker,
                station: station
            });
        });

        return () => {   // This runs when the dependency array changes
            // Clean up markers
            markersRef.current.forEach(({ marker }) => marker.remove());
            markersRef.current = [];
        };
    }, [userStartingPoint]);

    useEffect(() => {
        arrayOfStations.forEach((station) => {
            let stationMarker = new mapboxgl.Marker()
                .setLngLat([station['longitude'], station['latitude']])
                .addTo(mapRef.current);
            
            stationMarker.getElement().classList.add(station['id']);
            
            // Store marker with its station data
            markersRef.current.push({
                marker: stationMarker,
                station: station
            });
        });

        markersRef.current.forEach(({ marker, station }) => {
            const markerElement = marker.getElement();
            const isUserMarker = station.longitude == userStartingPoint.lng && 
                                station.latitude == userStartingPoint.lat;

            // Remove old userMarker class from all
            markerElement.classList.remove('userMarker');
            
            // Clear previous event listeners and content
            markerElement.innerHTML = "<img>";
            const marker_img = markerElement.children[0];

            if (isUserMarker) {
                markerElement.classList.add('userMarker');
                marker_img.src = user_marker_logo;
            } else {
                marker_img.src = marker_logo;
                let hoverResults;

                marker_img.onmouseenter = () => {
                    marker_img.src = hovered_marker_logo;
                    setNextStation({name: station.id, country: station.country});

                    hoverResults = calcStationParameters(station, userStartingPoint);
                    if (hoverResults.hoursVar > 0) {
                        setTravelTimeLabel(`Travel time: ${hoverResults.hoursVar} hr ${hoverResults.minutesVar} min`);
                    } else {
                        setTravelTimeLabel(`Travel time: ${hoverResults.minutesVar} min`);
                    }
                };

                marker_img.onmouseleave = () => {
                    marker_img.src = marker_logo;
                    if (!popupOpenRef.current) {
                        setNextStation({name: 'at station', country: ''});
                        setTravelTimeLabel('Awaiting travelling...');
                        currentlyTravelling = false;
                    }
                };

                marker_img.onclick = () => {
                    openPopup(hoverResults.hoursVar, hoverResults.minutesVar, 
                            hoverResults.nextLngVar, hoverResults.nextLatVar, station.id);
                };
            }
        });
    }, [userStartingPoint]);

    function openPopup(hoursVar, minutesVar, nextLngVar, nextLatVar, stationId) {
        if (!currentlyTravelling.current) {  // Not currently travelling => open a confirmation window to travel somewhere
            setTimeAndCoords({hours: hoursVar, minutes: minutesVar, nextLng: nextLngVar, nextLat: nextLatVar, stationId: stationId});  // Setting new values -> causes a re-render
        }  // If we're opening the "exit travelling" window, we don't need any values calculated for it, so just open the pop-up

        setPopupWindow(prev => !prev);
        popupOpenRef.current = true;
        UI_elements_div.current.style.pointerEvents = 'auto';
    }

    function closePopup(popupOpenRef) {
        if (!currentlyTravelling.current) {
            setTimeAndCoords({hours: null, minutes: null, nextLng: null, nextLat: null, stationId: null});
        }

        setPopupWindow(prev => !prev);
        popupOpenRef.current = false;
        UI_elements_div.current.style.pointerEvents = 'none';
    }

    async function animateMapMovement(nextLng, nextLat, travelTime, stationId) {
        if (!currentlyPaused.current) {  // We weren't UNPAUSING and calling this animation, we JUST STARTED it so fly back to the user point
            setPopupWindow(prev => !prev);
            popupOpenRef.current = false;
            UI_elements_div.current.style.pointerEvents = 'auto';
            currentlyTravelling.current = true;
            currentlyPaused.current = false;

            mapRef.current.flyTo({
                center: [userStartingPoint.lng, userStartingPoint.lat], 
                zoom: 7,
                speed: 0.7,
                curve: 1,
                easing(t) {
                    return t;
                }
            });
            await waitForEvent(mapRef.current, 'moveend');
            if (!currentlyTravelling.current || currentlyPaused.current) return;  // If NOT travelling or IS PAUSED - don't animate

            mapRef.current.setMaxZoom(11.8);
            mapRef.current.zoomTo(11.8, { duration: 3200 });
            await waitForEvent(mapRef.current, 'zoomend');
            if (!currentlyTravelling.current || currentlyPaused.current) return;
        } else {  // Otherwise, currentlyPaused was TRUE so change it to FALSE and start moving from the point we stopped on
            currentlyPaused.current = false;
        }

        train_icon_div.current.style.opacity = '1';
        mapRef.current.easeTo({
            center: [nextLng, nextLat],
            zoom: 11.8,
            duration: 60000*travelTime, // 1 minute = 60 000 ms and we set duration in ms
            // duration: 20000,
            easing: (t) => t  // Linear animation - no slowdown at the end
        });
        await waitForEvent(mapRef.current, 'moveend');
        if (!currentlyTravelling.current || currentlyPaused.current) return;

        train_icon_div.current.style.opacity = '0';
        mapRef.current.zoomTo(7, { duration: 3200 });
        await waitForEvent(mapRef.current, 'zoomend');
        if (!currentlyTravelling.current || currentlyPaused.current) return;

        if (currentlyTravelling.current || !currentlyPaused.current) {  // Check this in case the user used stopTravelling() function but the code still reached this part - don't update any info if we interrupted the journey 
            mapRef.current.setMaxZoom(7);
            setTimeAndCoords({hours: null, minutes: null, nextLng: null, nextLat: null, stationId: null});
            UI_elements_div.current.style.pointerEvents = 'none';
            currentlyTravelling.current = false;

            if (stationId) {
                try {
                    // update current station
                    await updateCurrentStation(stationId);
                    console.log("Updated currentStationId: ", stationId);

                    // Update local state so app does not reset
                    const station = arrayOfStations.find(s => s.id === stationId);
                    if (station) {
                        setUserStartingPoint({
                            lng: station.longitude,
                            lat: station.latitude,
                            name: station.name
                        });
                    }

                } catch (err) {
                    console.error("Failed to update currentStation:", err);
                }
            }
        } 
    }

    async function stopTravelling() {
        setPopupWindow(prev => !prev);  // This re-render is triggered ONLY after the previous line
        popupOpenRef.current = false;
        currentlyTravelling.current = false;

        mapRef.current.zoomTo(7, {  // Zooming back out
            duration: 5000
        });
        await waitForEvent(mapRef.current, 'moveend');

        mapRef.current.setMaxZoom(7);
        train_icon_div.current.style.opacity = '0';
        UI_elements_div.current.style.pointerEvents = 'none';
        setTimeAndCoords({hours: null, minutes: null, nextLng: null, nextLat: null, stationId: null});  // Nothing new for the new coordinates, they stay empty until the user chooses the next destination
        setNextStation({name: 'at station', country: ''});
        setTravelTimeLabel('Awaiting travelling...');
    }

    function togglePauseState() {
        const pausePosition = {lng: mapRef.current.getCenter()[0], lat: mapRef.current.getCenter()[1]};

        // Calculate travel time left in minutes based on the CURRENT CENTER OF THE MAP (pausePosition) and the final coordinates
        const timeLeft = calculateTravelTimeInMinutes(mapRef.current.getCenter(), timeAndCoords.nextLng, timeAndCoords.nextLat);

        if (!currentlyPaused.current) {  // We clicked to PAUSE the animation
            mapRef.current.stop();
            currentlyPaused.current = true;
            setTravelTimeLabel('Session paused');
        } else {  // If currentlyPaused is true, we clicked to UN-PAUSE the animation
            setTravelTimeLabel('Travelling...');  // Added only for re-rendering the code => updating the bottom UI 
            animateMapMovement(timeAndCoords.nextLng, timeAndCoords.nextLat, timeLeft, timeAndCoords.stationId);
        }
    }
    
    return (
        <>
        <div id = "map-wrap">
            <div ref={mapContainerRef} id = "map-container"></div>
        </div>

        {/* All UI components displayed "on top" of the map - the TODO LIST AS WELL */}
        <div className='UI-elements' ref={UI_elements_div}>
            <div className='at-station-logo'>@station</div>
            {currentlyTravelling.current && 
            <button className='end-travelling-button'
                onClick = {openPopup}>
                <img src={exit} alt="End travelling icon" />
            </button>}
            <div className='train-icon' ref={train_icon_div}><img src={train_icon} alt="Train icon" /></div>
            <TopUI 
                currentlyTravelling = {currentlyTravelling}
                userStartingPoint = {userStartingPoint}
            />
            {popupOpenRef.current && 
            <PopupWindow 
                nextStation = {nextStation}
                timeAndCoords = {timeAndCoords}
                currentlyTravelling = {currentlyTravelling}
                popupOpenRef = {popupOpenRef}
                animateMovement = {() => 
                            animateMapMovement(timeAndCoords.nextLng, timeAndCoords.nextLat, timeAndCoords.hours*60+timeAndCoords.minutes, timeAndCoords.stationId)}
                stopTravelling = {stopTravelling}
                closePopup = {() => closePopup(popupOpenRef)}
            />}
            <BottomUI 
                travelTimeLabel = {travelTimeLabel}
                currentlyTravelling = {currentlyTravelling}
                currentlyPaused = {currentlyPaused}
                nextStation = {nextStation}
                togglePauseState = {togglePauseState}
                timerDuration = {timeAndCoords.hours*60+timeAndCoords.minutes}
            />
        </div>
        </>
    )
}