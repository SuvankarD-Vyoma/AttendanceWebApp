"use client";

import { useEffect, useRef } from "react";
import { Location } from "@/lib/types";

interface EmployeeLocationMapProps {
  location: Location;
  employeeName: string;
}

export function EmployeeLocationMap({ location, employeeName }: EmployeeLocationMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && mapRef.current && !mapInstanceRef.current) {
      // Dynamic import of Leaflet to avoid SSR issues
      const loadMap = async () => {
        const L = (await import('leaflet')).default;
        
        // Import Leaflet CSS
        const linkEl = document.createElement('link');
        linkEl.rel = 'stylesheet';
        linkEl.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(linkEl);
        
        // Initialize map
        const map = L.map(mapRef.current).setView([location.lat, location.lng], 15);
        
        // Add tile layer (Stadia Maps with dark mode support)
        L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png', {
          maxZoom: 20,
          attribution: '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors'
        }).addTo(map);
        
        // Create custom icon
        const customIcon = L.divIcon({
          html: `<div class="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-bold">${employeeName.charAt(0)}</div>`,
          className: '',
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        });
        
        // Add marker
        const marker = L.marker([location.lat, location.lng], { icon: customIcon }).addTo(map);
        
        // Add popup with employee info
        marker.bindPopup(`<b>${employeeName}</b><br>Check-in location`).openPopup();
        
        // Draw a circle around the marker to indicate approximate location
        L.circle([location.lat, location.lng], {
          color: 'rgba(59, 130, 246, 0.5)',
          fillColor: 'rgba(59, 130, 246, 0.1)',
          fillOpacity: 0.5,
          radius: 100
        }).addTo(map);
        
        mapInstanceRef.current = map;
        
        // Update map size after it's visible
        setTimeout(() => {
          map.invalidateSize();
        }, 250);
      };
      
      loadMap();
    }
    
    // Cleanup
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [location, employeeName]);
  
  return <div ref={mapRef} className="h-full rounded-md" />;
}