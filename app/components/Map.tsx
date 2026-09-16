"use client";

import { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";
import type { LatLngExpression } from "leaflet";
import "leaflet/dist/leaflet.css";

type MapProps = {
  city?: string | null;
  pinCode?: string | null;
};

type Coordinates = {
  lat: number;
  lon: number;
};

type NominatimAddress = {
  suburb?: string;
  neighbourhood?: string;
  city?: string;
  town?: string;
  village?: string;
  state?: string;
  postcode?: string;
};

type NominatimResult = {
  lat?: string;
  lon?: string;
  address?: NominatimAddress;
};

const DEFAULT_POSITION: LatLngExpression = [28.6139, 77.209];
const DEFAULT_ZOOM = 11;

function MapController({
  coordinates,
  onMovingChange,
}: {
  coordinates: Coordinates | null;
  onMovingChange: (moving: boolean) => void;
}) {
  const map = useMap();

  useEffect(() => {
    if (coordinates === null) return;

    onMovingChange(true);

    map.flyTo([coordinates.lat, coordinates.lon], 14, {
      animate: true,
      duration: 1.5,
    });

    const timer = window.setTimeout(() => {
      onMovingChange(false);
    }, 1600);

    return () => {
      window.clearTimeout(timer);
      onMovingChange(false);
    };
  }, [coordinates, map, onMovingChange]);

  return null;
}

export default function Map({ city, pinCode }: MapProps) {
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);
  const [locationName, setLocationName] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [isMoving, setIsMoving] = useState<boolean>(false);

  useEffect(() => {
    const cityValue: string = city == null ? "" : city.trim();
    const pinCodeValue: string = pinCode == null ? "" : pinCode.trim();

    if (cityValue.length === 0 || pinCodeValue.length === 0) {
      setCoordinates(null);
      setLocationName("");
      setLoading(false);
      return;
    }

    const controller = new AbortController();

    async function findLocation(): Promise<void> {
      setLoading(true);

      try {
        const params = new URLSearchParams();

        params.set("city", cityValue);
        params.set("postalcode", pinCodeValue);
        params.set("country", "India");
        params.set("countrycodes", "in");
        params.set("format", "jsonv2");
        params.set("limit", "1");
        params.set("addressdetails", "1");

        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?${params.toString()}`,
          {
            method: "GET",
            signal: controller.signal,
            headers: {
              Accept: "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error(
            `Location lookup failed: ${response.status}`
          );
        }

        const results = (await response.json()) as NominatimResult[];

        if (!Array.isArray(results) || results.length === 0) {
          console.warn("No location found:", cityValue, pinCodeValue);

          setCoordinates(null);
          setLocationName(cityValue);

          return;
        }

        const result = results[0];

        const latitude = Number(result.lat);
        const longitude = Number(result.lon);

        if (
          !Number.isFinite(latitude) ||
          !Number.isFinite(longitude)
        ) {
          throw new Error("Invalid coordinates returned");
        }

        setCoordinates({
          lat: latitude,
          lon: longitude,
        });

        const address = result.address;

        let locality: string = cityValue;

        if (
          typeof address?.suburb === "string" &&
          address.suburb.trim() !== ""
        ) {
          locality = address.suburb.trim();
        } else if (
          typeof address?.neighbourhood === "string" &&
          address.neighbourhood.trim() !== ""
        ) {
          locality = address.neighbourhood.trim();
        } else if (
          typeof address?.town === "string" &&
          address.town.trim() !== ""
        ) {
          locality = address.town.trim();
        } else if (
          typeof address?.village === "string" &&
          address.village.trim() !== ""
        ) {
          locality = address.village.trim();
        } else if (
          typeof address?.city === "string" &&
          address.city.trim() !== ""
        ) {
          locality = address.city.trim();
        }

        setLocationName(locality);
      } catch (error) {
        if (
          error instanceof DOMException &&
          error.name === "AbortError"
        ) {
          return;
        }

        console.error("Map location lookup error:", error);

        setCoordinates(null);
        setLocationName(cityValue);
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    void findLocation();

    return () => controller.abort();
  }, [city, pinCode]);

  const markerPosition: LatLngExpression =
    coordinates === null
      ? DEFAULT_POSITION
      : [coordinates.lat, coordinates.lon];

  const popupPinCode: string =
    pinCode == null ? "" : pinCode.trim();

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "560px",
        overflow: "hidden",
        borderRadius: "16px",
      }}
    >
      <MapContainer
        center={DEFAULT_POSITION}
        zoom={DEFAULT_ZOOM}
        style={{
          height: "100%",
          width: "100%",
          borderRadius: "16px",
        }}
        scrollWheelZoom={false}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />

        <MapController
          coordinates={coordinates}
          onMovingChange={setIsMoving}
        />

        <Marker position={markerPosition}>
          <Popup>
            <strong>Your service area</strong>

            {locationName !== "" && (
              <>
                <br />
                {locationName}
              </>
            )}

            {popupPinCode !== "" && (
              <>
                <br />
                PIN: {popupPinCode}
              </>
            )}
          </Popup>
        </Marker>
      </MapContainer>

      {/* Soft frosted transition while map moves */}
      {isMoving && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 900,
            pointerEvents: "none",
            borderRadius: "16px",
            backdropFilter: "blur(3px)",
            WebkitBackdropFilter: "blur(3px)",
            background:
              "radial-gradient(circle at 50% 45%, rgba(255,255,255,0.32), rgba(255,255,255,0.12) 45%, rgba(255,255,255,0.04) 75%)",
          }}
        />
      )}

      {/* Location lookup indicator */}
      {loading && (
        <div
          style={{
            position: "absolute",
            top: "12px",
            right: "12px",
            zIndex: 1000,
            background: "white",
            padding: "8px 12px",
            borderRadius: "10px",
            fontSize: "13px",
            boxShadow: "0 2px 10px rgba(0, 0, 0, 0.15)",
          }}
        >
          Finding your area...
        </div>
      )}
    </div>
  );
}