import "../../assets/styles/expanded_stamp.css";
import { useEffect, useState } from "react";
import { getStationTravelLog } from "../../api/stamps.js";
import { auth } from "../../api/firebase";

const formatTime = (date) =>
	date?.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }) ??
	"—";

const formatDate = (date) => date?.toLocaleDateString("en-GB") ?? "—";

export default function ExpandedStamp({ name, pic, country, stationId }) {
	const [log, setLog] = useState([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		if (!stationId) return;
		const userId = auth.currentUser?.uid;
		getStationTravelLog(userId, stationId)
			.then(setLog)
			.catch(console.error)
			.finally(() => setLoading(false));
	}, [stationId]);

	return (
		<div className="expanded-stamp">
			<div className="names exp-names">
				<p className="station">{name}</p>
				<p className="country-stamp">{country}</p>
			</div>
			<div className="exp-station-pic">
				<img src={pic} alt={`${name} picture`} />
			</div>
			<div className="travel-log">
				<div className="title">Travel Log</div>
				{loading && <p>Loading...</p>}
				{!loading && log.length === 0 && <p>No travel log entries.</p>}
				{log.map((entry, i) => (
					<EntryInfo key={i} entry={entry} />
				))}
			</div>
		</div>
	);
}

function EntryInfo({ entry }) {
	return (
		<>
			<div className="entry-info">
				<span className="label">To/From:</span>
				<span className="label">Time:</span>
				<span className="label">Date:</span>

				<span title={entry.destination + " - " + entry.origin}>
					{entry.destination}
					<br />
					{entry.origin}
				</span>
				<span>
					{formatTime(entry.startTime)}
					<br />
					{formatTime(entry.endTime)}
				</span>
				<span title={formatDate(entry.startTime)}>
					{formatDate(entry.startTime)}
				</span>
			</div>
			<hr className="stamp-hr" />
		</>
	);
}
