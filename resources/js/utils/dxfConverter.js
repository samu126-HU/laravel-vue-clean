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
      text: []
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
    
    // Extract lines
    dxfData.entities
      .filter(e => e.type === 'LINE')
      .forEach(line => {
        const start = transformPoint(line.vertices[0].x, line.vertices[0].y);
        const end = transformPoint(line.vertices[1].x, line.vertices[1].y);
        
        map.entities.lines.push({
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
        });
      });
    
    // Extract polylines (POLYLINE and LWPOLYLINE)
    dxfData.entities
      .filter(e => e.type === 'POLYLINE' || e.type === 'LWPOLYLINE')
      .forEach(poly => {
        map.entities.polylines.push({
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
        });
      });

    // Extract circles
    dxfData.entities
      .filter(e => e.type === 'CIRCLE')
      .forEach(circle => {
        const center = transformPoint(circle.center.x, circle.center.y);
        
        map.entities.circles.push({
          type: 'circle',
          center: {
            x: center.x,
            y: center.y,
            z: circle.center.z || 0
          },
          radius: circle.radius,
          layer: circle.layer || 'DEFAULT',
          color: circle.color
        });
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
