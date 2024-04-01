import { useEffect, useRef } from 'react';
import './ResultsMap.css';

interface MapProps {
    userLat: number;
    userLng: number;
    correctLat: number;
    correctLng: number;
}

const Map = ({userLat, userLng, correctLat, correctLng }: MapProps) => {
    const mapRef = useRef<HTMLDivElement>(null);
    let marker: google.maps.Marker | null = null;
    let marker2: google.maps.Marker | null = null;

    useEffect(() => {

        if (!window.google || !mapRef.current) {
            console.error('Google Maps API failed to load or the map div has not been mounted yet');
            return;
        }

        // Check if userLat and correctLat are defined and are numbers
        if (isNaN(userLat) || isNaN(correctLat)) {
            console.error('Invalid coordinates');
            return;
        }

        const map = new window.google.maps.Map(mapRef.current, {
            center: { lat: userLat, lng: userLng },
            zoom: 4,
            disableDefaultUI: true,
        });

        marker = new window.google.maps.Marker({
            position: { lat: userLat, lng: userLng },
            map: map,
            icon: {
                url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png"
            }
        });

        marker2 = new window.google.maps.Marker({
            position: { lat: correctLat, lng: correctLng },
            map: map,
        });

        // Create a LatLngBounds object
        let bounds = new window.google.maps.LatLngBounds();

        // Extend the bounds to include the coordinates of both markers
        bounds.extend(marker.getPosition() as google.maps.LatLng);
        bounds.extend(marker2.getPosition() as google.maps.LatLng);

        // Adjust the viewport to contain the bounds
        map.fitBounds(bounds);

        // Create a dashed line between the two markers
        let line = new window.google.maps.Polyline({
            path: [
                new window.google.maps.LatLng(userLat, userLng),
                new window.google.maps.LatLng(correctLat, correctLng)
            ],
            strokeColor: "#0000FF",
            strokeOpacity: 0,
            strokeWeight: 2,
            geodesic: false,
            map: map,
            icons: [{
                icon: {
                    path: 'M 0,-1 0,1',
                    strokeOpacity: 1,
                    scale: 4
                },
                offset: '0',
                repeat: '20px'
            }],
        });
        
    });

    return <div ref={mapRef} className="results-map" />;
};

export default Map;