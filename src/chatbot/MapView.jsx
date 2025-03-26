import React, { useState, useEffect } from "react";
import {
  GoogleMap,
  Marker,
  DirectionsRenderer,
  TrafficLayer,
  useJsApiLoader,
} from "@react-google-maps/api";

const containerStyle = {
  width: "100%",
  height: "400px",
};

const MapView = ({ stay, userLocation }) => {
  const [directions, setDirections] = useState(null);
  const [travelMode, setTravelMode] = useState("DRIVING");

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: "",
    libraries: ["places"],
  });

  useEffect(() => {
    if (!isLoaded || !userLocation || !stay) return;

    const g = window.google;
    if (!g || !g.maps) return;

    const directionsService = new g.maps.DirectionsService();

    directionsService.route(
      {
        origin: userLocation,
        destination: { lat: stay.lat, lng: stay.lng },
        travelMode: g.maps.TravelMode[travelMode],
      },
      (result, status) => {
        if (status === "OK") {
          setDirections(result);
        } else {
          console.error("Directions request failed:", status);
        }
      }
    );
  }, [isLoaded, userLocation, stay, travelMode]);

  if (loadError) return <div>Failed to load Google Maps</div>;
  if (!isLoaded) return <div>Loading map...</div>;

  return (
    <div style={{ position: "relative" }}>
      {/* Map UI */}
      <GoogleMap mapContainerStyle={containerStyle} center={stay} zoom={13}>
        <Marker position={stay} />
        {userLocation && (
          <Marker
            position={userLocation}
            icon={{
              url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png",
            }}
          />
        )}
        <TrafficLayer />
        {directions && <DirectionsRenderer directions={directions} />}
      </GoogleMap>

      {/* Travel mode toggle */}
      <div
        style={{
          position: "absolute",
          top: 10,
          right: 10,
          background: "#fff",
          padding: "6px 12px",
          borderRadius: "8px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
          zIndex: 10,
        }}
      >
        <label style={{ fontWeight: "bold", marginRight: 6 }}>Mode:</label>
        <select
          value={travelMode}
          onChange={(e) => setTravelMode(e.target.value)}
        >
          <option value="DRIVING">🚗 Driving</option>
          <option value="WALKING">🚶 Walking</option>
        </select>
      </div>

      {directions && (
        <div
          style={{
            position: "sticky",
            bottom: 0,
            background: "#f8f9fa",
            padding: "12px 16px",
            borderTop: "1px solid #ddd",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 14,
            gap: 16,
            zIndex: 10,
          }}
        >
          <h4 style={{ margin: 0, whiteSpace: "nowrap" }}>🧭 Route Details</h4>

          <p style={{ margin: 0, whiteSpace: "nowrap" }}>
            <strong>Distance:</strong>{" "}
            {directions.routes[0].legs[0].distance.text} •{" "}
            <strong>Duration:</strong>{" "}
            {directions.routes[0].legs[0].duration.text}
          </p>

          <a
            href={`https://www.google.com/maps/dir/?api=1&origin=${
              userLocation.lat
            },${userLocation.lng}&destination=${stay.lat},${
              stay.lng
            }&travelmode=${travelMode.toLowerCase()}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              background: "#0d6efd",
              color: "#fff",
              padding: "8px 14px",
              borderRadius: "6px",
              textDecoration: "none",
              fontWeight: "bold",
              whiteSpace: "nowrap",
            }}
          >
            🚀 Start Navigation
          </a>
        </div>
      )}
    </div>
  );
};

export default MapView;
