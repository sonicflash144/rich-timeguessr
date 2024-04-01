// components/Map.tsx
import { useEffect, useRef } from 'react';
import './Map.css';

interface MapProps {
    setGuessLocation: (location: { lat: number; lng: number }) => void;
}

const Map = ({ setGuessLocation }: MapProps) => {
    const mapRef = useRef<HTMLDivElement>(null);
    let marker: google.maps.Marker | null = null;

    useEffect(() => {
        
        if (!window.google || !mapRef.current) {
            console.error('Google Maps API failed to load or the map div has not been mounted yet');
            return;
        }

        const map = new window.google.maps.Map(mapRef.current, {
            center: { lat: 29.5984, lng: -95.6226 },
            zoom: 4,
            disableDefaultUI: true,
        });

        map.addListener('click', (e: google.maps.MapMouseEvent) => {
            setGuessLocation({ lat: e.latLng.lat(), lng: e.latLng.lng() });

            // Remove the old marker if it exists
            if (marker) {
                marker.setMap(null);
            }

            // Create a new marker at the clicked location
            marker = new window.google.maps.Marker({
                position: {lat: e.latLng.lat(), lng: e.latLng.lng()},
                map: map,
                icon: {
                    url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png"
                }
            });
        });
        
    }, []);

    return <div ref={mapRef} className="map" />;
};

export default Map;