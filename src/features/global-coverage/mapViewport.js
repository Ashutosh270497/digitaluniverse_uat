export const MAP_VIEWBOX = Object.freeze({ width: 1200, height: 620, padding: 24 });
export const OVERVIEW_CAMERA = Object.freeze({ x: 0, y: 0, zoom: 1 });
export const MAX_MAP_ZOOM = 2.6;

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

export const constrainCamera = ({ x, y, zoom }) => {
  const boundedZoom = clamp(zoom, 1, MAX_MAP_ZOOM);
  return {
    x: clamp(x, MAP_VIEWBOX.width * (1 - boundedZoom), 0),
    y: clamp(y, MAP_VIEWBOX.height * (1 - boundedZoom), 0),
    zoom: boundedZoom,
  };
};

export const focusOnPoint = ({ x, y }, zoom = 1.65) => constrainCamera({
  x: MAP_VIEWBOX.width / 2 - x * zoom,
  y: MAP_VIEWBOX.height * 0.48 - y * zoom,
  zoom,
});

export const zoomCamera = (camera, delta) => {
  const zoom = clamp(camera.zoom + delta, 1, MAX_MAP_ZOOM);
  const ratio = zoom / camera.zoom;
  return constrainCamera({
    x: MAP_VIEWBOX.width / 2 - (MAP_VIEWBOX.width / 2 - camera.x) * ratio,
    y: MAP_VIEWBOX.height / 2 - (MAP_VIEWBOX.height / 2 - camera.y) * ratio,
    zoom,
  });
};

export const moveCamera = (camera, x, y) => constrainCamera({
  ...camera, x: camera.x + x, y: camera.y + y,
});

export const positionOnCamera = ({ x, y }, camera) => ({
  left: ((x * camera.zoom + camera.x) / MAP_VIEWBOX.width) * 100,
  top: ((y * camera.zoom + camera.y) / MAP_VIEWBOX.height) * 100,
});
