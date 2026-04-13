import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

const API_KEY = '9MPPC5RXcG1E8weX-CVtMhwEWfe293q_60lCYt3KLVo';


class LogoControl {
  onAdd(map) {
    this._map = map;
    this._container = document.createElement('div');
    this._container.className = 'maplibregl-ctrl';
    this._container.innerHTML = '<a href="http://mapy.com/" target="_blank"><img width="100px" src="https://api.mapy.com/img/api/logo.svg" /></a>';
    return this._container;
  }

  onRemove() {
    this._container.parentNode.removeChild(this._container);
    this._map = undefined;
  }
}

const Map = ({ 
  latitude = 49.4278672,
  longitude = 15.2179083,
  zoom = 18
}) => {
  const mapContainer = useRef(null);
  const map = useRef(null);

  useEffect(() => {
    if (map.current || !mapContainer.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      center: [longitude, latitude],
      zoom: zoom,
      style: {
        version: 8,
        sources: {
          'basic-tiles': {
            type: 'raster',
            url: `https://api.mapy.com/v1/maptiles/basic/tiles.json?apikey=${API_KEY}`,
            tileSize: 256,
          },
        },
        layers: [{
          id: 'tiles',
          type: 'raster',
          source: 'basic-tiles',
        }],
      },
    });

    map.current.addControl(new LogoControl(), 'bottom-left');

    new maplibregl.Marker()
      .setLngLat([longitude, latitude])
      .addTo(map.current);

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [latitude, longitude, zoom]);

  return (
    <div 
      ref={mapContainer} 
      className="w-full h-96 rounded-lg shadow-lg"
      style={{ minHeight: '400px' }}
    />
  );
};

export default Map;