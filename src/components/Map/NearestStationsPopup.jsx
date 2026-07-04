import close_popup_button from "../../assets/images/cross_button.svg";
import { formatTravelTime } from "../../assets/utils/map/mapCalculations";

export default function NearestStationsPopup({
	stations,
	currentStationName,
	onClose,
}) {
	return (
		<div className="popup-window fade-in nearest-stations-popup">
			<button className="popup-close-button" onClick={onClose}>
				<img src={close_popup_button} alt="Close popup button" />
			</button>
			<div className="window-info">
				<div className="info">
					<div className="small-lable">Closest stations from</div>
					<div className="main-lable">{currentStationName}</div>
					{stations.length > 0 ? (
						<ul className="nearest-stations-list">
							{stations.map((station, index) => (
								<li
									key={station.id}
									className="nearest-station-item"
								>
									<span className="nearest-station-rank">
										{index + 1}.
									</span>
									<span className="nearest-station-name">
										{station.name}
									</span>
									<span className="nearest-station-time">
										{formatTravelTime(
											station.hours,
											station.minutes,
										)}
									</span>
								</li>
							))}
						</ul>
					) : (
						<div className="description">
							No nearby stations found.
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
