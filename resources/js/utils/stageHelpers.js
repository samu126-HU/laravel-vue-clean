import Konva from 'konva';

/**
 * Initialize Konva stage and layer
 */
export function initKonvaStage(container, options = {}) {
  const {
    width = container.offsetWidth,
    height = container.offsetHeight,
    draggable = true
  } = options;

  const stage = new Konva.Stage({
    container: container,
    width: width,
    height: height,
    draggable: draggable
  });

  const mainLayer = new Konva.Layer();
  stage.add(mainLayer);

  return { stage, mainLayer };
}

/**
 * Setup zoom functionality for stage
 */
export function setupZoom(stage, zoomRef, options = {}) {
  const {
    ZOOM_MIN = 0.1,
    ZOOM_MAX = 5
  } = options;

  stage.on('wheel', (e) => {
    e.evt.preventDefault();

    const oldScale = stage.scaleX();
    const pointer = stage.getPointerPosition();

    const mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale,
    };

    const delta = e.evt.deltaY > 0 ? 0.9 : 1.1;
    const newScale = Math.max(ZOOM_MIN, Math.min(oldScale * delta, ZOOM_MAX));

    stage.scale({ x: newScale, y: newScale });
    zoomRef.value = newScale;

    const newPos = {
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    };

    stage.position(newPos);
  });
}

/**
 * Setup click handler for stage
 */
export function setupStageClick(stage, handler) {
  stage.on('click', (e) => {
    const pos = stage.getPointerPosition();
    const transform = stage.getAbsoluteTransform().copy().invert();
    const worldPos = transform.point(pos);
    
    handler(worldPos);
  });
}

/**
 * Fit stage to map bounds
 */
export function fitStageToMap(stage, containerRef, bounds, padding = 20) {
  const containerWidth = containerRef.offsetWidth;
  const containerHeight = containerRef.offsetHeight;

  const mapWidth = bounds.width + padding * 2;
  const mapHeight = bounds.height + padding * 2;

  const scaleX = containerWidth / mapWidth;
  const scaleY = containerHeight / mapHeight;
  const scale = Math.min(scaleX, scaleY) * 0.9;

  stage.scale({ x: scale, y: scale });

  const x = (containerWidth - mapWidth * scale) / 2 - (bounds.minX - padding) * scale;
  const y = (containerHeight - mapHeight * scale) / 2 - (bounds.minY - padding) * scale;

  stage.position({ x, y });

  return scale;
}

/**
 * Handle window resize
 */
export function handleResize(stage, containerRef, bounds, padding = 20) {
  if (!containerRef || !stage) return;
  
  const width = containerRef.offsetWidth;
  const height = containerRef.offsetHeight;
  
  stage.width(width);
  stage.height(height);
  
  if (bounds) {
    fitStageToMap(stage, containerRef, bounds, padding);
  }
}

/**
 * Zoom in
 */
export function zoomIn(stage, zoomRef, ZOOM_STEP = 1.2, ZOOM_MAX = 5) {
  const newScale = Math.min(zoomRef.value * ZOOM_STEP, ZOOM_MAX);
  stage.scale({ x: newScale, y: newScale });
  zoomRef.value = newScale;
}

/**
 * Zoom out
 */
export function zoomOut(stage, zoomRef, ZOOM_STEP = 1.2, ZOOM_MIN = 0.1) {
  const newScale = Math.max(zoomRef.value / ZOOM_STEP, ZOOM_MIN);
  stage.scale({ x: newScale, y: newScale });
  zoomRef.value = newScale;
}

/**
 * Reset view to fit map
 */
export function resetView(stage, containerRef, bounds, padding = 20) {
  if (bounds) {
    return fitStageToMap(stage, containerRef, bounds, padding);
  }
}
