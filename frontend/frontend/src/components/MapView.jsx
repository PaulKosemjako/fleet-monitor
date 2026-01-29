import { useEffect, useRef } from "react";
import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import VectorLayer from "ol/layer/Vector";
import OSM from "ol/source/OSM";
import VectorSource from "ol/source/Vector";
import Feature from "ol/Feature";
import Point from "ol/geom/Point";
import { fromLonLat } from "ol/proj";
import { Style, Circle as CircleStyle, Fill, Stroke } from "ol/style";

function MapView({ robots }) {
  const mapElementRef = useRef(null);
  const mapRef = useRef(null);
  const vectorSourceRef = useRef(null);

  // Karte einmalig initialisieren
  useEffect(() => {
    if (mapRef.current) return;

    vectorSourceRef.current = new VectorSource();

    const map = new Map({
      target: mapElementRef.current,
      layers: [
        new TileLayer({
          source: new OSM(),
        }),
        new VectorLayer({
          source: vectorSourceRef.current,
          style: new Style({
            image: new CircleStyle({
              radius: 6,
              fill: new Fill({ color: "red" }),
              stroke: new Stroke({ color: "white", width: 2 }),
            }),
          }),
        }),
      ],
      view: new View({
        center: fromLonLat([13.405, 52.52]), 
        zoom: 12,
      }),
    });

    mapRef.current = map;
  }, []);

  // Robots-Features bei Änderung aktualisieren
  useEffect(() => {
    if (!vectorSourceRef.current) return;

    const source = vectorSourceRef.current;
    source.clear();

    if (!robots || robots.length === 0) return;

    const features = robots.map((robot) => {
      const lon = robot.lon;
      const lat = robot.lat;

      const feature = new Feature({
        geometry: new Point(fromLonLat([lon, lat])),
        robotId: robot.id,
        name: robot.name,
        status: robot.status,
      });

      return feature;
    });

    source.addFeatures(features);
  }, [robots]);

  return (
    <div
      ref={mapElementRef}
      style={{
        width: "100%",
        height: "400px",
        border: "1px solid #ccc",
        marginBottom: "1.5rem",
      }}
    />
  );
}

export default MapView;
