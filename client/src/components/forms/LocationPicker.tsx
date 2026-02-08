import React, { useState, useEffect, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Search, MapPin, Loader2, Navigation } from "lucide-react";
import { Input } from "../ui/Input";

// Fix for default marker icon in React context
// @ts-ignore
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
// @ts-ignore
import markerIcon from "leaflet/dist/images/marker-icon.png";
// @ts-ignore
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

interface LocationResult {
  lat: number;
  lng: number;
  formattedAddress: string;
}

interface LocationPickerProps {
  initialLocation?: { lat: number; lng: number; formattedAddress?: string };
  onLocationSelect: (location: LocationResult) => void;
  apiKey?: string; // Kept for compatibility but ignored
}

// Component to handle marker drag and click events
const DraggableMarker = ({ position, setPosition, onLocationSelect }: any) => {
  const markerRef = useRef<L.Marker>(null);

  const eventHandlers = React.useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current;
        if (marker != null) {
          const latLng = marker.getLatLng();
          setPosition(latLng);
          // Reverse geocode on drag end
          fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latLng.lat}&lon=${latLng.lng}`
          )
            .then((res) => res.json())
            .then((data) => {
              onLocationSelect({
                lat: latLng.lat,
                lng: latLng.lng,
                formattedAddress: data.display_name,
              });
            })
            .catch(() => {
              onLocationSelect({
                lat: latLng.lat,
                lng: latLng.lng,
                formattedAddress: `${latLng.lat.toFixed(
                  6
                )}, ${latLng.lng.toFixed(6)}`,
              });
            });
        }
      },
    }),
    [onLocationSelect, setPosition]
  );

  return (
    <Marker
      draggable={true}
      eventHandlers={eventHandlers}
      position={position}
      ref={markerRef}
    />
  );
};

// Component to handle map clicks to move marker
const MapClickHandler = ({ setPosition, onLocationSelect }: any) => {
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
      fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${e.latlng.lat}&lon=${e.latlng.lng}`
      )
        .then((res) => res.json())
        .then((data) => {
          onLocationSelect({
            lat: e.latlng.lat,
            lng: e.latlng.lng,
            formattedAddress: data.display_name,
          });
        });
    },
  });
  return null;
};

// Component to update map view when position changes programmatically
const RecenterMap = ({
  position,
  shouldZoom,
}: {
  position: L.LatLngExpression;
  shouldZoom?: boolean;
}) => {
  const map = useMap();
  useEffect(() => {
    if (shouldZoom) {
      map.setView(position, 16);
    } else {
      map.setView(position, map.getZoom());
    }
  }, [position, map, shouldZoom]);
  return null;
};

export const LocationPicker: React.FC<LocationPickerProps> = ({
  initialLocation,
  onLocationSelect,
}) => {
  const [position, setPosition] = useState<L.LatLngExpression>(
    initialLocation?.lat && initialLocation?.lng
      ? [initialLocation.lat, initialLocation.lng]
      : [27.7172, 85.324] // Kathmandu
  );
  const [address, setAddress] = useState(
    initialLocation?.formattedAddress || ""
  );
  const [isSearching, setIsSearching] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  // ... (existing helper components)

  // Component to update map view when position changes programmatically

  const handleSearch = async () => {
    if (!address.trim()) return;
    setIsSearching(true);
    try {
      // Search with country bias (Nepal) and address details
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          address
        )}&countrycodes=np&addressdetails=1&limit=5`
      );
      const data = await response.json();
      if (data && data.length > 0) {
        const firstResult = data[0];
        const newLat = parseFloat(firstResult.lat);
        const newLng = parseFloat(firstResult.lon);

        setPosition([newLat, newLng]);
        onLocationSelect({
          lat: newLat,
          lng: newLng,
          formattedAddress: firstResult.display_name,
        });
      }
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setIsSearching(false);
    }
  };

  // ... inside LocationPicker component ...

  const handleLocateMe = () => {
    if (navigator.geolocation) {
      setIsLocating(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setPosition([latitude, longitude]);
          fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          )
            .then((res) => res.json())
            .then((data) => {
              setAddress(data.display_name);
              onLocationSelect({
                lat: latitude,
                lng: longitude,
                formattedAddress: data.display_name,
              });
            })
            .finally(() => setIsLocating(false));
        },
        (err) => {
          console.error(err);
          alert("Could not access location");
          setIsLocating(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    }
  };

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex gap-2">
        <div className="relative flex-grow">
          <Input
            label="Search Location"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="Type address and press Enter..."
            fullWidth
            icon={
              isSearching ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Search className="w-5 h-5" />
              )
            }
          />
          {/* Overlay hint if needed */}
        </div>
        <button
          onClick={handleLocateMe}
          disabled={isLocating}
          className="mt-8 px-4 py-2 bg-white border-2 border-gray-200 rounded-xl hover:bg-gray-50 flex items-center justify-center transition-colors text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Locate Me"
        >
          {isLocating ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Navigation className="w-5 h-5" />
          )}
        </button>
      </div>

      <div className="relative rounded-2xl overflow-hidden border-2 border-gray-100 shadow-sm h-[400px] z-0">
        <MapContainer
          center={position}
          zoom={13}
          scrollWheelZoom={true}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <DraggableMarker
            position={position}
            setPosition={setPosition}
            onLocationSelect={onLocationSelect}
          />
          <MapClickHandler
            setPosition={setPosition}
            onLocationSelect={onLocationSelect}
          />
          <RecenterMap
            position={position}
            shouldZoom={isLocating || isSearching}
          />
        </MapContainer>

        {/* Helper overlay */}
        <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-sm p-3 rounded-xl shadow-lg border border-white/50 text-xs text-gray-600 flex items-center gap-2 z-[1000]">
          <div className="bg-[var(--color-primary)] text-white p-1.5 rounded-lg">
            <MapPin className="w-4 h-4" />
          </div>
          <p>Click anywhere or drag the pin to set location.</p>
        </div>
      </div>
    </div>
  );
};
