import Konva from 'konva';
import { isDarkMode } from './darkModeDetector';

/**
 * Get color for a specific layer based on dark mode
 * @param {string} layerName - The name of the layer
 * @returns {string} Color hex code for the layer
 */
export function getColors(layerName = null) {
  const isDark = isDarkMode();
  
  // If no layer specified, return color config object (for backward compatibility)
  if (layerName === null) {
    return {
      background: isDark ? '#0F172A' : '#F0F4F8',
      text: isDark ? '#f3f4f6' : '#000000',
      selected: isDark ? '#fbbf24' : '#f59e0b',
    };
  }
  
  // Layer-specific colors
  const layerColors = {
    'WALLS': isDark ? '#64748b' : '#334155',
    'SHELVES': isDark ? '#3b82f6' : '#0066cc',
    'DEFAULT': isDark ? '#9ca3af' : '#676c73',
  };
  
  // Return color for specific layer, or default if not found
  return layerColors[layerName] || layerColors['DEFAULT'];
}

/**
 * Render lines to a Konva layer
 * @param {Array} lines - Array of line entities
 * @param {Konva.Layer} layer - Konva layer to add shapes to
 * @param {Object} colors - Color configuration
 * @param {Object} strokeWidths - Stroke width configuration
 */
export function renderLines(lines, layer, colors, strokeWidths) {
  if (!lines) return;

  lines.forEach((line, index) => {
    const strokeColor = getColors(line.layer);
    
    const konvaLine = new Konva.Line({
      points: [line.start.x, line.start.y, line.end.x, line.end.y],
      stroke: strokeColor,
      strokeWidth: strokeWidths.lines,
      lineCap: 'round',
      name: 'line',
      id: `line-${index}`,
      data: { type: 'line', layer: line.layer, originalData: line }
    });

    layer.add(konvaLine);
  });
}

/**
 * Render polylines to a Konva layer
 * @param {Array} polylines - Array of polyline entities
 * @param {Konva.Layer} layer - Konva layer to add shapes to
 * @param {Object} colors - Color configuration
 * @param {Object} strokeWidths - Stroke width configuration
 */
export function renderPolylines(polylines, layer, colors, strokeWidths) {
  if (!polylines) return;

  polylines.forEach((poly, index) => {
    const points = poly.points.flatMap(p => [p.x, p.y]);
    const strokeColor = getColors(poly.layer);
    
    const konvaPoly = new Konva.Line({
      points: points,
      fill: strokeColor,
      fillOpacity: 0.4,
      stroke: strokeColor,
      strokeWidth: strokeWidths.polylines,
      closed: true,
      name: 'polyline',
      id: `poly-${index}`,
      data: { type: 'polyline', layer: poly.layer, originalData: poly }
    });

    layer.add(konvaPoly);
  });
}

/**
 * Render shelves to a Konva layer
 * @param {Array} shelves - Array of shelf entities
 * @param {Konva.Layer} layer - Konva layer to add shapes to
 * @param {Object} colors - Color configuration
 * @param {Object} strokeWidths - Stroke width configuration
 * @param {Function} makeInteractive - Function to make shapes interactive
 */
export function renderShelves(shelves, layer, colors, strokeWidths, makeInteractive) {
  if (!shelves) return;

  shelves.forEach((shelf) => {
    // Create a group for each shelf so all its parts act as one object
    const shelfGroup = new Konva.Group({
      name: 'shelf',
      id: `shelf-${shelf.id}`,
      data: { 
        type: 'shelf', 
        layer: 'SHELVES',
        shelfId: shelf.id,
        bounds: shelf.bounds,
        originalData: shelf 
      }
    });

    // Add an invisible background rectangle to make the entire area clickable
    const bgRect = new Konva.Rect({
      x: shelf.bounds.minX,
      y: shelf.bounds.minY,
      width: shelf.bounds.width,
      height: shelf.bounds.height,
      fill: 'transparent',
      name: 'shelf-bg'
    });
    shelfGroup.add(bgRect);

    // Add all lines in this shelf to the group
    const shelfColor = getColors('SHELVES');
    shelf.lines.forEach((line, lineIndex) => {
      const konvaLine = new Konva.Line({
        points: [line.start.x, line.start.y, line.end.x, line.end.y],
        stroke: shelfColor,
        strokeWidth: strokeWidths.lines,
        lineCap: 'round',
        name: 'shelf-line',
        id: `shelf-${shelf.id}-line-${lineIndex}`
      });
      shelfGroup.add(konvaLine);
    });

    // Add all polylines in this shelf to the group
    shelf.polylines.forEach((poly, polyIndex) => {
      const points = poly.points.flatMap(p => [p.x, p.y]);
      const konvaPoly = new Konva.Line({
        points: points,
        fill: shelfColor,
        fillOpacity: 0.4,
        stroke: shelfColor,
        strokeWidth: strokeWidths.polylines,
        closed: true,
        name: 'shelf-poly',
        id: `shelf-${shelf.id}-poly-${polyIndex}`
      });
      shelfGroup.add(konvaPoly);
    });

    // Make the entire group interactive
    if (makeInteractive) {
      makeInteractive(shelfGroup);
    }
    
    layer.add(shelfGroup);
  });
}

/**
 * Render circles to a Konva layer
 * @param {Array} circles - Array of circle entities
 * @param {Konva.Layer} layer - Konva layer to add shapes to
 * @param {Object} colors - Color configuration
 * @param {Object} strokeWidths - Stroke width configuration
 */
export function renderCircles(circles, layer, colors, strokeWidths) {
  if (!circles) return;

  circles.forEach((circle, index) => {
    const strokeColor = getColors(circle.layer);
    
    const konvaCircle = new Konva.Circle({
      x: circle.center.x,
      y: circle.center.y,
      radius: circle.radius,
      stroke: strokeColor,
      strokeWidth: strokeWidths.circles,
      name: 'circle',
      id: `circle-${index}`,
      data: { type: 'circle', layer: circle.layer, originalData: circle }
    });

    layer.add(konvaCircle);
  });
}

/**
 * Render arcs to a Konva layer
 * @param {Array} arcs - Array of arc entities
 * @param {Konva.Layer} layer - Konva layer to add shapes to
 * @param {Object} colors - Color configuration
 * @param {Object} strokeWidths - Stroke width configuration
 */
export function renderArcs(arcs, layer, colors, strokeWidths) {
  if (!arcs) return;

  arcs.forEach((arc, index) => {
    const strokeColor = getColors(arc.layer);
    
    const konvaArc = new Konva.Arc({
      x: arc.center.x,
      y: arc.center.y,
      innerRadius: 0,
      outerRadius: arc.radius,
      angle: arc.endAngle - arc.startAngle,
      rotation: arc.startAngle,
      stroke: strokeColor,
      strokeWidth: strokeWidths.arcs,
      name: 'arc',
      id: `arc-${index}`,
      data: { type: 'arc', layer: arc.layer, originalData: arc }
    });

    layer.add(konvaArc);
  });
}

/**
 * Render text to a Konva layer
 * @param {Array} texts - Array of text entities
 * @param {Konva.Layer} layer - Konva layer to add shapes to
 * @param {Object} colors - Color configuration
 */
export function renderText(texts, layer, colors) {
  if (!texts) return;

  texts.forEach((text, index) => {
    const textColor = getColors().text;
    
    const konvaText = new Konva.Text({
      x: text.position.x,
      y: text.position.y,
      text: text.text,
      fontSize: text.height || 16,
      fill: textColor,
      fontStyle: 'bold',
      name: 'text',
      id: `text-${index}`,
      offsetX: 0,
      offsetY: text.height ? text.height / 2 : 8
    });

    layer.add(konvaText);
  });
}

/**
 * Update shape colors for hover state
 * @param {Konva.Shape|Konva.Group} shape - Shape to update
 * @param {Object} colors - Color configuration
 * @param {Object} strokeWidths - Stroke width configuration
 * @param {boolean} isHover - Whether to apply hover state
 */
export function updateShapeColors(shape, colors, strokeWidths, isHover = true) {
  const colorConfig = getColors();
  
  if (shape.getType() === 'Group') {
    shape.getChildren().forEach(child => {
      if (child.name() === 'shelf-bg') return; // Skip invisible background
      
      if (isHover) {
        child.strokeWidth((child.attrs.strokeWidth || strokeWidths.lines) * 1.5);
      } else {
        child.strokeWidth((child.attrs.strokeWidth || strokeWidths.lines) / 1.5);
      }
    });
  } else {
    if (isHover) {
      shape.stroke(colorConfig.hover);
      shape.strokeWidth(strokeWidths[shape.attrs.data.type + 's'] * 1.5);
    } else {
      const originalColor = getColors(shape.attrs.data.layer);
      shape.stroke(originalColor);
      shape.strokeWidth(strokeWidths[shape.attrs.data.type + 's']);
    }
  }
}

/**
 * Update shape colors for selected state
 * @param {Konva.Shape|Konva.Group} shape - Shape to update
 * @param {Object} colors - Color configuration
 * @param {Object} strokeWidths - Stroke width configuration
 * @param {boolean} isSelected - Whether to apply selected state
 */
export function updateShapeSelection(shape, colors, strokeWidths, isSelected = true) {
  const colorConfig = getColors();
  
  if (shape.getType() === 'Group') {
    shape.getChildren().forEach(child => {
      if (child.name() === 'shelf-bg') return; // Skip invisible background
      
      if (isSelected) {
        child.stroke(colorConfig.selected);
        child.strokeWidth((child.attrs.strokeWidth || strokeWidths.lines) * 2);
      } else {
        child.stroke(getColors('SHELVES'));
        child.strokeWidth((child.attrs.strokeWidth || strokeWidths.lines) / 2);
      }
    });
  } else {
    if (isSelected) {
      shape.stroke(colorConfig.selected);
      shape.strokeWidth(strokeWidths[shape.attrs.data.type + 's'] * 2);
    } else {
      const originalColor = getColors(shape.attrs.data.layer);
      shape.stroke(originalColor);
      shape.strokeWidth(strokeWidths[shape.attrs.data.type + 's']);
    }
  }
}

/**
 * Render a pathfinding route on the map
 * @param {Array} pathPoints - Array of {x, y} points in world coordinates
 * @param {Konva.Layer} layer - Konva layer to add the path to
 * @param {Object} options - Rendering options
 */
export function renderPath(pathPoints, layer, options = {}) {
  if (!pathPoints || pathPoints.length === 0) return;

  const {
    color = '#10B981', // Emerald green
    strokeWidth = 5,
    dash = [15, 10],
    opacity = 0.8,
    animated = false
  } = options;

  // Create the path line
  const points = pathPoints.flatMap(p => [p.x, p.y]);
  
  const pathLine = new Konva.Line({
    points: points,
    stroke: color,
    strokeWidth: strokeWidth,
    dash: dash,
    lineCap: 'round',
    lineJoin: 'round',
    opacity: opacity,
    name: 'route-path',
    id: 'route-path'
  });

  // Add start marker (circle)
  const startMarker = new Konva.Circle({
    x: pathPoints[0].x,
    y: pathPoints[0].y,
    radius: 8,
    fill: '#3b82f6', // Blue
    stroke: '#ffffff',
    strokeWidth: 2,
    name: 'route-start',
    id: 'route-start'
  });

  // Add end marker (circle)
  const endMarker = new Konva.Circle({
    x: pathPoints[pathPoints.length - 1].x,
    y: pathPoints[pathPoints.length - 1].y,
    radius: 8,
    fill: '#ef4444', // Red
    stroke: '#ffffff',
    strokeWidth: 2,
    name: 'route-end',
    id: 'route-end'
  });

  layer.add(pathLine);
  layer.add(startMarker);
  layer.add(endMarker);

  // Animate the dash if requested
if (animated) {
    let dashOffset = 0;
    const anim = new Konva.Animation(() => {
        dashOffset += 3;
        pathLine.dashOffset(dashOffset);
    }, layer);
    anim.start();
    
    // Store animation reference for cleanup
    pathLine.animation = anim;
  }

  return { pathLine, startMarker, endMarker };
}

/**
 * Clear all route visualizations from the layer
 * @param {Konva.Layer} layer - Konva layer to clear routes from
 */
export function clearPaths(layer) {
  const routeElements = layer.find(node => {
    return node.name() && node.name().startsWith('route-');
  });

  routeElements.forEach(element => {
    // Stop any animations
    if (element.animation) {
      element.animation.stop();
    }
    element.destroy();
  });
}
