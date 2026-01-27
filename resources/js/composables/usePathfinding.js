import { ref, watch } from 'vue';
import { PathFinder } from '../utils/pathfinder';
import { renderPath, clearPaths } from '../utils/konvaRenderer';
import { calculateShelfAccessPoints } from '../utils/accessPointCalculator';
import Konva from 'konva';

export function usePathfinding() {
  const pathfinder = ref(null);
  const pathMode = ref(false);
  const selectedAisles = ref([]);
  const aisleNavigationPoints = ref({});
  const startPoint = ref(null);
  const endPoint = ref(null);

  /**
   * Initialize pathfinder with shop map
   */
  function initPathfinder(shopMap, gridSize = 20) {
    if (!shopMap) return;
    pathfinder.value = new PathFinder(shopMap, gridSize);
    
    // Extract start and end points from DXF
    startPoint.value = shopMap.entities.startPoint;
    endPoint.value = shopMap.entities.endPoint;
    
    // Use stored access points if available, otherwise calculate them
    if (shopMap.shelfAccessPoints && Object.keys(shopMap.shelfAccessPoints).length > 0) {
      console.log('Using stored shelf access points from database');
      aisleNavigationPoints.value = shopMap.shelfAccessPoints;
    } else {
      console.log('Calculating shelf access points (not found in database)');
      const calculatedPoints = calculateShelfAccessPoints(shopMap, pathfinder.value);
      aisleNavigationPoints.value = calculatedPoints;
      
      // Return calculated points so they can be saved
      return calculatedPoints;
    }
    
    console.log('PathFinder initialized with aisle navigation points');
    
    if (startPoint.value) {
      console.log('Using START point from DXF:', startPoint.value);
    }
    if (endPoint.value) {
      console.log('Using END point from DXF:', endPoint.value);
    }
  }

  /**
   * Calculate navigation points for each aisle (prioritize accessible sides)
   */
  function calculateAisleNavigationPoints(shopMap) {
    if (!shopMap?.entities?.shelves) return;
    
    const navPoints = {};
    
    shopMap.entities.shelves.forEach(shelf => {
      const bounds = shelf.bounds;
      const centerX = (bounds.minX + bounds.maxX) / 2;
      const centerY = (bounds.minY + bounds.maxY) / 2;
      
      // Determine shelf orientation based on aspect ratio
      const width = bounds.maxX - bounds.minX;
      const height = bounds.maxY - bounds.minY;
      const isHorizontal = width > height;
      
      // Test points: prioritize SIDES first (where customers access), then center
      const testPoints = [];
      
      // Try multiple offsets to find walkable point
      const offsets = [30, 50, 70, 100];
      
      // Add side points first (higher priority)
      offsets.forEach((offset, index) => {
        if (isHorizontal) {
          // Horizontal shelf - check bottom and top sides (bottom first - more common)
          testPoints.push(
            { x: centerX, y: bounds.maxY + offset, priority: index * 2, label: `bottom-${offset}` },
            { x: centerX, y: bounds.minY - offset, priority: index * 2 + 1, label: `top-${offset}` }
          );
        } else {
          // Vertical shelf - check right and left sides (right first)
          testPoints.push(
            { x: bounds.maxX + offset, y: centerY, priority: index * 2, label: `right-${offset}` },
            { x: bounds.minX - offset, y: centerY, priority: index * 2 + 1, label: `left-${offset}` }
          );
        }
      });
      
      // Add center as lower priority (only if sides are blocked)
      testPoints.push({ x: centerX, y: centerY, priority: 100, label: 'center' });
      
      // Find first walkable point
      let selectedPoint = null;
      for (const point of testPoints) {
        if (pathfinder.value && pathfinder.value.isWalkable(point)) {
          selectedPoint = point;
          console.log(`Aisle ${shelf.id}: Using ${point.label} navigation point at (${point.x.toFixed(0)}, ${point.y.toFixed(0)})`);
          break;
        }
      }
      
      // If no walkable point found, try diagonal corners as last resort
      if (!selectedPoint) {
        const cornerOffset = 40;
        const cornerPoints = [
          { x: centerX + cornerOffset, y: centerY + cornerOffset, label: 'bottom-right' },
          { x: centerX - cornerOffset, y: centerY + cornerOffset, label: 'bottom-left' },
          { x: centerX + cornerOffset, y: centerY - cornerOffset, label: 'top-right' },
          { x: centerX - cornerOffset, y: centerY - cornerOffset, label: 'top-left' }
        ];
        
        for (const point of cornerPoints) {
          if (pathfinder.value && pathfinder.value.isWalkable(point)) {
            selectedPoint = point;
            console.log(`Aisle ${shelf.id}: Using corner ${point.label} navigation point`);
            break;
          }
        }
      }
      
      // Final fallback - use center with error message
      if (!selectedPoint) {
        console.error(`Aisle ${shelf.id}: NO walkable navigation point found! Bounds:`, bounds);
        selectedPoint = { x: centerX, y: centerY, label: 'center-fallback' };
      }
      
      navPoints[shelf.id] = {
        x: selectedPoint.x,
        y: selectedPoint.y,
        shelfId: shelf.id,
        position: selectedPoint.label
      };
    });
    
    aisleNavigationPoints.value = navPoints;
    console.log(`Calculated navigation points for ${Object.keys(navPoints).length} aisles`);
  }

  /**
   * Toggle path mode on/off
   */
  function togglePathMode() {
    pathMode.value = !pathMode.value;
    if (pathMode.value) {
      console.log('Path mode enabled - select aisles to navigate');
    } else {
      console.log('Path mode disabled');
    }
  }

  /**
   * Handle aisle selection in path mode
   */
  function handleAisleSelection(shelfId, layer) {
    if (!pathfinder.value) {
      console.error('Pathfinder not initialized');
      return;
    }

    const navPoint = aisleNavigationPoints.value[shelfId];
    if (!navPoint) {
      console.error('No navigation point found for aisle:', shelfId);
      return;
    }

    // Check if aisle is already selected
    if (selectedAisles.value.includes(shelfId)) {
      console.log(`Aisle ${shelfId} is already selected, ignoring`);
      return;
    }

    // Add aisle to selection
    selectedAisles.value.push(shelfId);
    console.log(`Selected aisle ${shelfId}, total: ${selectedAisles.value.length}`);

    // Clear previous visualization
    clearPathsOnly(layer);
    layer.find('.route-marker').forEach(m => m.destroy());

    // Draw path with START and END points, plus TSP optimization
    if (selectedAisles.value.length >= 1) {
      drawOptimizedPath(layer);
    }

    layer.batchDraw();
  }

  /**
   * Calculate distance between two points
   */
  function calculateDistance(point1, point2) {
    const dx = point2.x - point1.x;
    const dy = point2.y - point1.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * Optimize route using nearest neighbor TSP heuristic
   */
  function optimizeRouteOrder(aisleIds, startPt) {
    if (aisleIds.length <= 1) return aisleIds;

    const unvisited = [...aisleIds];
    const optimized = [];
    let current = startPt || (startPoint.value || aisleNavigationPoints.value[aisleIds[0]]);

    while (unvisited.length > 0) {
      let nearestIdx = 0;
      let nearestDist = Infinity;

      // Find nearest unvisited aisle
      for (let i = 0; i < unvisited.length; i++) {
        const aislePoint = aisleNavigationPoints.value[unvisited[i]];
        const dist = calculateDistance(current, aislePoint);
        if (dist < nearestDist) {
          nearestDist = dist;
          nearestIdx = i;
        }
      }

      const nearest = unvisited[nearestIdx];
      optimized.push(nearest);
      current = aisleNavigationPoints.value[nearest];
      unvisited.splice(nearestIdx, 1);
    }

    return optimized;
  }

  /**
   * Draw optimized path including START and END points
   */
  function drawOptimizedPath(layer) {
    // Build route: START -> optimized aisles -> END
    const route = [];
    
    // Add START point if available
    if (startPoint.value) {
      route.push({ point: startPoint.value, label: 'START', type: 'start' });
    }

    // Optimize aisle order using TSP
    const optimizedAisles = optimizeRouteOrder(selectedAisles.value, startPoint.value);
    console.log('Original order:', selectedAisles.value);
    console.log('Optimized order:', optimizedAisles);

    // Update selected aisles to optimized order
    selectedAisles.value = optimizedAisles;

    // Add aisles to route
    optimizedAisles.forEach(aisleId => {
      route.push({ 
        point: aisleNavigationPoints.value[aisleId], 
        label: aisleId, 
        type: 'aisle' 
      });
    });

    // Add END point if available
    if (endPoint.value) {
      route.push({ point: endPoint.value, label: 'END', type: 'end' });
    }

    // Draw markers for all points
    route.forEach((item, index) => {
      drawPathMarker(item.point, index + 1, layer, item.type);
    });

    // Draw paths between consecutive points
    let allSegmentsFound = true;
    for (let i = 0; i < route.length - 1; i++) {
      const start = route[i].point;
      const end = route[i + 1].point;

      console.log(`Finding path segment ${i + 1}: ${route[i].label} -> ${route[i + 1].label}`);

      const path = pathfinder.value.findPath(start, end);

      if (path) {
        const segmentColors = ['#10B981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];
        const color = segmentColors[i % segmentColors.length];

        renderPath(path, layer, {
          color: color,
          strokeWidth: 20,
          dash: [30, 50],
          animated: false
        });
      } else {
        console.error(`No path found between ${route[i].label} and ${route[i + 1].label}`);
        allSegmentsFound = false;
      }
    }

    if (!allSegmentsFound) {
      alert('Could not find paths between all waypoints!');
    } else {
      console.log(`Successfully drawn optimized path through ${route.length} points`);
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
   * Draw a marker at navigation point
   */
  function drawPathMarker(pos, number, layer, type = 'aisle') {
    // Different colors based on type
    let fillColor = '#3b82f6'; // Blue default
    let strokeColor = '#ffffff';
    let radius = 15;
    
    if (type === 'start') {
      fillColor = '#10B981'; // Green for START
      radius = 18;
    } else if (type === 'end') {
      fillColor = '#ef4444'; // Red for END
      radius = 18;
    } else if (number === 1 && !startPoint.value) {
      fillColor = '#3b82f6'; // Blue for first aisle
    } else {
      fillColor = '#f59e0b'; // Orange for waypoints
    }
    
    const marker = new Konva.Circle({
      x: pos.x,
      y: pos.y,
      radius: radius,
      fill: fillColor,
      stroke: strokeColor,
      strokeWidth: 3,
      name: 'route-marker'
    });
    
    const text = new Konva.Text({
      x: pos.x,
      y: pos.y,
      text: type === 'start' ? 'S' : (type === 'end' ? 'E' : number.toString()),
      fontSize: type === 'start' || type === 'end' ? 18 : 16,
      fill: '#ffffff',
      fontStyle: 'bold',
      align: 'center',
      verticalAlign: 'middle',
      offsetX: type === 'start' || type === 'end' ? 6 : 5,
      offsetY: type === 'start' || type === 'end' ? 9 : 8,
      name: 'route-marker'
    });
    
    layer.add(marker);
    layer.add(text);
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
    selectedAisles.value = [];
  }

  // Watch for pathMode changes
  watch(pathMode, (newVal) => {
    if (!newVal) {
      // Clear selection when exiting path mode
      selectedAisles.value = [];
    }
  });

  /**
   * Calculate a complete route through multiple aisles using pathfinder
   */
  function calculateRouteWithPathfinder(aisleIds, aisleCategories) {
    if (!pathfinder.value) {
      console.error('Pathfinder not initialized');
      return null;
    }

    // Build waypoints array with positions and metadata
    const waypoints = aisleIds.map(aisleId => {
      const position = aisleNavigationPoints.value[aisleId];
      
      if (!position) {
        console.warn(`No access point found for aisle ${aisleId}`);
        return null;
      }

      return {
        aisleId,
        position,
        name: `Aisle ${aisleId}`,
        items: [] // Will be filled by caller
      };
    }).filter(wp => wp !== null);

    if (waypoints.length === 0) {
      console.error('No valid waypoints to route through');
      return null;
    }

    // Use pathfinder to calculate optimized route
    const route = pathfinder.value.calculateRoute(waypoints);
    
    return route;
  }

  /**
   * Get access point for a specific aisle
   */
  function getAccessPoint(aisleId) {
    return aisleNavigationPoints.value[aisleId] || null;
  }

  return {
    pathfinder,
    pathMode,
    selectedAisles,
    aisleNavigationPoints,
    startPoint,
    endPoint,
    initPathfinder,
    togglePathMode,
    handleAisleSelection,
    clearPathVisualization,
    resetPathMode,
    calculateRouteWithPathfinder,
    getAccessPoint
  };
}
