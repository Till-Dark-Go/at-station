export function calcStationParameters(station, userStartingPoint) {
    const nextLngVar = station['longitude'];
    const nextLatVar = station['latitude'];
    const travelTimeInMinutes = calculateTravelTimeInMinutes(userStartingPoint, nextLngVar, nextLatVar);
    const hoursVar = Math.floor(travelTimeInMinutes / 60);
    const minutesVar = travelTimeInMinutes % 60;

    return { nextLngVar, nextLatVar, hoursVar, minutesVar };
}

export function calculateTravelTimeInMinutes(userStartingPoint, nextLng, nextLat) {
    // Using the vector formula and USER'S long lat calculate the distance
    let userLng = userStartingPoint.lng;
    let userLat = userStartingPoint.lat;
    let distance = haversine(userLng, userLat, nextLng, nextLat);  // haversine() - customer function at the bottom of the code

    // Convert into some number of minutes
    let travelTime = Math.floor(distance * 0.2);  // * by 0.2 cuz we assume the train is going in a straight line at 300-350 kmph => 160 km will take about 30 minutes

    return travelTime;
}

// This calculates the distance between two points considering MEDIANS - since this is a real world map, we can't just use the Euclidean distance formula
function haversine(lng1, lat1, lng2, lat2){
    // Converting to radians
    lng1 = lng1 * Math.PI / 180;
    lng2 = lng2 * Math.PI / 180;
    lat1 = lat1 * Math.PI / 180;
    lat2 = lat2 * Math.PI / 180;

    // Haversine formula itself - we won't care about how it works too much, it's just math
    const dlon = lng2 - lng1; 
    const dlat = lat2 - lat1;
    const a = Math.sin(dlat/2)**2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dlon/2)**2;
    const c = 2 * Math.asin(Math.sqrt(a));

    // Earth's radius in km
    const r = 6371;

    return c * r;  // Distance between two points in km
}