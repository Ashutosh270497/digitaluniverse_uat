import { geoEqualEarth, geoGraticule10, geoPath } from 'd3-geo';
import { feature } from 'topojson-client';
import countriesTopology from 'world-atlas/countries-110m.json';

import { MAP_VIEWBOX } from './mapViewport.js';
export { MAP_VIEWBOX } from './mapViewport.js';

export const worldCountries = feature(
  countriesTopology,
  countriesTopology.objects.countries,
);

export const createWorldProjection = () =>
  geoEqualEarth().fitExtent(
    [
      [MAP_VIEWBOX.padding, MAP_VIEWBOX.padding],
      [MAP_VIEWBOX.width - MAP_VIEWBOX.padding, MAP_VIEWBOX.height - MAP_VIEWBOX.padding],
    ],
    { type: 'Sphere' },
  );

export const worldProjection = createWorldProjection();
export const worldPath = geoPath(worldProjection)(worldCountries);
export const graticulePath = geoPath(worldProjection)(geoGraticule10());

export const projectMarketplace = ({ longitude, latitude }) => {
  const projected = worldProjection([longitude, latitude]);
  if (!projected) return { x: 0, y: 0, left: 0, top: 0 };

  const [x, y] = projected;
  return {
    x,
    y,
    left: (x / MAP_VIEWBOX.width) * 100,
    top: (y / MAP_VIEWBOX.height) * 100,
  };
};

export const createRoutePath = (origin, destination) => {
  const start = projectMarketplace(origin);
  const end = projectMarketplace(destination);
  const distance = Math.hypot(end.x - start.x, end.y - start.y);
  const lift = Math.min(115, Math.max(45, distance * 0.18));
  const controlX = (start.x + end.x) / 2;
  const controlY = Math.min(start.y, end.y) - lift;

  return `M ${start.x.toFixed(2)} ${start.y.toFixed(2)} Q ${controlX.toFixed(2)} ${controlY.toFixed(2)} ${end.x.toFixed(2)} ${end.y.toFixed(2)}`;
};
