import { useRef, useEffect, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { getStations } from '../../api/stations.js'
import './map.css'

import marker_logo from '../../assets/images/marker.svg'
import hovered_marker_logo from '../../assets/images/hovered_marker.png'
import user_marker_logo from '../../assets/images/black_user_marker.svg'
import todo_list_logo from '../../assets/images/todo_list.svg'
import user_pf_logo from '../../assets/images/user_profile.svg'
import close_popup_button from '../../assets/images/authGoBackButton.svg'

import { calcStationParameters } from '../../assets/utils/mapFunctions.js'

import { updateCurrentStation, getCurrentStationId } from '../../api/users.js';

// Writing this at the top outisde the function bc await only allowed here or in async - export default function Map() is NOT async, so writing here at the top
const arrayOfStations = await getStations();  // because ASYNC function getStations()

export default function Map() {
    const mapRef = useRef();
    const mapContainerRef = useRef();
 
    const [userStartingPoint, setUserStartingPoint] = useState({lng: null, lat: null, name: null});

    const [nextStation, setNextStation] = useState({name: 'at station', country: ''});
    const [travelTimeLabel, setTravelTimeLabel] = useState('Awaiting travelling...');
    const [confirmTravelPopup, setConfirmTravelPopup] = useState(false);
    const popupOpenRef = useRef(false);
    const [timeAndCoords, setTimeAndCoords] = useState({hours: null, minutes: null, nextLng: null, nextLat: null, stationId: null});  // These need to be kept between renders => use useState for this
    const UI_elements_div = useRef(null);  // For the UI elements container to make it pointer-events: auto when the pop up is opened (so that we can't move the map)

    const markersRef = useRef([]);

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
            style: "mapbox://styles/ulvenrev/cmiisp64o00na01qtg8i24fpe",
            center: [userStartingPoint.lng, userStartingPoint.lat],
            zoom: 7,
            minZoom: 5,
            maxZoom: 7
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
                    }
                };

                marker_img.onclick = () => {
                    openPopup(hoverResults.hoursVar, hoverResults.minutesVar, 
                            hoverResults.nextLngVar, hoverResults.nextLatVar, station.id);
                };
            }
        });
    }, [userStartingPoint]);

    function openPopup(hoursVar, minutesVar, nextLngVar, nextLatVar, stationId) {  // Marker onClick function
        setTimeAndCoords({hours: hoursVar, minutes: minutesVar, nextLng: nextLngVar, nextLat: nextLatVar, stationId: stationId});  // Setting new values -> causes a re-render
        setConfirmTravelPopup(prev => !prev);  // This re-render is triggered ONLY after the previous line
        popupOpenRef.current = true;
        UI_elements_div.current.style.pointerEvents = 'auto';
    }

    function closePopup(popupOpenRef) {
        setTimeAndCoords({hours: null, minutes: null, nextLng: null, nextLat: null, stationId: null});
        setConfirmTravelPopup(prev => !prev);
        popupOpenRef.current = false;
        UI_elements_div.current.style.pointerEvents = 'none';
    }

    async function animateMapMovement(nextLng, nextLat, travelTime, stationId) {
        setConfirmTravelPopup(prev => !prev);
        popupOpenRef.current = false;
        UI_elements_div.current.style.pointerEvents = 'auto';

        // FLying back to the USER POINT and starting from there
        mapRef.current.flyTo({
            center: [userStartingPoint.lng, userStartingPoint.lat],  // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! Change to info from the database
            zoom: 7,
            speed: 0.2,
            curve: 1,
            easing(t) {
                return t;
            }
        });

        mapRef.current.once('moveend', () => {  // .once('moveend') is used to track when the PREV animation ENDED - then we start a new one, otherwise it will be jumpy
            // Zooming in 
            mapRef.current.setMaxZoom(15);
            mapRef.current.zoomTo(15, {
                duration: 10000
            });

            mapRef.current.once('zoomend', () => {  // Animation continues
                mapRef.current.once('moveend', () => {
                    mapRef.current.easeTo({
                        center: [nextLng, nextLat],
                        zoom: 15,
                        //duration: 60000*travelTime // 1 minute = 60 000 ms and we set duration in ms
                        duration: 5000
                    });

                    // Changing zoom back to normal
                    mapRef.current.once('moveend', () => {
                        mapRef.current.zoomTo(7, {
                            duration: 10000
                        });
                        mapRef.current.once('moveend', async () => {     
                            mapRef.current.setMaxZoom(7);
                            setTimeAndCoords({hours: null, minutes: null, nextLng: null, nextLat: null, stationId: null});
                            UI_elements_div.current.style.pointerEvents = 'none';

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
                        });
                    });
                });
            });
        });
    }
    
    return (
        <>
        <div id = "map-wrap">
            <div ref={mapContainerRef} id = "map-container"></div>
        </div>

        {/* All UI components displayed "on top" of the map - the TODO LIST AS WELL */}
        <div className='UI-elements' ref={UI_elements_div}>
            <div className='top-curr-station-name'>
                <div className='lable'>Current station is</div>
                <div className='station-name'>{userStartingPoint.name}</div>
                <div className='line'></div>
            </div>
            {confirmTravelPopup && 
            <div className='confrim-travel-popup'>
                <button className='popup-close-button' onClick={() => closePopup(popupOpenRef)}><img src={close_popup_button} alt="Close popup button" /></button>
                <div className='travel-info'>
                    <div className='info'>
                        <div className='next-station-lable'>Your next station is</div>
                        <div className='next-station-name'>{nextStation.name}</div>
                        {timeAndCoords.hours > 0 && <div className='travel-time'>The road will take <strong>{timeAndCoords.hours} hr {timeAndCoords.minutes} min</strong></div>}
                        {timeAndCoords.hours == 0 && <div className='travel-time'>The road will take <strong>{timeAndCoords.minutes} min</strong></div>}
                        <div className='station-description'>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</div>
                        <div className='country'>Country: {nextStation.country}</div>
                    </div>
                    <div className='button'>
                        <button className='confirm-travel-button' 
                            onClick={() => 
                                animateMapMovement(timeAndCoords.nextLng, timeAndCoords.nextLat, timeAndCoords.hours*60+timeAndCoords.minutes, timeAndCoords.stationId)}
                        >CONFIRM</button>
                    </div>
                </div>
            </div>}
            <div className='bottom-UI'>
                <div className='travel-time-bar'>{travelTimeLabel}</div>
                <div className='buttons'>
                    <button
                    className='todo-list-button'
                    ><img src={todo_list_logo} alt="Todo list page logo" /></button>
                    <button className='at-station-button'>
                        {nextStation.name}
                    </button>
                    <button
                        className='profile-button'
                    ><img src={user_pf_logo} alt="User profile page logo" /></button>
                </div>
            </div>
        </div>
        </>
    )
}