import CurrentStationLabel from "./CurrentStationLabel"
import NextStationLabel from "./NextStationLabel"

export default function StationInfoLayout() {
    return (
        <div className="stations_labeled_navigation">
            <CurrentStationLabel />
            <NextStationLabel />
        </div>
    )
}