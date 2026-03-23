import "../../assets/styles/stamps.css";
import close_popup_button from "../../assets/images/cross_button.svg";

import CountryStamp from "./CountryStamp.jsx";
import ExpandedStamp from "./ExpandedStamp.jsx";

// All imports needed for LAZY LOADING
import posts from "../../assets/utils/stamps_data.json";
import clsx from "clsx"; // !!!!!!!!!!!!!!!! DO npm install --save clsx
import useLazyLoad from "../../assets/utils/useLazyLoad.js";
import { LoadingListStamps } from "./LoadingCountryStamp.jsx";
const NUM_PER_PAGE = 3; // Number of small stamps entries per "page" (per scroll)
const TOTAL_PAGES = 3;

import { useState, useRef } from "react";

export default function Stamps() {
	// Everything needed for LAZY LOADING
	const stampsInfo = posts["data"];
	const triggerRef = useRef(null);
	const onGrabData = (currentPage) => {
		// This would be where you'll call your API --------------- connect to database?
		return new Promise((resolve) => {
			setTimeout(() => {
				const data = stampsInfo.slice(
					((currentPage - 1) % TOTAL_PAGES) * NUM_PER_PAGE,
					NUM_PER_PAGE * (currentPage % TOTAL_PAGES),
				);
				console.log(data);
				resolve(data);
			}, 100);
		});
	};

	const { data, loading } = useLazyLoad({ triggerRef, onGrabData });

	// ------- Everything below is without the lazy loading, what we had before
	const [expandedOpen, setExpandedOpen] = useState([false, "", ""]);

	function toggle_stamp_open(name, pic) {
		console.log("Clicked the stamp");
		if (expandedOpen[0]) setExpandedOpen([false, "", ""]);
		else setExpandedOpen([true, name, pic]); // Instead of JUST THE NAME we should probably pass in an ID of the station to quickly search
		//  through the db and find the entry we need - this depends on how we're going to store the dates !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
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
					/>
				</>
			)}
			{!expandedOpen[0] && (
				<>
					<div className="top-info">
						<p className="name">Stamps collection</p>
						<div className="stats">
							<p className="collected">collected: 23</p>
							<p className="total">total: 105</p>
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

						{/* Looping through each entry of the JSON file and passing in all the arguments to a stamp COMPONENT which takes them in through props and displays */}
						{data.map((stamp) => {
							return (
								<CountryStamp
									toggleStamp={() =>
										toggle_stamp_open(
											stamp["name"],
											stamp["imageUrl"],
										)
									}
									stationPic={stamp["imageUrl"]}
									name={stamp["name"]}
									country={stamp["country"]}
									date={stamp["date"]}
								/>
							);
						})}

						<div
							ref={triggerRef}
							className={clsx("trigger", { visible: loading })}
						>
							<LoadingListStamps />
						</div>

						{/* <LoadingListStamps /> */}

						{/* <CountryStamp 
                        toggleStamp = {() => toggle_stamp_open('Luxembourg', lux)}
                        stationPic = {lux}
                        name = "Luxembourg"
                        country = "Luxembourg"
                        date = "01.03.2026"
                    />
                    <CountryStamp 
                        toggleStamp = {() => toggle_stamp_open('Zurich', zurich)}
                        stationPic = {zurich}
                        name = "Zurich"
                        country = "Switzerland"
                        date = "12.02.2026"
                    />
                    <CountryStamp 
                        toggleStamp = {() => toggle_stamp_open('Bern', bern)}
                        stationPic = {bern}
                        name = "Bern"
                        country = "Switzerland"
                        date = "24.02.2026"
                    /> */}
					</div>
				</>
			)}
		</div>
	);
}
