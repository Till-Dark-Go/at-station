import { useEffect, useReducer, useCallback, useRef } from "react";
import debounce from "lodash/debounce";

const INTERSECTION_THRESHOLD = 5;
const LOAD_DELAY_MS = 500;

const reducer = (state, action) => {
	switch (action.type) {
		case "set":
			return { ...state, ...action.payload };
		case "onGrabData": {
			// Guard: ensure data is always an array before spreading
			const incoming = Array.isArray(action.payload.data)
				? action.payload.data
				: [];
			return {
				...state,
				loading: false,
				data: [...state.data, ...incoming],
				currentPage: state.currentPage + 1,
			};
		}
		default:
			return state;
	}
};

const useLazyLoad = ({ triggerRef, onGrabData, options }) => {
	const [state, dispatch] = useReducer(reducer, {
		loading: false,
		currentPage: 1,
		data: [],
	});

	const loadingRef = useRef(false);
	const currentPageRef = useRef(1);

	loadingRef.current = state.loading;
	currentPageRef.current = state.currentPage;

	const _handleEntry = async (entry) => {
		const boundingRect = entry.boundingClientRect;
		const intersectionRect = entry.intersectionRect;

		if (
			!loadingRef.current &&
			entry.isIntersecting &&
			intersectionRect.bottom - boundingRect.bottom <=
				INTERSECTION_THRESHOLD
		) {
			dispatch({ type: "set", payload: { loading: true } });
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
				dispatch({ type: "set", payload: { loading: false } });
			}
		}
	};

	const handleEntry = useCallback(debounce(_handleEntry, LOAD_DELAY_MS), [
		onGrabData,
	]);

	const onIntersect = useCallback(
		(entries) => handleEntry(entries[0]),
		[handleEntry],
	);

	useEffect(() => {
		const el = triggerRef.current;
		if (!el) return;
		const observer = new IntersectionObserver(onIntersect, options);
		observer.observe(el);
		return () => observer.disconnect();
	}, [onIntersect, options, state.currentPage]);

	return state;
};

export default useLazyLoad;
