export function usePopup({
	currentlyTravelling,
	popupOpenRef,
	UI_elements_div,
	setPopupWindow,
	setTimeAndCoords,
	setStampsWindow,
	setIsTodoOpen,
}) {
	function openPopup(
		hoursVar,
		minutesVar,
		nextLngVar,
		nextLatVar,
		stationId,
	) {
		if (!currentlyTravelling.current) {
			// Not currently travelling => open a confirmation window to travel somewhere
			setTimeAndCoords({
				hours: hoursVar,
				minutes: minutesVar,
				nextLng: nextLngVar,
				nextLat: nextLatVar,
				stationId: stationId,
			}); // Setting new values -> causes a re-render
		} // If we're opening the "exit travelling" window, we don't need any values calculated for it, so just open the pop-up

		setIsTodoOpen(false);
		setStampsWindow(false);
		setPopupWindow(true);
		popupOpenRef.current = true;
		UI_elements_div.current.style.pointerEvents = "auto";
	}

	function closePopup(popupOpenRef) {
		if (!currentlyTravelling.current) {
			setTimeAndCoords({
				hours: null,
				minutes: null,
				nextLng: null,
				nextLat: null,
				stationId: null,
			});
		}

		setPopupWindow(false);
		popupOpenRef.current = false;
		UI_elements_div.current.style.pointerEvents = "none";
	}

	return { openPopup, closePopup };
}
