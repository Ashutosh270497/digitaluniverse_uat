import test from 'node:test';
import assert from 'node:assert/strict';
import { MAP_VIEWBOX, OVERVIEW_CAMERA, MAX_MAP_ZOOM, constrainCamera, focusOnPoint, moveCamera, zoomCamera, positionOnCamera } from '../../src/features/global-coverage/mapViewport.js';

test('zoom is bounded and zooming back out restores the whole map', () => {
  const close = zoomCamera(OVERVIEW_CAMERA, 50);
  assert.equal(close.zoom, MAX_MAP_ZOOM);
  assert.deepEqual(zoomCamera(close, -50), OVERVIEW_CAMERA);
});

test('pan bounds prevent dragging the world completely out of view', () => {
  assert.deepEqual(moveCamera(OVERVIEW_CAMERA, 999, -999), OVERVIEW_CAMERA);
  const view = moveCamera({ zoom: 2, x: -200, y: -100 }, -5000, 5000);
  assert.deepEqual(view, { zoom: 2, x: -MAP_VIEWBOX.width, y: 0 });
  assert.deepEqual(constrainCamera({ zoom: 0.5, x: 20, y: -20 }), OVERVIEW_CAMERA);
});

test('focusing a region keeps its marker in the visible central area', () => {
  for (const point of [{x:350,y:180}, {x:630,y:150}, {x:800,y:240}]) {
    const camera = focusOnPoint(point);
    const screen = positionOnCamera(point, camera);
    assert.equal(camera.zoom, 1.65);
    assert.ok(screen.left > 20 && screen.left < 80);
    assert.ok(screen.top > 15 && screen.top < 85);
  }
});

test('center zoom maintains the map point beneath the viewport center', () => {
  const before = { x: -400, y: -180, zoom: 2 };
  const point = { x: (600 - before.x) / before.zoom, y: (310 - before.y) / before.zoom };
  const after = zoomCamera(before, 0.2);
  const screen = positionOnCamera(point, after);
  assert.ok(Math.abs(screen.left - 50) < 0.0001);
  assert.ok(Math.abs(screen.top - 50) < 0.0001);
});
