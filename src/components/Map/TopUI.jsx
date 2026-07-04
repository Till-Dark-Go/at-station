export default function TopUI(props) {
	const isTravelling = props.currentlyTravelling.current;
	const canOpenNearestStations =
		!isTravelling &&
		props.userStartingPoint.id &&
		props.onCurrentStationClick;

	return (
		<div
			className={`top-curr-station-name${canOpenNearestStations ? " clickable" : ""}`}
			onClick={canOpenNearestStations ? props.onCurrentStationClick : undefined}
			onKeyDown={
				canOpenNearestStations
					? (event) => {
							if (event.key === "Enter" || event.key === " ") {
								event.preventDefault();
								props.onCurrentStationClick();
							}
						}
					: undefined
			}
			role={canOpenNearestStations ? "button" : undefined}
			tabIndex={canOpenNearestStations ? 0 : undefined}
		>
			<div className="lable">
				{isTravelling
					? "Currently on the way to"
					: "Current station is"}
			</div>
			<div className="station-name">
				{isTravelling
					? props.nextStationName
					: props.userStartingPoint.name}
			</div>
			<div className="line"></div>
		</div>
	);
}
