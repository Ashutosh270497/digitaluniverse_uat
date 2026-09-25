import { MARKETPLACE_ROUTES, VERIFIED_MARKETPLACE_LOCATIONS } from '../../content/marketplaceCoverage.ts';
import { MAP_VIEWBOX, createRoutePath, graticulePath, projectMarketplace, worldPath } from './mapProjection.js';

const locationById = new Map(VERIFIED_MARKETPLACE_LOCATIONS.map(location => [location.id, location]));

const StaticCoverageMap = ({ activeRegionId, revision }) => (
  <svg viewBox={`0 0 ${MAP_VIEWBOX.width} ${MAP_VIEWBOX.height}`} className="h-full w-full" aria-hidden="true" focusable="false" data-map-fallback>
    <defs>
      <linearGradient id="coverage-land" x1="0" y1="0" x2="0.4" y2="1">
        <stop offset="0" stopColor="#67633a" /><stop offset="1" stopColor="#32331d" />
      </linearGradient>
      <linearGradient id="coverage-route" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#ffe01c" stopOpacity="0.2" /><stop offset="0.5" stopColor="#fff1a1" /><stop offset="1" stopColor="#ffe01c" stopOpacity="0.35" />
      </linearGradient>
      <radialGradient id="coverage-region-glow"><stop stopColor="#ffe333" stopOpacity="0.48" /><stop offset="1" stopColor="#ffe333" stopOpacity="0" /></radialGradient>
      <pattern id="coverage-dots" width="8" height="8" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="0.9" fill="#ece5aa" opacity="0.2" /></pattern>
      <clipPath id="coverage-land-clip"><path d={worldPath} /></clipPath>
      <filter id="coverage-route-glow" x="-50%" y="-100%" width="200%" height="300%"><feGaussianBlur stdDeviation="4" /></filter>
    </defs>
    <path d={graticulePath} fill="none" stroke="#d7d2a2" strokeOpacity="0.08" strokeWidth="0.8" />
    <path d={worldPath} transform="translate(0 5)" fill="#090b02" opacity="0.8" />
    <path d={worldPath} fill="url(#coverage-land)" stroke="#999567" strokeWidth="0.6" strokeLinejoin="round" />
    <rect width={MAP_VIEWBOX.width} height={MAP_VIEWBOX.height} fill="url(#coverage-dots)" clipPath="url(#coverage-land-clip)" />
    <g clipPath="url(#coverage-land-clip)">
      {VERIFIED_MARKETPLACE_LOCATIONS.map(location => {
        const { x, y } = projectMarketplace(location);
        return <circle key={location.id} cx={x} cy={y} r={location.id === activeRegionId ? 160 : 85} fill="url(#coverage-region-glow)" opacity={location.id === activeRegionId ? 1 : 0.5} className="coverage-region-glow" />;
      })}
    </g>
    <g key={revision} fill="none" strokeLinecap="round">
      {MARKETPLACE_ROUTES.filter(route => route.active).map((route, index) => {
        const path = createRoutePath(locationById.get(route.originId), locationById.get(route.destinationId));
        const active = route.originId === activeRegionId || route.destinationId === activeRegionId;
        return <g key={route.id} opacity={active ? 1 : 0.4}>
          <path d={path} stroke="#ffe143" strokeWidth="9" opacity="0.3" filter="url(#coverage-route-glow)" />
          <path d={path} stroke="url(#coverage-route)" strokeWidth="2" />
          <path d={path} stroke="#fff0b5" strokeWidth="3" strokeDasharray="3 38" className="coverage-route-travel" />
          <circle r="5" fill="#fff4b0" stroke="#ffdf29" strokeWidth="2" className="coverage-route-signal" style={{ offsetPath: `path('${path}')`, animationDelay: `${index * -2.4}s` }} />
        </g>;
      })}
      {VERIFIED_MARKETPLACE_LOCATIONS.map((location, index) => {
        const { x, y } = projectMarketplace(location);
        return <g key={location.id} transform={`translate(${x} ${y})`}>
          <circle r="28" fill="#ffe43c" fillOpacity="0.05" stroke="#ffe43c" strokeOpacity="0.3" />
          <circle r="30" stroke="#ffe953" className="coverage-location-pulse" style={{ animationDelay: `${index * -1.1}s` }} />
        </g>;
      })}
    </g>
  </svg>
);

export default StaticCoverageMap;
