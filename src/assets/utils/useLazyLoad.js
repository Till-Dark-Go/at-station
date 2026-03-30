import { useEffect, useReducer, useCallback, useRef } from "react";
import debounce from "lodash/debounce";

const INTERSECTION_THRESHOLD = 5;
const LOAD_DELAY_MS = 500;

// Reducer handles the how to merge the new data we got from lazy loading into the already existing data
const reducer = (state, action) => {
	switch (action.type) {
		// Generic state updater:
		case "set":
			return { ...state, ...action.payload };

		// Handles three critical tasks: stop loading, merge data, and increment page:
		case "onGrabData": {
			// Ensures the spread operator doesn't crash if the API accidentally returns null or a single object
			const incoming = Array.isArray(action.payload.data)
				? action.payload.data
				: [];
			return {
				...state,
				loading: false, // Turn off the spinner/loading state
				data: [...state.data, ...incoming], // Adding the new data to the old one
				currentPage: state.currentPage + 1, // Updating the page number
			};
		}

		// Safety fallback: returns current state if an unknown action type is dispatched
		default:
			return state;
	}
};

const useLazyLoad = ({ triggerRef, onGrabData, options }) => {
	const [state, dispatch] = useReducer(reducer, {
		// Using the reducer function in here that handles the logic
		loading: false, // Keep track whether we are still loading something or not
		currentPage: 1,
		data: [], // The stamps we receive back
	});

	const loadingRef = useRef(false);
	const currentPageRef = useRef(1);

	// Sync refs with the state from above on every render
	loadingRef.current = state.loading;
	currentPageRef.current = state.currentPage;

	const _handleEntry = async (entry) => {
		const boundingRect = entry.boundingClientRect;
		const intersectionRect = entry.intersectionRect;

		// Only first if:
		// 1. NOT already loading
		// 2. The element is visible
		// 3. and it has crossed the defined threshold relative to the viewport (so that we're not loading stamps not in our view)
		if (
			!loadingRef.current &&
			entry.isIntersecting &&
			intersectionRect.bottom - boundingRect.bottom <=
				INTERSECTION_THRESHOLD
		) {
			dispatch({ type: "set", payload: { loading: true } });

			// onGrabData which was passed from the parent component
			try {
				const data = await onGrabData(currentPageRef.current);

				// Normalise here too — if onGrabData resolves with
				// undefined/null/non-array, fall back to []
				dispatch({
					type: "onGrabData",
					payload: { data: Array.isArray(data) ? data : [] },
				});
			} catch (err) {
				console.error("useLazyLoad: onGrabData failed", err);

				// Reset loading state on error to allow for retry attempts on next scroll
				dispatch({ type: "set", payload: { loading: false } });
			}
		}
	};

	// Debounce the handler to prevent multiple rapid-fire network requests if the user scrolls past the trigger point very quickly
	const handleEntry = useCallback(debounce(_handleEntry, LOAD_DELAY_MS), [
		onGrabData,
	]);

	// Intersection Observer callback; typically receives multiple entries, but we only care about the trigger element, which goes below the loaded stamps
	const onIntersect = useCallback(
		(entries) => handleEntry(entries[0]),
		[handleEntry],
	);

	useEffect(() => {
		const el = triggerRef.current;
		if (!el) return;

		// Initialize the native browser Intersection Observer to watch the 'triggerRef' element
		const observer = new IntersectionObserver(onIntersect, options);
		observer.observe(el);

		// Cleanup function: disconnect the observer when the component unmounts or page changes
		// to prevent memory leaks and redundant event firing
		return () => observer.disconnect();
	}, [onIntersect, options, state.currentPage]);

	return state;
};

export default useLazyLoad;
