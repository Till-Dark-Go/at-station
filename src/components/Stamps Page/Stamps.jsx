import "../../assets/styles/stamps.css";
import close_popup_button from "../../assets/images/cross_button.svg";

import CountryStamp from "./CountryStamp.jsx";
import ExpandedStamp from "./ExpandedStamp.jsx";
import { LoadingStamp } from "./LoadingStamp.jsx";

import useLazyLoad from "../../assets/utils/useLazyLoad.js";
import { getStampsPage } from "../../api/stamps.js";
import { auth } from "../../api/firebase";

import { useState, useRef, useCallback } from "react";

const NUM_PER_PAGE = 3;
const loadPlaceholders = [1, 2, 3];

function StampsList({ sortBy, userId, onToggleStamp }) {
	const lastDocRef = useRef(null);
	const hasMoreRef = useRef(true);
	const triggerRef = useRef(null);

	const onGrabData = useCallback(async () => {
		if (!hasMoreRef.current) return [];

		const { stamps, lastDoc } = await getStampsPage(
			userId,
			NUM_PER_PAGE,
			lastDocRef.current,
			sortBy,
		);

		lastDocRef.current = lastDoc;
		if (!stamps || stamps.length < NUM_PER_PAGE) hasMoreRef.current = false;

		return stamps;
	}, [userId, sortBy]);

	const { data, loading } = useLazyLoad({ triggerRef, onGrabData });

	return (
		<>
			{data.length === 0 && !loading && (
				<div className="no-stations">
					You haven't visited any stations yet.
				</div>
			)}

			{data.map((stamp) => (
				<CountryStamp
					key={stamp.id}
					toggleStamp={() =>
						onToggleStamp(
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
				{loading &&
					loadPlaceholders.map((num) => <LoadingStamp key={num} />)}
			</div>
		</>
	);
}

export default function Stamps() {
	const userId = auth.currentUser?.uid;

	const [sortBy, setSortBy] = useState("last-visited");
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
					<div className="top-info">
						<p className="name">Stamps collection</p>
						<div className="stats">
							<p className="total">Total: 105</p>
						</div>
					</div>

					<div className="stamps-mini">
						<p className="sorting">
							<label htmlFor="sorting-options">Sorted by:</label>
							<select
								id="sorting-options"
								value={sortBy}
								onChange={(e) => setSortBy(e.target.value)}
							>
								<option value="last-visited">
									Last visited
								</option>
								<option value="alphab">Aa - Zz</option>
							</select>
						</p>

						<StampsList
							key={sortBy}
							sortBy={sortBy}
							userId={userId}
							onToggleStamp={toggle_stamp_open}
						/>
					</div>
				</>
			)}
		</div>
	);
}
