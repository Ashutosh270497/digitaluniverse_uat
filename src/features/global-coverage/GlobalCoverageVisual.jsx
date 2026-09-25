import { useRef, useState } from 'react';
import { Maximize, Minus, Move, Plus } from 'lucide-react';
import { VERIFIED_MARKETPLACE_LOCATIONS } from '../../content/marketplaceCoverage.ts';
import StaticCoverageMap from './StaticCoverageMap.jsx';
import { projectMarketplace } from './mapProjection.js';
import { MAP_VIEWBOX, MAX_MAP_ZOOM, OVERVIEW_CAMERA, focusOnPoint, moveCamera, positionOnCamera, zoomCamera } from './mapViewport.js';

const locations = VERIFIED_MARKETPLACE_LOCATIONS.map(location => ({ ...location, point: projectMarketplace(location) }));

const GlobalCoverageVisual = ({ selection, onSelectRegion, onInteract, animationActive, reducedMotion }) => {
  const [manualView, setManualView] = useState({ revision: 0, camera: OVERVIEW_CAMERA });
  const [dragging, setDragging] = useState(false);
  const dragRef = useRef(null);
  const activeRegion = locations.find(location => location.id === selection.id);
  const camera = manualView.revision === selection.revision ? manualView.camera : focusOnPoint(activeRegion.point);

  const changeCamera = nextCamera => {
    onInteract();
    setManualView({ revision: selection.revision, camera: nextCamera });
  };
  const resetView = () => changeCamera(OVERVIEW_CAMERA);
  const zoom = amount => changeCamera(zoomCamera(camera, amount));

  const handlePointerDown = event => {
    if (event.button !== 0 || event.target.closest('button') || camera.zoom === 1) return;
    dragRef.current = { x: event.clientX, y: event.clientY, camera, width: event.currentTarget.clientWidth };
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const handlePointerMove = event => {
    const origin = dragRef.current;
    if (!origin) return;
    const dx = event.clientX - origin.x;
    const dy = event.clientY - origin.y;
    if (Math.abs(dx) + Math.abs(dy) < 5) return;
    // Keep vertical page scrolling available on touch screens.
    if (event.pointerType === 'touch' && Math.abs(dy) > Math.abs(dx)) return;
    setDragging(true);
    const scale = MAP_VIEWBOX.width / origin.width;
    changeCamera(moveCamera(origin.camera, dx * scale, dy * scale));
  };
  const finishDrag = event => {
    dragRef.current = null;
    setDragging(false);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
  };
  const handleKeyDown = event => {
    if (event.target !== event.currentTarget) return;
    const pan = { ArrowLeft: [90, 0], ArrowRight: [-90, 0], ArrowUp: [0, 65], ArrowDown: [0, -65] }[event.key];
    if (pan) { event.preventDefault(); changeCamera(moveCamera(camera, ...pan)); }
    else if (['+', '='].includes(event.key)) { event.preventDefault(); zoom(0.35); }
    else if (event.key === '-') { event.preventDefault(); zoom(-0.35); }
    else if (['Home', 'Escape'].includes(event.key)) { event.preventDefault(); resetView(); }
  };

  return (
    <div className="coverage-map-wrap" data-global-map-frame data-map-ready="true" data-animation-active={animationActive} data-reduced-motion={reducedMotion}>
      <p id="coverage-map-instructions" className="sr-only">Select a region marker to show its services and partner links. Use plus and minus to zoom, then drag to pan. With the map focused, use arrow keys to pan, plus or minus to zoom, and Home or Escape to reset. Region buttons below the map provide the same selection.</p>
      <div
        role="group"
        aria-label="Interactive marketplace map"
        aria-describedby="coverage-map-instructions"
        tabIndex={0}
        className="coverage-map-viewport"
        data-dragging={dragging}
        data-zoomed={camera.zoom > 1}
        data-map-zoom={camera.zoom.toFixed(2)}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={finishDrag}
        onPointerCancel={finishDrag}
        onLostPointerCapture={() => { dragRef.current = null; setDragging(false); }}
        onKeyDown={handleKeyDown}
      >
        <div className="coverage-map-plane">
          <div className="coverage-map-camera" data-map-camera style={{ transform: `translate(${camera.x / MAP_VIEWBOX.width * 100}%, ${camera.y / MAP_VIEWBOX.height * 100}%) scale(${camera.zoom})` }}>
            <StaticCoverageMap activeRegionId={selection.id} revision={selection.revision} />
          </div>
          {locations.map((location, index) => {
            const position = positionOnCamera(location.point, camera);
            const outside = position.left < 4 || position.left > 96 || position.top < 5 || position.top > 92;
            return (
              <button
                key={location.id}
                type="button"
                data-map-marker={location.id}
                aria-label={location.accessibleDescription}
                aria-pressed={selection.id === location.id}
                aria-controls="coverage-region-details"
                tabIndex={outside ? -1 : 0}
                hidden={outside}
                onClick={() => onSelectRegion(location.id)}
                className="coverage-map-marker"
                style={{ left: `${position.left}%`, top: `${position.top}%` }}
              >
                <span className="coverage-marker-label">{location.label}</span>
                <span className="coverage-marker-dot" aria-hidden="true">0{index + 1}</span>
              </button>
            );
          })}
        </div>
        <div className="coverage-map-ocean-label" aria-hidden="true">A world of possibilities</div>
      </div>
      <div className="coverage-map-toolbar">
        <span className="flex items-center gap-2 text-xs text-slate-300"><Move className="h-3.5 w-3.5" aria-hidden="true" /><span>{camera.zoom > 1 ? 'Drag to explore' : 'Choose a region to explore'}</span></span>
        <div className="flex items-center gap-1" role="group" aria-label="Map view controls">
          <button type="button" onClick={() => zoom(-0.35)} disabled={camera.zoom <= 1} aria-label="Zoom out" className="coverage-map-control"><Minus className="h-4 w-4" aria-hidden="true" /></button>
          <output aria-label="Map zoom level" className="w-10 text-center text-xs tabular-nums text-slate-200">{Math.round(camera.zoom * 100)}%</output>
          <button type="button" onClick={() => zoom(0.35)} disabled={camera.zoom >= MAX_MAP_ZOOM} aria-label="Zoom in" className="coverage-map-control"><Plus className="h-4 w-4" aria-hidden="true" /></button>
          <button type="button" onClick={resetView} aria-label="Reset world view" className="coverage-map-control ml-1"><Maximize className="h-4 w-4" aria-hidden="true" /></button>
        </div>
      </div>
    </div>
  );
};

export default GlobalCoverageVisual;
