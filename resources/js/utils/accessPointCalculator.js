/**
 * Access Point Calculator
 * Finds the optimal walkable access point for each shelf using Dijkstra-style pathfinding
 */

/**
 * Calculate optimal access points for all shelves in the shop map
 * @param {Object} shopMap - The shop map with entities
 * @param {Object} pathfinder - PathFinder instance for navigation grid
 * @returns {Object} Map of shelfId to access point {x, y, distance, method}
 */
export function calculateShelfAccessPoints(shopMap, pathfinder) {
  if (!shopMap?.entities?.shelves || !pathfinder) {
    console.error('Invalid shopMap or pathfinder');
    return {};
  }

  const accessPoints = {};
  
  shopMap.entities.shelves.forEach(shelf => {
    const accessPoint = findOptimalAccessPoint(shelf, pathfinder, shopMap);
    if (accessPoint) {
      accessPoints[shelf.id] = accessPoint;
    }
  });

  console.log(`Calculated access points for ${Object.keys(accessPoints).length} shelves`);
  return accessPoints;
}

/**
 * Find the optimal access point for a single shelf
 * Uses Dijkstra pathfinding from shelf center to find the nearest walkable point
 * 
 * @param {Object} shelf - Shelf object with bounds
 * @param {Object} pathfinder - PathFinder instance
 * @param {Object} shopMap - Shop map for validation
 * @returns {Object|null} Access point {x, y, distance, method, shelfId}
 */
function findOptimalAccessPoint(shelf, pathfinder, shopMap) {
  const bounds = shelf.bounds;
  const centerX = bounds.centerX;
  const centerY = bounds.centerY;
  
  // Try Dijkstra-style search from center to find nearest walkable point
  const dijkstraPoint = findNearestWalkablePointDijkstra(
    { x: centerX, y: centerY },
    pathfinder,
    shelf.id
  );
  
  if (dijkstraPoint) {
    console.log(`Shelf ${shelf.id}: Found access point via Dijkstra at (${dijkstraPoint.x.toFixed(0)}, ${dijkstraPoint.y.toFixed(0)}) - distance: ${dijkstraPoint.distance.toFixed(0)}`);
    return {
      x: dijkstraPoint.x,
      y: dijkstraPoint.y,
      distance: dijkstraPoint.distance,
      method: 'dijkstra',
      shelfId: shelf.id
    };
  }
  
  // Fallback: try direct walkable points around the shelf
  const fallbackPoint = findFallbackAccessPoint(shelf, pathfinder);
  if (fallbackPoint) {
    console.warn(`Shelf ${shelf.id}: Using fallback access point at (${fallbackPoint.x.toFixed(0)}, ${fallbackPoint.y.toFixed(0)})`);
    return {
      x: fallbackPoint.x,
      y: fallbackPoint.y,
      distance: fallbackPoint.distance,
      method: 'fallback',
      shelfId: shelf.id
    };
  }
  
  console.error(`Shelf ${shelf.id}: Could not find any valid access point!`);
  return null;
}

/**
 * Dijkstra-style search to find nearest walkable point from a starting position
 * This ignores the fact that we start inside a shelf (enclosed space)
 * 
 * @param {Object} start - Starting point {x, y}
 * @param {Object} pathfinder - PathFinder instance
 * @param {String} shelfId - ID of the shelf (for logging)
 * @returns {Object|null} Nearest walkable point {x, y, distance}
 */
function findNearestWalkablePointDijkstra(start, pathfinder, shelfId) {
  const gridSize = pathfinder.gridSize;
  const visited = new Set();
  const queue = [];
  
  // Priority queue: [point, distance]
  queue.push({ point: start, distance: 0 });
  
  // Search in expanding circles
  const maxDistance = 200; // Maximum search radius
  const maxIterations = 10000; // Prevent infinite loops
  let iterations = 0;
  
  while (queue.length > 0 && iterations < maxIterations) {
    iterations++;
    
    // Get point with smallest distance (simple priority queue)
    queue.sort((a, b) => a.distance - b.distance);
    const current = queue.shift();
    
    const key = `${Math.round(current.point.x)},${Math.round(current.point.y)}`;
    if (visited.has(key)) continue;
    visited.add(key);
    
    // Check if this point is walkable (and we've moved away from start)
    if (current.distance > gridSize) {
      if (pathfinder.isWalkable(current.point)) {
        return {
          x: current.point.x,
          y: current.point.y,
          distance: current.distance
        };
      }
    }
    
    // Stop if we've searched too far
    if (current.distance > maxDistance) {
      break;
    }
    
    // Expand to neighbors
    const neighbors = [
      { x: current.point.x + gridSize, y: current.point.y },
      { x: current.point.x - gridSize, y: current.point.y },
      { x: current.point.x, y: current.point.y + gridSize },
      { x: current.point.x, y: current.point.y - gridSize },
      // Diagonals for better coverage
      { x: current.point.x + gridSize, y: current.point.y + gridSize },
      { x: current.point.x - gridSize, y: current.point.y - gridSize },
      { x: current.point.x + gridSize, y: current.point.y - gridSize },
      { x: current.point.x - gridSize, y: current.point.y + gridSize }
    ];
    
    for (const neighbor of neighbors) {
      const neighborKey = `${Math.round(neighbor.x)},${Math.round(neighbor.y)}`;
      if (visited.has(neighborKey)) continue;
      
      const dx = neighbor.x - start.x;
      const dy = neighbor.y - start.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      queue.push({ point: neighbor, distance });
    }
  }
  
  console.warn(`Shelf ${shelfId}: Dijkstra search completed ${iterations} iterations without finding walkable point`);
  return null;
}

/**
 * Fallback method: try predefined offsets from shelf bounds
 * @param {Object} shelf - Shelf with bounds
 * @param {Object} pathfinder - PathFinder instance
 * @returns {Object|null} Walkable point {x, y, distance}
 */
function findFallbackAccessPoint(shelf, pathfinder) {
  const bounds = shelf.bounds;
  const centerX = bounds.centerX;
  const centerY = bounds.centerY;
  
  // Determine shelf orientation
  const width = bounds.maxX - bounds.minX;
  const height = bounds.maxY - bounds.minY;
  const isHorizontal = width > height;
  
  // Try multiple offsets
  const offsets = [30, 50, 70, 100, 150];
  
  for (const offset of offsets) {
    const testPoints = [];
    
    if (isHorizontal) {
      // Horizontal shelf - check bottom and top
      testPoints.push(
        { x: centerX, y: bounds.maxY + offset },
        { x: centerX, y: bounds.minY - offset }
      );
    } else {
      // Vertical shelf - check right and left
      testPoints.push(
        { x: bounds.maxX + offset, y: centerY },
        { x: bounds.minX - offset, y: centerY }
      );
    }
    
    for (const point of testPoints) {
      if (pathfinder.isWalkable(point)) {
        const dx = point.x - centerX;
        const dy = point.y - centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return { x: point.x, y: point.y, distance };
      }
    }
  }
  
  return null;
}

/**
 * Validate and refine access point (ensure it's actually reachable)
 * @param {Object} accessPoint - The access point to validate
 * @param {Object} shopMap - Shop map with start point
 * @param {Object} pathfinder - PathFinder instance
 * @returns {Boolean} True if valid and reachable
 */
export function validateAccessPoint(accessPoint, shopMap, pathfinder) {
  if (!accessPoint || !pathfinder) return false;
  
  // Check if point is walkable
  if (!pathfinder.isWalkable(accessPoint)) {
    return false;
  }
  
  // If we have a start point, verify path exists
  if (shopMap.entities.startPoint) {
    const path = pathfinder.findPath(
      shopMap.entities.startPoint,
      accessPoint
    );
    return path && path.length > 0;
  }
  
  return true;
}
