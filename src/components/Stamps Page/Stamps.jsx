import "../../assets/styles/stamps.css";
import close_popup_button from "../../assets/images/cross_button.svg";

import CountryStamp from "./CountryStamp.jsx";
import ExpandedStamp from "./ExpandedStamp.jsx";
import { LoadingListStamps } from "./LoadingCountryStamp.jsx";

import clsx from "clsx";
import useLazyLoad from "../../assets/utils/useLazyLoad.js";
import { getStampsPage } from "../../api/stamps.js";
import { auth } from "../../api/firebase";

import { useState, useRef, useCallback } from "react";

const NUM_PER_PAGE = 3;

export default function Stamps() {
	const userId = auth.currentUser?.uid;

	// Cursor for Firestore pagination — persists across scroll triggers
	const lastDocRef = useRef(null);
	const hasMoreRef = useRef(true);

	const triggerRef = useRef(null);

	const onGrabData = useCallback(async () => {
		// Stop querying once Firestore returns a short page (end of collection)
		if (!hasMoreRef.current) return [];

		const { stamps, lastDoc } = await getStampsPage(
			userId,
			NUM_PER_PAGE,
			lastDocRef.current,
		);

		lastDocRef.current = lastDoc;
		if (stamps.length < NUM_PER_PAGE) hasMoreRef.current = false;

		return stamps;
	}, [userId]);

	const { data, loading } = useLazyLoad({ triggerRef, onGrabData });

	const [expandedOpen, setExpandedOpen] = useState([false, "", "", "", ""]);

	function toggle_stamp_open(name, pic, country, id) {
		if (expandedOpen[0]) setExpandedOpen([false, "", "", "", ""]);
		else setExpandedOpen([true, name, pic, country, id]);
	}

	return (
		<div className="stamps-container">
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
							className={clsx("trigger", { visible: loading })}
						>
							<LoadingListStamps />
						</div>
					</div>
				</>
			)}
		</div>
	);
}
