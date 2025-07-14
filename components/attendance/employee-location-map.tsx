"use client";

import { useEffect, useRef } from "react";
import type { Map as LeafletMap } from 'leaflet'; // Import Leaflet's Map type
import { Location } from "@/lib/types";
import '@/styles/leaflet.css'; // Import the CSS at the component level

interface EmployeeLocationMapProps {
  location: Location;
  employeeName: string;
}

export function EmployeeLocationMap({ location, employeeName }: EmployeeLocationMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  // Use a ref to hold the map instance, allowing it to survive re-renders.
  const mapInstanceRef = useRef<LeafletMap | null>(null);

  useEffect(() => {
    // Abort if the map container div isn't rendered yet.
    if (!mapRef.current) {
      return;
    }

    // This is the core of the fix.
    // If a map instance already exists, we don't need to re-initialize.
    // We just need to update its view and markers.
    if (mapInstanceRef.current) {
      const map = mapInstanceRef.current;

      // Update the map's center and zoom level
      map.setView([location.lat, location.lng], 15);

      // Clear old markers and circles before adding new ones
      map.eachLayer((layer) => {
        // Don't remove the tile layer
        if (!!layer.getAttribution) {
          return;
        }
        map.removeLayer(layer);
      });

      // Re-add marker, popup, and circle for the new location/employee
      addMapElements(map, location, employeeName);

      return; // Stop here, no need to run the rest of the effect
    }

    // --- This part runs only ONCE to initialize the map ---
    let map: LeafletMap;

    const initializeMap = async () => {
      // Ensure the div is still there when this async code runs
      if (!mapRef.current) return;

      const L = (await import('leaflet'));
      // Remove the dynamic CSS import since we're importing it at the top
      // await import('leaflet/dist/leaflet.css');

      // Defensive check: If Leaflet has somehow attached itself already, do nothing.
      // This prevents the "already initialized" error in edge cases.
      if ((mapRef.current as any)._leaflet_id) {
        return;
      }

      // Initialize the map on the div
      map = L.map(mapRef.current).setView([location.lat, location.lng], 15);
      mapInstanceRef.current = map; // Store the instance in the ref

      // Add the tile layer (the base map image)
      L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png', {
        maxZoom: 20,
        attribution: '© <a href="https://stadiamaps.com/">Stadia Maps</a>, © <a href="https://openmaptiles.org/">OpenMapTiles</a> © <a href="http://openstreetmap.org">OpenStreetMap</a> contributors'
      }).addTo(map);

      // Add markers, popups, etc.
      addMapElements(map, location, employeeName);
    };

    initializeMap();

    // The cleanup function for the effect
    return () => {
      // When the component unmounts, destroy the map instance
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
    // The dependency array ensures this effect re-evaluates if props change.
  }, [location, employeeName]);

  // Helper function to keep the code clean
  const addMapElements = async (map: LeafletMap, loc: Location, name: string) => {
    const L = (await import('leaflet'));

    const customIcon = L.divIcon({
      html: `<div class="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-bold">${name.charAt(0)}</div>`,
      className: '',
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });

    const marker = L.marker([loc.lat, loc.lng], { icon: customIcon }).addTo(map);
    marker.bindPopup(`<b>${name}</b><br>Check-in location`).openPopup();

    L.circle([loc.lat, loc.lng], {
      color: 'rgba(59, 130, 246, 0.5)',
      fillColor: 'rgba(59, 130, 246, 0.1)',
      fillOpacity: 0.5,
      radius: 100
    }).addTo(map);

    // After adding/changing elements, especially in a dialog, invalidate the size.
    setTimeout(() => {
      map.invalidateSize();
    }, 100);
  };

  // The div that will contain the map
  return <div ref={mapRef} className="h-full rounded-md" />;
}