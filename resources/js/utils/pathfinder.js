import PF from 'pathfinding';

/**
 * PathFinder class for calculating routes on a shop map
 */
export class PathFinder {
  constructor(shopMap, gridSize = 20) {
    this.shopMap = shopMap;
    this.gridSize = gridSize; // Size of each grid cell
    this.grid = null;
    this.pfGrid = null;
    
    if (shopMap && shopMap.bounds) {
      this.buildGrid();
    }
  }

  /**
   * Build a pathfinding grid from the shop map
   */
  buildGrid() {
    const { bounds } = this.shopMap;
    
    // Calculate grid dimensions
    const cols = Math.ceil(bounds.width / this.gridSize);
    const rows = Math.ceil(bounds.height / this.gridSize);
    
    console.log(`Building pathfinding grid: ${cols}x${rows} (${cols * rows} cells)`);
    
    // Initialize grid - all cells walkable by default
    this.grid = Array(rows).fill().map(() => Array(cols).fill(1)); // 1 = walkable
    
    // Mark obstacles
    this.markObstacles();
    
    // Ensure START and END points are walkable
    this.ensureNavigationPointsWalkable();
    
    // Create PathFinding.js grid
    this.pfGrid = new PF.Grid(cols, rows);
    
    // Set walkable cells
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        this.pfGrid.setWalkableAt(x, y, this.grid[y][x] === 1);
      }
    }
    
    console.log('Pathfinding grid built successfully');
  }

  /**
   * Ensure START and END navigation points are marked as walkable
   */
  ensureNavigationPointsWalkable() {
    const points = [];
    
    if (this.shopMap.entities.startPoint) {
      points.push(this.shopMap.entities.startPoint);
    }
    
    if (this.shopMap.entities.endPoint) {
      points.push(this.shopMap.entities.endPoint);
    }
    
    points.forEach(point => {
      const gridPos = this.worldToGrid(point);
      
      // Mark the point and surrounding cells as walkable (3x3 area)
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const x = gridPos.x + dx;
          const y = gridPos.y + dy;
          if (this.isInBounds(x, y)) {
            this.grid[y][x] = 1; // Mark as walkable
          }
        }
      }
      
      console.log(`Ensured navigation point at (${point.x.toFixed(0)}, ${point.y.toFixed(0)}) is walkable`);
    });
  }

  /**
   * Mark obstacles (walls, shelves) as unwalkable
   */
  markObstacles() {
    const { bounds } = this.shopMap;
    
    // Mark walls (lines from WALLS layer)
    if (this.shopMap.entities.lines) {
      this.shopMap.entities.lines.forEach(line => {
        if (line.layer === 'WALLS') {
          this.markLineAsObstacle(line);
        }
      });
    }
    
    // Mark wall polylines
    if (this.shopMap.entities.polylines) {
      this.shopMap.entities.polylines.forEach(poly => {
        if (poly.layer === 'WALLS') {
          this.markPolylineAsObstacle(poly);
        }
      });
    }
    
    // Mark shelves as obstacles
    if (this.shopMap.entities.shelves) {
      this.shopMap.entities.shelves.forEach(shelf => {
        this.markRectAsObstacle(shelf.bounds);
      });
    }
  }

  /**
   * Mark a line as obstacle in the grid
   */
  markLineAsObstacle(line) {
    const start = this.worldToGrid(line.start);
    const end = this.worldToGrid(line.end);
    
    // Bresenham's line algorithm to mark all cells along the line
    const cells = this.getLineCells(start.x, start.y, end.x, end.y);
    
    cells.forEach(cell => {
      if (this.isInBounds(cell.x, cell.y)) {
        // Mark a thicker line (mark surrounding cells too)
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            const nx = cell.x + dx;
            const ny = cell.y + dy;
            if (this.isInBounds(nx, ny)) {
              this.grid[ny][nx] = 0; // 0 = unwalkable
            }
          }
        }
      }
    });
  }

  /**
   * Mark a polyline as obstacle
   */
  markPolylineAsObstacle(poly) {
    for (let i = 0; i < poly.points.length - 1; i++) {
      const start = poly.points[i];
      const end = poly.points[i + 1];
      this.markLineAsObstacle({ start, end });
    }
    
    // Close the loop if closed
    if (poly.closed && poly.points.length > 2) {
      const start = poly.points[poly.points.length - 1];
      const end = poly.points[0];
      this.markLineAsObstacle({ start, end });
    }
  }

  /**
   * Mark a rectangular area as obstacle
   */
  markRectAsObstacle(bounds) {
    const topLeft = this.worldToGrid({ x: bounds.minX, y: bounds.minY });
    const bottomRight = this.worldToGrid({ x: bounds.maxX, y: bounds.maxY });
    
    for (let y = topLeft.y; y <= bottomRight.y; y++) {
      for (let x = topLeft.x; x <= bottomRight.x; x++) {
        if (this.isInBounds(x, y)) {
          this.grid[y][x] = 0; // 0 = unwalkable
        }
      }
    }
  }

  /**
   * Get all cells along a line using Bresenham's algorithm
   */
  getLineCells(x0, y0, x1, y1) {
    const cells = [];
    const dx = Math.abs(x1 - x0);
    const dy = Math.abs(y1 - y0);
    const sx = x0 < x1 ? 1 : -1;
    const sy = y0 < y1 ? 1 : -1;
    let err = dx - dy;
    
    let x = x0;
    let y = y0;
    
    while (true) {
      cells.push({ x, y });
      
      if (x === x1 && y === y1) break;
      
      const e2 = 2 * err;
      if (e2 > -dy) {
        err -= dy;
        x += sx;
      }
      if (e2 < dx) {
        err += dx;
        y += sy;
      }
    }
    
    return cells;
  }

  /**
   * Convert world coordinates to grid coordinates
   */
  worldToGrid(worldPos) {
    const { bounds } = this.shopMap;
    return {
      x: Math.floor((worldPos.x - bounds.minX) / this.gridSize),
      y: Math.floor((worldPos.y - bounds.minY) / this.gridSize)
    };
  }

  /**
   * Convert grid coordinates to world coordinates (center of cell)
   */
  gridToWorld(gridPos) {
    const { bounds } = this.shopMap;
    return {
      x: bounds.minX + (gridPos.x * this.gridSize) + (this.gridSize / 2),
      y: bounds.minY + (gridPos.y * this.gridSize) + (this.gridSize / 2)
    };
  }

  /**
   * Check if grid coordinates are within bounds
   */
  isInBounds(x, y) {
    return y >= 0 && y < this.grid.length && x >= 0 && x < this.grid[0].length;
  }

  /**
   * Find path between two world coordinates
   * @param {Object} startWorld - {x, y} in world coordinates
   * @param {Object} endWorld - {x, y} in world coordinates
   * @returns {Array} Array of {x, y} points in world coordinates, or null if no path
   */
  findPath(startWorld, endWorld) {
    if (!this.pfGrid) {
      console.error('Grid not initialized');
      return null;
    }
    
    // Convert to grid coordinates
    const startGrid = this.worldToGrid(startWorld);
    const endGrid = this.worldToGrid(endWorld);
    
    console.log('Finding path from', startGrid, 'to', endGrid);
    
    // Check if start and end are walkable
    if (!this.isInBounds(startGrid.x, startGrid.y) || this.grid[startGrid.y][startGrid.x] === 0) {
      console.warn('Start position is not walkable');
      return null;
    }
    
    if (!this.isInBounds(endGrid.x, endGrid.y) || this.grid[endGrid.y][endGrid.x] === 0) {
      console.warn('End position is not walkable');
      return null;
    }
    
    // Clone grid for this search (pathfinding modifies the grid)
    const gridClone = this.pfGrid.clone();
    
    // Use A* finder
    const finder = new PF.AStarFinder({
      allowDiagonal: true,
      dontCrossCorners: true
    });
    
    const pathGrid = finder.findPath(
      startGrid.x, startGrid.y,
      endGrid.x, endGrid.y,
      gridClone
    );
    
    if (pathGrid.length === 0) {
      console.warn('No path found');
      return null;
    }
    
    console.log(`Path found with ${pathGrid.length} points`);
    
    // Convert grid path back to world coordinates
    const pathWorld = pathGrid.map(([x, y]) => this.gridToWorld({ x, y }));
    
    return pathWorld;
  }

  /**
   * Check if a world position is walkable
   */
  isWalkable(worldPos) {
    const gridPos = this.worldToGrid(worldPos);
    if (!this.isInBounds(gridPos.x, gridPos.y)) {
      return false;
    }
    return this.grid[gridPos.y][gridPos.x] === 1;
  }

  /**
   * Get grid dimensions
   */
  getGridDimensions() {
    if (!this.grid) return null;
    return {
      rows: this.grid.length,
      cols: this.grid[0].length,
      cellSize: this.gridSize
    };
  }
}
