/**
 * Haversine formula to compute exact distance in meters between two GPS coordinates (lat/lon).
 */
function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
    const R = 6371000; // Earth's mean radius in meters
    const toRad = (angle) => (angle * Math.PI) / 180;

    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const distance = R * c;
    return Math.round(distance * 100) / 100; // Rounded to 2 decimal places
}

/**
 * Validates whether user coordinates lie inside specified campus geofence radius.
 */
function verifyGeofenceLocation(userLat, userLon, campusLat = 13.433369, campusLon = 79.509354, maxRadiusMeters = 50) {
    const distanceMeters = calculateHaversineDistance(userLat, userLon, campusLat, campusLon);
    const isWithin = distanceMeters <= maxRadiusMeters;

    return {
        isWithin,
        distanceMeters,
        maxRadiusMeters,
        campusName: 'SVPCET Main Campus, Puttur'
    };
}

module.exports = {
    calculateHaversineDistance,
    verifyGeofenceLocation
};
