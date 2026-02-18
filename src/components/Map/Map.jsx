import { useRef, useEffect, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { getStations } from "../../api/stations.js";
import "./map.css";

import marker_logo from "../../assets/images/marker.svg";
import hovered_marker_logo from "../../assets/images/hovered_marker.png";
import user_marker_logo from "../../assets/images/black_user_marker.svg";
import todo_list_logo from "../../assets/images/todo_list.svg";
import user_pf_logo from "../../assets/images/user_profile.svg";
import close_popup_button from "../../assets/images/authGoBackButton.svg";

import { calcStationParameters } from "../../assets/utils/mapFunctions.js";
import Todo from "../ToDo/Todo.jsx";

import { updateCurrentStation, getCurrentStationId } from '../../api/users.js';

import TopUI from './TopUI.jsx'
import PopupWindow from './PopupWindow.jsx'
import BottomUI from './BottomUI.jsx'

// Writing this at the top outisde the function bc await only allowed here or in async - export default function Map() is NOT async, so writing here at the top
const arrayOfStations = await getStations(); // because ASYNC function getStations()

export default function Map() {
  const mapRef = useRef();
  const mapContainerRef = useRef();

  // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! This will be taken from Firebase when we have personal info about each user - including their last/current stop
  const userStartingPoint = { lng: 8.541694, lat: 47.376888 }; // Zurich
  const userStationName = "Zurich";

  const [nextStation, setNextStation] = useState({
    name: "at station",
    country: "",
  });
  const [travelTimeLabel, setTravelTimeLabel] = useState(
    "Awaiting travelling...",
  );
  const [confirmTravelPopup, setConfirmTravelPopup] = useState(false);
  const popupOpenRef = useRef(false);

  const [isOpenTodo, setIsOpenTodo] = useState(false);

  const [timeAndCoords, setTimeAndCoords] = useState({
    hours: null,
    minutes: null,
    nextLng: null,
    nextLat: null,
  }); // These need to be kept between renders => use useState for this
  const UI_elements_div = useRef(null); // For the UI elements container to make it pointer-events: auto when the pop up is opened (so that we can't move the map)

  // Everything set up in useEffect only ONCE when the map is first loaded
  useEffect(() => {
    mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/ulvenrev/cmiisp64o00na01qtg8i24fpe",
      center: [userStartingPoint.lng, userStartingPoint.lat], // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!! CHANGE THIS TO INFO FROM DB
      zoom: 7,
      minZoom: 5,
      maxZoom: 7,
    });

    // Automatically plotting all the station markers on the map from the data we got from Firebase
    arrayOfStations.forEach((station) => {
      // DOES NOT return the HTML div, arrayOfStations is an ARRAY with objects (db entries) inside
      let stationMarker = new mapboxgl.Marker()
        .setLngLat([station["longitude"], station["latitude"]])
        .addTo(mapRef.current);
      let stationID = station["id"];
      stationMarker.addClassName(stationID);

      if (
        station["longitude"] == userStartingPoint.lng &&
        station["latitude"] == userStartingPoint.lat
      ) {
        stationMarker.addClassName("userMarker");
      }
    });

    let markers = document.querySelectorAll(".mapboxgl-marker"); // Getting all the marker divs

    markers.forEach((marker) => {
      let markerIDClass =
        marker.className.split(" ")[marker.className.split(" ").length - 1];

      // Setting custom marker svg
      marker.innerHTML = "<img>";
      let marker_img = marker.children[0];

      if (markerIDClass == "userMarker") {
        marker_img.src = user_marker_logo;
      } else {
        marker_img.src = marker_logo;
        let hoverResults;

        marker_img.onmouseenter = () => {
          // Enter marker -> get coordinates and travel time to it
          marker_img.src = hovered_marker_logo;

          let station = arrayOfStations.find(
            (item) => item.id == markerIDClass,
          );
          setNextStation({ name: markerIDClass, country: station.country });

          hoverResults = calcStationParameters(station, userStartingPoint);
          if (hoverResults.hoursVar > 0) {
            setTravelTimeLabel(
              `Travel time: ${hoverResults.hoursVar} hr ${hoverResults.minutesVar} min`,
            );
          } else {
            setTravelTimeLabel(`Travel time: ${hoverResults.minutesVar} min`);
          }
        };

        marker_img.onmouseleave = () => {
          // Leave marker -> reset button's name and travel time on the bottom UI
          marker_img.src = marker_logo;
          if (!popupOpenRef.current) {
            // Means we haven't clicked the marker yet, so we didn't record the new time and coords => we haven't opened the pop up window => we just keep looking at the stations and don't need to save the name yet
            setNextStation({ name: "at station", country: "" });
            setTravelTimeLabel("Awaiting travelling...");
          }
        };

        marker_img.onclick = () => {
          // Click on marker -> open confirmation pop up window

          openPopup(
            hoverResults.hoursVar,
            hoverResults.minutesVar,
            hoverResults.nextLngVar,
            hoverResults.nextLatVar,
          );
        };
      }
    });

    return () => {
      mapRef.current.remove();
    };
  }, []); // Empty dep array [] - useEffect run once when the map is first instantiated

  function openPopup(hoursVar, minutesVar, nextLngVar, nextLatVar) {
    // Marker onClick function
    setTimeAndCoords({
      hours: hoursVar,
      minutes: minutesVar,
      nextLng: nextLngVar,
      nextLat: nextLatVar,
    }); // Setting new values -> causes a re-render
    setConfirmTravelPopup((prev) => !prev); // This re-render is triggered ONLY after the previous line
    popupOpenRef.current = true;
    UI_elements_div.current.style.pointerEvents = "auto";
  }

  function closePopup(popupOpenRef) {
    setTimeAndCoords({
      hours: null,
      minutes: null,
      nextLng: null,
      nextLat: null,
    });
    setConfirmTravelPopup((prev) => !prev);
    popupOpenRef.current = false;
    UI_elements_div.current.style.pointerEvents = "none";
  }

  function animateMapMovement(nextLng, nextLat, travelTime) {
    setConfirmTravelPopup((prev) => !prev);
    popupOpenRef.current = false;
    UI_elements_div.current.style.pointerEvents = "auto";

    // FLying back to the USER POINT and starting from there
    mapRef.current.flyTo({
      center: [userStartingPoint.lng, userStartingPoint.lat], // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! Change to info from the database
      zoom: 7,
      speed: 0.2,
      curve: 1,
      easing(t) {
        return t;
      },
    });

    mapRef.current.once("moveend", () => {
      // .once('moveend') is used to track when the PREV animation ENDED - then we start a new one, otherwise it will be jumpy
      // Zooming in
      mapRef.current.setMaxZoom(15);
      mapRef.current.zoomTo(15, {
        duration: 10000,
      });

      mapRef.current.once("zoomend", () => {
        // Animation continues
        mapRef.current.once("moveend", () => {
          mapRef.current.easeTo({
            center: [nextLng, nextLat],
            zoom: 15,
            duration: 60000 * travelTime, // 1 minute = 60 000 ms and we set duration in ms
          });

          // Changing zoom back to normal
          mapRef.current.once("moveend", () => {
            mapRef.current.zoomTo(7, {
              duration: 10000,
            });
            mapRef.current.once("moveend", () => {
              mapRef.current.setMaxZoom(7);
              setTimeAndCoords({
                hours: null,
                minutes: null,
                nextLng: null,
                nextLat: null,
              });
              UI_elements_div.current.style.pointerEvents = "none";
            });
          });
        });
      });
    });
  }

  return (
    <>
      <div id="map-wrap">
        <div ref={mapContainerRef} id="map-container"></div>
      </div>

      {/* All UI components displayed "on top" of the map - the TODO LIST AS WELL */}
      <div className="UI-elements" ref={UI_elements_div}>
        <div className="top-curr-station-name">
          <div className="lable">Current station is</div>
          <div className="station-name">{userStationName}</div>
          <div className="line"></div>
        </div>
        {confirmTravelPopup && (
          <div className="confrim-travel-popup">
            <button
              className="popup-close-button"
              onClick={() => closePopup(popupOpenRef)}
            >
              <img src={close_popup_button} alt="Close popup button" />
            </button>
            <div className="travel-info">
              <div className="info">
                <div className="next-station-lable">Your next station is</div>
                <div className="next-station-name">{nextStation.name}</div>
                {timeAndCoords.hours > 0 && (
                  <div className="travel-time">
                    The road will take{" "}
                    <strong>
                      {timeAndCoords.hours} hr {timeAndCoords.minutes} min
                    </strong>
                  </div>
                )}
                {timeAndCoords.hours == 0 && (
                  <div className="travel-time">
                    The road will take{" "}
                    <strong>{timeAndCoords.minutes} min</strong>
                  </div>
                )}
                <div className="station-description">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed
                  do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                </div>
                <div className="country">Country: {nextStation.country}</div>
              </div>
              <div className="button">
                <button
                  className="confirm-travel-button"
                  onClick={() =>
                    animateMapMovement(
                      timeAndCoords.nextLng,
                      timeAndCoords.nextLat,
                      timeAndCoords.hours * 60 + timeAndCoords.minutes,
                    )
                  }
                >
                  CONFIRM
                </button>
              </div>
            </div>
          </div>
        )}
        <div className="bottom-UI">
          <div className="travel-time-bar">{travelTimeLabel}</div>
          <div className="buttons">
            <button className="todo-list-button">
              <img src={todo_list_logo} alt="Todo list page logo" />
            </button>
            <button className="at-station-button">{nextStation.name}</button>
            <button className="profile-button">
              <img src={user_pf_logo} alt="User profile page logo" />
            </button>
          </div>
        </div>
      </div>
      <Todo />
    </>
  );
}
