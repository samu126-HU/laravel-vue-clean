import DxfParser from "dxf-parser";

/**
 * Parse a DXF file content string
 * @param {string} fileContent - Raw DXF file content as text
 * @returns {object|null} Parsed DXF data or null on error
 */
export function parseDxfFile(fileContent) {
  const parser = new DxfParser();
  
  try {
    const dxf = parser.parseSync(fileContent);
    return dxf;
  } catch (err) {
    console.error('Error parsing DXF:', err);
    return null;
  }
}

/**
 * Transform point to correct orientation
 * Fixes: vertical mirror + 90° right rotation
 * Solution: Flip Y, then rotate -90°
 */
function transformPoint(x, y) {
  // First flip Y axis (un-mirror vertically)
  const flippedY = -y;
  
  // Then rotate -90 degrees (turn left 90°)
  // Rotation matrix: x' = x*cos(θ) - y*sin(θ), y' = x*sin(θ) + y*cos(θ)
  // For -90°: cos(-90°) = 0, sin(-90°) = -1
  // x' = x*0 - y*(-1) = y
  // y' = x*(-1) + y*0 = -x
  return {
    x: flippedY,
    y: -x
  };
}

/**
 * ShopMap class to store and manage shop floor plan data
 */
export class ShopMap {
  constructor() {
    this.bounds = { 
      minX: Infinity, 
      maxX: -Infinity, 
      minY: Infinity, 
      maxY: -Infinity, 
      width: 0, 
      height: 0 
    };
    this.layers = {}; // Organized by layer name
    this.entities = {
      lines: [],
      polylines: [],
      circles: [],
      arcs: [],
      text: [],
      shelves: [], // Grouped connected lines/polylines
      splitters: [], // Lines from SPLITTER layer to divide shelves
      startPoint: null, // Navigation start point from START layer
      endPoint: null // Navigation end point from END layer
    };
  }

  /**
   * Calculate bounding box for all entities
   */
  calculateBounds() {
    const allPoints = [];

    // Collect all points from lines
    this.entities.lines.forEach(line => {
      allPoints.push(line.start, line.end);
    });

    // Collect all points from polylines
    this.entities.polylines.forEach(poly => {
      allPoints.push(...poly.points);
    });

    // Collect all points from shelves
    this.entities.shelves.forEach(shelf => {
      shelf.lines.forEach(line => {
        allPoints.push(line.start, line.end);
      });
      shelf.polylines.forEach(poly => {
        allPoints.push(...poly.points);
      });
    });

    // Include splitters in bounds calculation
    if (this.entities.splitters) {
      this.entities.splitters.forEach(splitter => {
        allPoints.push(splitter.start, splitter.end);
      });
    }

    // Calculate bounds
    allPoints.forEach(point => {
      this.bounds.minX = Math.min(this.bounds.minX, point.x);
      this.bounds.maxX = Math.max(this.bounds.maxX, point.x);
      this.bounds.minY = Math.min(this.bounds.minY, point.y);
      this.bounds.maxY = Math.max(this.bounds.maxY, point.y);
    });

    this.bounds.width = this.bounds.maxX - this.bounds.minX;
    this.bounds.height = this.bounds.maxY - this.bounds.minY;
  }

  /**
   * Group connected lines and polylines into shelf objects
   * @param {Array} lines - Lines to group
   * @param {Array} polylines - Polylines to group
   * @returns {Array} Array of shelf objects
   */
  groupConnectedEntities(lines, polylines) {
    const TOLERANCE = 0.1; // Distance threshold for considering points connected
    
    const arePointsClose = (p1, p2) => {
      const dx = p1.x - p2.x;
      const dy = p1.y - p2.y;
      return Math.sqrt(dx * dx + dy * dy) < TOLERANCE;
    };

    const shelves = [];
    const usedLines = new Set();
    const usedPolys = new Set();

    // Helper to find connected entities
    const findConnected = (startLines, startPolys) => {
      const shelfLines = [...startLines];
      const shelfPolys = [...startPolys];
      const endpoints = [];

      // Collect all endpoints from starting entities
      startLines.forEach(line => {
        endpoints.push(line.start, line.end);
      });
      startPolys.forEach(poly => {
        endpoints.push(...poly.points);
      });

      let foundNew = true;
      while (foundNew) {
        foundNew = false;

        // Check remaining lines
        for (let i = 0; i < lines.length; i++) {
          if (usedLines.has(i)) continue;
          
          const line = lines[i];
          const isConnected = endpoints.some(ep => 
            arePointsClose(ep, line.start) || arePointsClose(ep, line.end)
          );

          if (isConnected) {
            shelfLines.push(line);
            endpoints.push(line.start, line.end);
            usedLines.add(i);
            foundNew = true;
          }
        }

        // Check remaining polylines
        for (let i = 0; i < polylines.length; i++) {
          if (usedPolys.has(i)) continue;
          
          const poly = polylines[i];
          const isConnected = endpoints.some(ep => 
            poly.points.some(p => arePointsClose(ep, p))
          );

          if (isConnected) {
            shelfPolys.push(poly);
            endpoints.push(...poly.points);
            usedPolys.add(i);
            foundNew = true;
          }
        }
      }

      return { lines: shelfLines, polylines: shelfPolys };
    };

    // Start with each unused line
    for (let i = 0; i < lines.length; i++) {
      if (usedLines.has(i)) continue;
      
      usedLines.add(i);
      const connected = findConnected([lines[i]], []);
      
      if (connected.lines.length > 0 || connected.polylines.length > 0) {
        shelves.push({
          type: 'shelf',
          id: shelves.length,
          lines: connected.lines,
          polylines: connected.polylines,
          bounds: this.calculateShelfBounds(connected)
        });
      }
    }

    // Start with each unused polyline
    for (let i = 0; i < polylines.length; i++) {
      if (usedPolys.has(i)) continue;
      
      usedPolys.add(i);
      const connected = findConnected([], [polylines[i]]);
      
      if (connected.lines.length > 0 || connected.polylines.length > 0) {
        shelves.push({
          type: 'shelf',
          id: shelves.length,
          lines: connected.lines,
          polylines: connected.polylines,
          bounds: this.calculateShelfBounds(connected)
        });
      }
    }

    return shelves;
  }

  /**
   * Calculate bounding box for a shelf
   * @param {Object} shelf - Shelf with lines and polylines
   * @returns {Object} Bounds {minX, maxX, minY, maxY, width, height}
   */
  calculateShelfBounds(shelf) {
    const bounds = {
      minX: Infinity,
      maxX: -Infinity,
      minY: Infinity,
      maxY: -Infinity
    };

    const updateBounds = (point) => {
      bounds.minX = Math.min(bounds.minX, point.x);
      bounds.maxX = Math.max(bounds.maxX, point.x);
      bounds.minY = Math.min(bounds.minY, point.y);
      bounds.maxY = Math.max(bounds.maxY, point.y);
    };

    shelf.lines.forEach(line => {
      updateBounds(line.start);
      updateBounds(line.end);
    });

    shelf.polylines.forEach(poly => {
      poly.points.forEach(updateBounds);
    });

    bounds.width = bounds.maxX - bounds.minX;
    bounds.height = bounds.maxY - bounds.minY;
    bounds.centerX = (bounds.minX + bounds.maxX) / 2;
    bounds.centerY = (bounds.minY + bounds.maxY) / 2;

    return bounds;
  }

  /**
   * Apply splitter lines to shelves to create sub-sections
   */
  applySplittersToShelves() {
    if (!this.entities.splitters || this.entities.splitters.length === 0) {
      return;
    }

    const newShelves = [];
    
    this.entities.shelves.forEach(shelf => {
      // Find splitters that intersect this shelf's bounding box
      const intersectingSplitters = this.entities.splitters.filter(splitter => 
        this.splitterIntersectsShelf(splitter, shelf.bounds)
      );

      if (intersectingSplitters.length === 0) {
        // No splitters, keep shelf as is
        newShelves.push(shelf);
      } else {
        // Split the shelf based on splitter lines
        const subShelves = this.splitShelfBySplitters(shelf, intersectingSplitters);
        newShelves.push(...subShelves);
      }
    });

    // Replace shelves with split versions (keep original IDs)
    this.entities.shelves = newShelves;

    console.log(`Processed splitters: original ${this.entities.shelves.length} shelves, after split: ${newShelves.length} sections`);
  }

  /**
   * Check if a splitter line intersects a shelf's bounding box
   */
  splitterIntersectsShelf(splitter, bounds) {
    const { start, end } = splitter;
    const { minX, maxX, minY, maxY } = bounds;

    // Expand bounds with larger tolerance to catch touching lines
    const tolerance = 10;
    const expandedBounds = {
      minX: minX - tolerance,
      maxX: maxX + tolerance,
      minY: minY - tolerance,
      maxY: maxY + tolerance
    };

    // Check if either endpoint is inside or near bounds
    const startNear = start.x >= expandedBounds.minX && start.x <= expandedBounds.maxX &&
                      start.y >= expandedBounds.minY && start.y <= expandedBounds.maxY;
    const endNear = end.x >= expandedBounds.minX && end.x <= expandedBounds.maxX &&
                    end.y >= expandedBounds.minY && end.y <= expandedBounds.maxY;

    if (startNear || endNear) return true;

    // Check if line crosses the shelf bounds
    return this.lineIntersectsRect(start, end, expandedBounds);
  }

  /**
   * Check if a line intersects a rectangle
   */
  lineIntersectsRect(start, end, rect) {
    // Check intersection with each edge of the rectangle
    const edges = [
      { start: { x: rect.minX, y: rect.minY }, end: { x: rect.maxX, y: rect.minY } }, // bottom
      { start: { x: rect.maxX, y: rect.minY }, end: { x: rect.maxX, y: rect.maxY } }, // right
      { start: { x: rect.maxX, y: rect.maxY }, end: { x: rect.minX, y: rect.maxY } }, // top
      { start: { x: rect.minX, y: rect.maxY }, end: { x: rect.minX, y: rect.minY } }  // left
    ];

    return edges.some(edge => this.linesIntersect(start, end, edge.start, edge.end));
  }

  /**
   * Check if two line segments intersect
   */
  linesIntersect(p1, p2, p3, p4) {
    const ccw = (a, b, c) => {
      return (c.y - a.y) * (b.x - a.x) > (b.y - a.y) * (c.x - a.x);
    };
    return ccw(p1, p3, p4) !== ccw(p2, p3, p4) && ccw(p1, p2, p3) !== ccw(p1, p2, p4);
  }

  /**
   * Split a shelf into sub-shelves based on splitter lines
   */
  splitShelfBySplitters(shelf, splitters) {
    console.log(`Splitting shelf ${shelf.id} with ${splitters.length} splitters`);
    console.log('Shelf has:', shelf.lines?.length || 0, 'lines,', shelf.polylines?.length || 0, 'polylines');
    
    const bounds = shelf.bounds;
    const subShelves = [];

    // Determine split orientation (vertical or horizontal)
    const isVerticalSplit = splitters.some(s => 
      Math.abs(s.end.y - s.start.y) > Math.abs(s.end.x - s.start.x)
    );

    console.log(`Split orientation: ${isVerticalSplit ? 'VERTICAL' : 'HORIZONTAL'}`);

    if (isVerticalSplit) {
      // Sort splitters left to right
      splitters.sort((a, b) => Math.min(a.start.x, a.end.x) - Math.min(b.start.x, b.end.x));
      
      let prevX = bounds.minX;
      
      splitters.forEach((splitter, index) => {
        const splitX = (splitter.start.x + splitter.end.x) / 2;
        
        // Filter lines that belong to this section
        const sectionLines = shelf.lines.filter(line => {
          const lineMinX = Math.min(line.start.x, line.end.x);
          const lineMaxX = Math.max(line.start.x, line.end.x);
          const lineCenterX = (lineMinX + lineMaxX) / 2;
          return lineCenterX >= prevX && lineCenterX < splitX;
        });
        
        const sectionPolylines = shelf.polylines.filter(poly => {
          const polyCenterX = poly.points.reduce((sum, p) => sum + p.x, 0) / poly.points.length;
          return polyCenterX >= prevX && polyCenterX < splitX;
        });
        
        if (sectionLines.length > 0 || sectionPolylines.length > 0) {
          subShelves.push({
            ...shelf,
            id: `${shelf.id}-split-${index}`,
            originalId: shelf.id,
            isSplit: true,
            splitIndex: index,
            lines: sectionLines,
            polylines: sectionPolylines,
            bounds: {
              minX: prevX,
              maxX: splitX,
              minY: bounds.minY,
              maxY: bounds.maxY,
              width: splitX - prevX,
              height: bounds.height,
              centerX: (prevX + splitX) / 2,
              centerY: bounds.centerY
            }
          });
        }
        
        prevX = splitX;
      });
      
      // Add remaining section
      const remainingLines = shelf.lines.filter(line => {
        const lineMinX = Math.min(line.start.x, line.end.x);
        const lineMaxX = Math.max(line.start.x, line.end.x);
        const lineCenterX = (lineMinX + lineMaxX) / 2;
        return lineCenterX >= prevX;
      });
      
      const remainingPolylines = shelf.polylines.filter(poly => {
        const polyCenterX = poly.points.reduce((sum, p) => sum + p.x, 0) / poly.points.length;
        return polyCenterX >= prevX;
      });
      
      if (remainingLines.length > 0 || remainingPolylines.length > 0) {
        subShelves.push({
          ...shelf,
          id: `${shelf.id}-split-${splitters.length}`,
          originalId: shelf.id,
          isSplit: true,
          splitIndex: splitters.length,
          lines: remainingLines,
          polylines: remainingPolylines,
          bounds: {
            minX: prevX,
            maxX: bounds.maxX,
            minY: bounds.minY,
            maxY: bounds.maxY,
            width: bounds.maxX - prevX,
            height: bounds.height,
            centerX: (prevX + bounds.maxX) / 2,
            centerY: bounds.centerY
          }
        });
      }
    } else {
      // Horizontal split (top to bottom)
      splitters.sort((a, b) => Math.min(a.start.y, a.end.y) - Math.min(b.start.y, b.end.y));
      
      let prevY = bounds.minY;
      
      splitters.forEach((splitter, index) => {
        const splitY = (splitter.start.y + splitter.end.y) / 2;
        
        const sectionLines = shelf.lines.filter(line => {
          const lineMinY = Math.min(line.start.y, line.end.y);
          const lineMaxY = Math.max(line.start.y, line.end.y);
          const lineCenterY = (lineMinY + lineMaxY) / 2;
          return lineCenterY >= prevY && lineCenterY < splitY;
        });
        
        const sectionPolylines = shelf.polylines.filter(poly => {
          const polyCenterY = poly.points.reduce((sum, p) => sum + p.y, 0) / poly.points.length;
          return polyCenterY >= prevY && polyCenterY < splitY;
        });
        
        if (sectionLines.length > 0 || sectionPolylines.length > 0) {
          subShelves.push({
            ...shelf,
            id: `${shelf.id}-split-${index}`,
            originalId: shelf.id,
            isSplit: true,
            splitIndex: index,
            lines: sectionLines,
            polylines: sectionPolylines,
            bounds: {
              minX: bounds.minX,
              maxX: bounds.maxX,
              minY: prevY,
              maxY: splitY,
              width: bounds.width,
              height: splitY - prevY,
              centerX: bounds.centerX,
              centerY: (prevY + splitY) / 2
            }
          });
        }
        
        prevY = splitY;
      });
      
      // Add remaining section
      const remainingLines = shelf.lines.filter(line => {
        const lineMinY = Math.min(line.start.y, line.end.y);
        const lineMaxY = Math.max(line.start.y, line.end.y);
        const lineCenterY = (lineMinY + lineMaxY) / 2;
        return lineCenterY >= prevY;
      });
      
      const remainingPolylines = shelf.polylines.filter(poly => {
        const polyCenterY = poly.points.reduce((sum, p) => sum + p.y, 0) / poly.points.length;
        return polyCenterY >= prevY;
      });
      
      if (remainingLines.length > 0 || remainingPolylines.length > 0) {
        subShelves.push({
          ...shelf,
          id: `${shelf.id}-split-${splitters.length}`,
          originalId: shelf.id,
          isSplit: true,
          splitIndex: splitters.length,
          lines: remainingLines,
          polylines: remainingPolylines,
          bounds: {
            minX: bounds.minX,
            maxX: bounds.maxX,
            minY: prevY,
            maxY: bounds.maxY,
            width: bounds.width,
            height: bounds.maxY - prevY,
            centerX: bounds.centerX,
            centerY: (prevY + bounds.maxY) / 2
          }
        });
      }
    }

    console.log(`Created ${subShelves.length} sub-shelves from shelf ${shelf.id}`);
    return subShelves.length > 0 ? subShelves : [shelf];
  }

  /**
   * Organize entities by layer
   */
  organizeByLayer() {
    // Group lines by layer
    this.entities.lines.forEach(line => {
      if (!this.layers[line.layer]) {
        this.layers[line.layer] = { lines: [], polylines: [], text: [] };
      }
      this.layers[line.layer].lines.push(line);
    });

    // Group polylines by layer
    this.entities.polylines.forEach(poly => {
      if (!this.layers[poly.layer]) {
        this.layers[poly.layer] = { lines: [], polylines: [], text: [] };
      }
      this.layers[poly.layer].polylines.push(poly);
    });

    // Group text by layer
    this.entities.text.forEach(text => {
      if (!this.layers[text.layer]) {
        this.layers[text.layer] = { lines: [], polylines: [], text: [] };
      }
      this.layers[text.layer].text.push(text);
    });
  }

  /**
   * Create ShopMap from parsed DXF data
   * @param {object} dxfData - Parsed DXF data from parseDxfFile
   * @returns {ShopMap} New ShopMap instance
   */
  static fromDXF(dxfData) {
    if (!dxfData || !dxfData.entities) {
      console.error('Invalid DXF data');
      return null;
    }

    const map = new ShopMap();
    const shelfLines = [];
    const shelfPolylines = [];
    const splitterLines = [];
    let startPoint = null;
    let endPoint = null;
    
    // Extract lines
    dxfData.entities
      .filter(e => e.type === 'LINE')
      .forEach(line => {
        const start = transformPoint(line.vertices[0].x, line.vertices[0].y);
        const end = transformPoint(line.vertices[1].x, line.vertices[1].y);
        
        const lineData = {
          type: 'line',
          start: { 
            x: start.x, 
            y: start.y, 
            z: line.vertices[0].z || 0 
          },
          end: { 
            x: end.x, 
            y: end.y, 
            z: line.vertices[1].z || 0 
          },
          layer: line.layer || 'DEFAULT',
          color: line.color
        };

        // Separate SPLITTER layer lines
        if (line.layer === 'SPLITTER') {
          splitterLines.push(lineData);
        }
        // Extract START point (use midpoint of line)
        else if (line.layer === 'START') {
          const midX = (lineData.start.x + lineData.end.x) / 2;
          const midY = (lineData.start.y + lineData.end.y) / 2;
          startPoint = { x: midX, y: midY };
          console.log('Found START point at:', startPoint);
        }
        // Extract END point (use midpoint of line)
        else if (line.layer === 'END') {
          const midX = (lineData.start.x + lineData.end.x) / 2;
          const midY = (lineData.start.y + lineData.end.y) / 2;
          endPoint = { x: midX, y: midY };
          console.log('Found END point at:', endPoint);
        }
        // Separate SHELVES layer lines for grouping
        else if (line.layer === 'SHELVES') {
          shelfLines.push(lineData);
        } else {
          map.entities.lines.push(lineData);
        }
      });
    
    // Extract polylines (POLYLINE and LWPOLYLINE)
    dxfData.entities
      .filter(e => e.type === 'POLYLINE' || e.type === 'LWPOLYLINE')
      .forEach(poly => {
        const polyData = {
          type: 'polyline',
          points: poly.vertices.map(v => {
            const point = transformPoint(v.x, v.y);
            return {
              x: point.x,
              y: point.y,
              z: v.z || 0
            };
          }),
          closed: poly.shape || false,
          layer: poly.layer || 'DEFAULT',
          color: poly.color
        };

        // Separate SHELVES layer polylines for grouping
        if (poly.layer === 'SHELVES') {
          shelfPolylines.push(polyData);
        } else {
          map.entities.polylines.push(polyData);
        }
      });

    // Group SHELVES layer entities into connected shelf objects
    if (shelfLines.length > 0 || shelfPolylines.length > 0) {
      map.entities.shelves = map.groupConnectedEntities(shelfLines, shelfPolylines);
      console.log(`Grouped ${shelfLines.length} lines and ${shelfPolylines.length} polylines into ${map.entities.shelves.length} shelves`);
    }

    // Store splitter lines
    if (splitterLines.length > 0) {
      map.entities.splitters = splitterLines;
      console.log(`Found ${splitterLines.length} splitter lines`);
      
      // Apply splitters to shelves to create sub-sections
      map.applySplittersToShelves();
    }

    // Extract circles
    dxfData.entities
      .filter(e => e.type === 'CIRCLE')
      .forEach(circle => {
        const center = transformPoint(circle.center.x, circle.center.y);
        
        const circleData = {
          type: 'circle',
          center: {
            x: center.x,
            y: center.y,
            z: circle.center.z || 0
          },
          radius: circle.radius,
          layer: circle.layer || 'DEFAULT',
          color: circle.color
        };
        
        // Extract START point from circle center
        if (circle.layer === 'START') {
          startPoint = { x: center.x, y: center.y };
          console.log('Found START point (circle) at:', startPoint);
        }
        // Extract END point from circle center
        else if (circle.layer === 'END') {
          endPoint = { x: center.x, y: center.y };
          console.log('Found END point (circle) at:', endPoint);
        } else {
          map.entities.circles.push(circleData);
        }
      });

    // Extract arcs
    dxfData.entities
      .filter(e => e.type === 'ARC')
      .forEach(arc => {
        const center = transformPoint(arc.center.x, arc.center.y);
        
        // Adjust angles for -90° rotation: subtract 90 degrees
        const startAngle = arc.startAngle - 90;
        const endAngle = arc.endAngle - 90;
        
        map.entities.arcs.push({
          type: 'arc',
          center: {
            x: center.x,
            y: center.y,
            z: arc.center.z || 0
          },
          radius: arc.radius,
          startAngle: startAngle,
          endAngle: endAngle,
          layer: arc.layer || 'DEFAULT',
          color: arc.color
        });
      });

    // Extract text
    dxfData.entities
      .filter(e => e.type === 'TEXT' || e.type === 'MTEXT')
      .forEach(text => {
        const x = text.startPoint?.x || text.position?.x || 0;
        const y = text.startPoint?.y || text.position?.y || 0;
        const position = transformPoint(x, y);
        
        map.entities.text.push({
          type: 'text',
          text: text.text,
          position: {
            x: position.x,
            y: position.y,
            z: text.startPoint?.z || text.position?.z || 0
          },
          height: text.textHeight || text.height || 12,
          layer: text.layer || 'DEFAULT'
        });
      });
    
    // Calculate bounds and organize
    map.calculateBounds();
    map.organizeByLayer();
    
    // Store start and end points
    map.entities.startPoint = startPoint;
    map.entities.endPoint = endPoint;
    
    if (startPoint) {
      console.log('Navigation START point set:', startPoint);
    } else {
      console.warn('No START point found in DXF (add a circle or line on START layer)');
    }
    
    if (endPoint) {
      console.log('Navigation END point set:', endPoint);
    } else {
      console.warn('No END point found in DXF (add a circle or line on END layer)');
    }
    
    return map;
  }

  /**
   * Create ShopMap directly from DXF file content
   * @param {string} fileContent - Raw DXF file content
   * @returns {ShopMap} New ShopMap instance
   */
  static fromDXFFile(fileContent) {
    const dxfData = parseDxfFile(fileContent);
    return ShopMap.fromDXF(dxfData);
  }

  /**
   * Convert to JSON for serialization
   * @returns {object} JSON representation
   */
  toJSON() {
    return {
      bounds: this.bounds,
      layers: this.layers,
      entities: this.entities
    };
  }
}
