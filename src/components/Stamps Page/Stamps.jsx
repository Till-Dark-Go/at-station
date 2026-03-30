import "../../assets/styles/stamps.css";
import close_popup_button from "../../assets/images/cross_button.svg";

import CountryStamp from "./CountryStamp.jsx";
import ExpandedStamp from "./ExpandedStamp.jsx";
import { LoadingStamp } from "./LoadingStamp.jsx";

import clsx from "clsx";
import useLazyLoad from "../../assets/utils/useLazyLoad.js";
import { getStampsPage } from "../../api/stamps.js";
import { auth } from "../../api/firebase";

import { useState, useRef, useCallback, useEffect } from "react";

const NUM_PER_PAGE = 3;
const loadPlaceholders = [1, 2, 3];

export default function Stamps() {
	const userId = auth.currentUser?.uid;

	// Cursor for Firestore pagination — persists across scroll triggers
	const lastDocRef = useRef(null);
	const hasMoreRef = useRef(true);

	const triggerRef = useRef(null); // This is the SENSOR the browser is constantly looking for, i.e. the grey boxes that are on the screen at the moment
	// Only when the browsers finds the triggerRef div, it executes useLazyLoad hook

	const onGrabData = useCallback(async () => {
		// Stop querying once Firestore returns a short page (end of collection)
		if (!hasMoreRef.current) return [];

		const { stamps, lastDoc } = await getStampsPage(
			userId,
			NUM_PER_PAGE,
			lastDocRef.current,
		);

		lastDocRef.current = lastDoc;
		if (!stamps || stamps.length < NUM_PER_PAGE) hasMoreRef.current = false;

		return stamps;
	}, [userId]);

	const { data, loading } = useLazyLoad({ triggerRef, onGrabData });
	console.log(data.length);

	const [expandedOpen, setExpandedOpen] = useState([false, "", "", "", ""]);

	function toggle_stamp_open(name, pic, country, id) {
		if (expandedOpen[0]) setExpandedOpen([false, "", "", "", ""]);
		else setExpandedOpen([true, name, pic, country, id]);
	}

	return (
		<div className="stamps-container fade-in">
			{expandedOpen[0] && (
				<>
					<button
						className="popup-close-button"
						onClick={toggle_stamp_open}
					>
						<img
							src={close_popup_button}
							alt="Close popup button"
						/>
					</button>
					<ExpandedStamp
						name={expandedOpen[1]}
						pic={expandedOpen[2]}
						country={expandedOpen[3]}
						stationId={expandedOpen[4]}
					/>
				</>
			)}

			{!expandedOpen[0] && (
				<>
					{/* Header for the stamps page */}
					<div className="top-info">
						<p className="name">Stamps collection</p>
						<div className="stats">
							<p className="collected">
								Collected: {data.length}
							</p>
							<p className="total">Total: 105</p>
						</div>
					</div>
					<div className="stamps-mini">
						<p className="sorting">
							<label htmlFor="sorting-options">Sorted by:</label>
							<select id="sorting-options">
								<option value="last-visited">
									Last visited
								</option>
								<option value="alphab">Aa - Zz</option>
							</select>
						</p>

						{data.length == 0 && !loading && (
							<>
								<div className="no-stations">
									You haven't visited any stations yet.
								</div>
							</>
						)}

						{/* Actual stamps */}
						{data.map((stamp) => (
							<CountryStamp
								key={stamp.id}
								toggleStamp={() =>
									toggle_stamp_open(
										stamp.name,
										stamp.imageUrl,
										stamp.country,
										stamp.id,
									)
								}
								stationPic={stamp.imageUrl}
								name={stamp.name}
								country={stamp.country}
								date={stamp["last-visited"]}
							/>
						))}

						<div
							ref={triggerRef}
							className="loading-trigger"
							style={{ minHeight: "50px" }}
						>
							{/* It doesn't matter how many grey stamps we display here, once fetched, we will still load 3 because that's 
								what we wrote in NUM_PER_PAGE and it's how many we're telling the API to load */}

							{/* loading is needed to remove the grey stamps when we have nothing else to load */}
							{loading && (
								<>
									{loadPlaceholders.map((num) => (
										<LoadingStamp key={num} />
									))}
								</>
							)}
						</div>
					</div>
				</>
			)}
		</div>
	);
}
