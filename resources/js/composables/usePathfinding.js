import { ref, watch } from 'vue';
import { PathFinder } from '../utils/pathfinder';
import { renderPath, clearPaths } from '../utils/konvaRenderer';
import Konva from 'konva';

export function usePathfinding() {
  const pathfinder = ref(null);
  const pathMode = ref(false);
  const pathPoints = ref([]);

  /**
   * Initialize pathfinder with shop map
   */
  function initPathfinder(shopMap, gridSize = 20) {
    if (!shopMap) return;
    pathfinder.value = new PathFinder(shopMap, gridSize);
    console.log('PathFinder initialized');
  }

  /**
   * Toggle path mode on/off
   */
  function togglePathMode() {
    pathMode.value = !pathMode.value;
    if (pathMode.value) {
      console.log('Path mode enabled - click two points to find a path');
    } else {
      console.log('Path mode disabled');
    }
  }

  /**
   * Handle click in path mode
   */
  function handlePathClick(worldPos, layer) {
    console.log('Clicked at:', worldPos);
    
    if (!pathfinder.value) {
      console.error('Pathfinder not initialized');
      return;
    }
    
    // Check if position is walkable
    if (!pathfinder.value.isWalkable(worldPos)) {
      console.warn('Clicked position is not walkable');
      return;
    }
    
    pathPoints.value.push(worldPos);
    
    // Draw a marker at the clicked point
    drawPathMarker(worldPos, pathPoints.value.length, layer);
    
    // If we have at least 2 points, draw paths between all consecutive points
    if (pathPoints.value.length >= 2) {
      // Clear previous paths but keep markers
      clearPathsOnly(layer);
      
      // Draw path between all consecutive waypoints
      drawMultiSegmentPath(layer);
    }
    
    layer.batchDraw();
  }

  /**
   * Draw paths between all consecutive waypoints
   */
  function drawMultiSegmentPath(layer) {
    let allSegmentsFound = true;
    
    // Draw path for each segment
    for (let i = 0; i < pathPoints.value.length - 1; i++) {
      const start = pathPoints.value[i];
      const end = pathPoints.value[i + 1];
      
      console.log(`Finding path segment ${i + 1}: from point ${i + 1} to point ${i + 2}`);
      
      const path = pathfinder.value.findPath(start, end);
      
      if (path) {
        // Use different colors for different segments
        const segmentColors = ['#10B981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];
        const color = segmentColors[i % segmentColors.length];
        
        renderPath(path, layer, {
          color: color,
          strokeWidth: 20,
          dash: [30, 50],
          animated: false
        });
      } else {
        console.error(`No path found for segment ${i + 1}`);
        allSegmentsFound = false;
      }
    }
    
    if (!allSegmentsFound) {
      alert('Could not find paths between all waypoints!');
    } else {
      console.log(`Successfully drawn path through ${pathPoints.value.length} waypoints`);
    }
  }

  /**
   * Clear only path lines (not markers)
   */
  function clearPathsOnly(layer) {
    if (layer) {
      clearPaths(layer);
      layer.batchDraw();
    }
  }

  /**
   * Draw a marker at clicked position
   */
  function drawPathMarker(pos, number, layer) {
    // Different colors for start, end, and waypoints
    let fillColor = '#3b82f6'; // Blue for start
    if (number > 1 && pathPoints.value.length > number) {
      fillColor = '#f59e0b'; // Orange for waypoints
    } else if (number > 1) {
      fillColor = '#ef4444'; // Red for current end
    }
    
    const marker = new Konva.Circle({
      x: pos.x,
      y: pos.y,
      radius: 10,
      fill: fillColor,
      stroke: '#ffffff',
      strokeWidth: 2,
      name: 'route-marker'
    });
    
    const text = new Konva.Text({
      x: pos.x,
      y: pos.y,
      text: number.toString(),
      fontSize: 14,
      fill: '#ffffff',
      fontStyle: 'bold',
      align: 'center',
      verticalAlign: 'middle',
      offsetX: 4,
      offsetY: 7,
      name: 'route-marker'
    });
    
    layer.add(marker);
    layer.add(text);
  }

  /**
   * Find path between two points and draw it (legacy - now using drawMultiSegmentPath)
   */
  function findAndDrawPath(layer) {
    const start = pathPoints.value[0];
    const end = pathPoints.value[1];
    
    console.log('Finding path from', start, 'to', end);
    
    const path = pathfinder.value.findPath(start, end);
    
    if (path) {
      console.log('Path found! Drawing...');
      renderPath(path, layer, {
        color: '#10B981',
        strokeWidth: 15,
        dash: [25, 15],
        animated: false,
      });
      layer.batchDraw();
    } else {
      console.error('No path found!');
      alert('No path found between these points!');
    }
  }

  /**
   * Clear all path visualizations
   */
  function clearPathVisualization(layer) {
    if (layer) {
      clearPaths(layer);
      
      // Clear markers
      const markers = layer.find('.route-marker');
      markers.forEach(m => m.destroy());
      
      layer.batchDraw();
    }
  }

  /**
   * Reset path mode state
   */
  function resetPathMode(layer) {
    clearPathVisualization(layer);
    pathPoints.value = [];
  }

  // Watch for pathMode changes
  watch(pathMode, (newVal, oldVal, onCleanup) => {
    if (!newVal) {
      // Clear path when exiting path mode (layer passed separately)
      pathPoints.value = [];
    }
  });

  return {
    pathfinder,
    pathMode,
    pathPoints,
    initPathfinder,
    togglePathMode,
    handlePathClick,
    clearPathVisualization,
    resetPathMode
  };
}
