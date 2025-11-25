<script setup>
import { ref, computed, watch } from 'vue';
import { useDarkMode } from '../composables/useDarkMode';

const props = defineProps({
  shopMap: {
    type: Object,
    required: true
  }
});

const { isDark } = useDarkMode();

const colors = computed(() => ({
  walls: isDark.value ? '#e5e7eb' : '#000000',
  lines: isDark.value ? '#9ca3af' : '#999999',
  shelves: isDark.value ? '#3b82f6' : '#0066cc',
  shelvesAlt: isDark.value ? '#6b7280' : '#666666',
  circles: isDark.value ? '#9ca3af' : '#666666',
  arcs: isDark.value ? '#9ca3af' : '#666666',
  text: isDark.value ? '#f3f4f6' : '#000000',
  background: isDark.value ? '#1f2937' : 'transparent'
}));

const strokeWidths = {
  lines: 10,
  polylines: 10,
  circles: 10,
  arcs: 10
};

const svgContent = ref('');
const svgContainer = ref(null);
const zoom = ref(1);
const panX = ref(0);
const panY = ref(0);
const isDragging = ref(false);
const dragStart = ref({ x: 0, y: 0 });

const ZOOM_MIN = 0.1;
const ZOOM_MAX = 5;
const ZOOM_STEP = 1.2;
const ZOOM_WHEEL_STEP = 0.9;

const transform = computed(() => 
  `translate(${panX.value}px, ${panY.value}px) scale(${zoom.value})`
);

watch(
  () => props.shopMap, 
  (newMap) => {
    if (newMap) {
      generateSVG(newMap);
    }
  }, 
  { immediate: true, deep: true }
);

function generateSVG(map) {
  if (!map?.bounds) return;

  const svg = buildSvgDocument(map);
  svgContent.value = svg;
}

function buildSvgDocument(map) {
  const { viewBox, background } = calculateViewBox(map.bounds);
  
  let svg = `<svg viewBox="${viewBox}" xmlns="http://www.w3.org/2000/svg" style="width: 100%; height: 100%;">`;
  svg += background;
  svg += renderEntities(map.entities);
  svg += '</svg>';
  
  return svg;
}

function calculateViewBox(bounds) {
  const padding = 20;
  const width = bounds.width + padding * 2;
  const height = bounds.height + padding * 2;
  
  return {
    viewBox: `${bounds.minX - padding} ${bounds.minY - padding} ${width} ${height}`,
    background: `<rect x="${bounds.minX - padding}" y="${bounds.minY - padding}" width="${width}" height="${height}" fill="${colors.value.background}"/>`
  };
}

function renderEntities(entities) {
  if (!entities) return '';

  let svg = '';
  svg += renderLines(entities.lines);
  svg += renderPolylines(entities.polylines);
  svg += renderCircles(entities.circles);
  svg += renderArcs(entities.arcs);
  svg += renderText(entities.text);
  
  return svg;
}

function renderLines(lines) {
  if (!lines) return '';

  return lines.map(line => {
    const color = line.layer === 'SHELVES' ? colors.value.shelves : colors.value.lines;
    return `<line x1="${line.start.x}" y1="${line.start.y}" x2="${line.end.x}" y2="${line.end.y}" stroke="${color}" stroke-width="${strokeWidths.lines}" stroke-linecap="round"/>`;
  }).join('');
}

function renderPolylines(polylines) {
  if (!polylines) return '';

  return polylines.map(poly => {
    const points = poly.points.map(p => `${p.x},${p.y}`).join(' ');
    const color = poly.layer === 'SHELVES' ? colors.value.shelves : colors.value.lines;
    return `<polygon points="${points}" fill="${color}" fill-opacity="0.4" stroke="${color}" stroke-width="${strokeWidths.polylines}"/>`;
  }).join('');
}

function renderCircles(circles) {
  if (!circles) return '';

  return circles.map(circle => {
    const color = circle.layer === 'SHELVES' ? colors.value.shelves : colors.value.circles;
    return `<circle cx="${circle.center.x}" cy="${circle.center.y}" r="${circle.radius}" fill="none" stroke="${color}" stroke-width="${strokeWidths.circles}"/>`;
  }).join('');
}

function renderArcs(arcs) {
  if (!arcs) return '';

  return arcs.map(arc => {
    const { startX, startY, endX, endY, largeArc } = calculateArcPath(arc);
    const color = arc.layer === 'SHELVES' ? colors.value.shelves : colors.value.arcs;
    return `<path d="M ${startX} ${startY} A ${arc.radius} ${arc.radius} 0 ${largeArc} 1 ${endX} ${endY}" fill="none" stroke="${color}" stroke-width="${strokeWidths.arcs}"/>`;
  }).join('');
}

function calculateArcPath(arc) {
  const toRadians = (deg) => deg * Math.PI / 180;
  
  return {
    startX: arc.center.x + arc.radius * Math.cos(toRadians(arc.startAngle)),
    startY: arc.center.y + arc.radius * Math.sin(toRadians(arc.startAngle)),
    endX: arc.center.x + arc.radius * Math.cos(toRadians(arc.endAngle)),
    endY: arc.center.y + arc.radius * Math.sin(toRadians(arc.endAngle)),
    largeArc: (arc.endAngle - arc.startAngle) > 180 ? 1 : 0
  };
}

function renderText(texts) {
  return '';
  if (!texts) return '';

  return texts.map(text => 
    `<text x="${text.position.x}" y="${text.position.y}" font-size="${text.height || 16}" fill="${colors.value.text}" text-anchor="middle" font-weight="bold">${text.text}</text>`
  ).join('');
}

function zoomIn() {
  zoom.value = Math.min(zoom.value * ZOOM_STEP, ZOOM_MAX);
}

function zoomOut() {
  zoom.value = Math.max(zoom.value / ZOOM_STEP, ZOOM_MIN);
}

function resetView() {
  zoom.value = 1;
  panX.value = 0;
  panY.value = 0;
}

function handleWheel(event) {
  event.preventDefault();
  const delta = event.deltaY > 0 ? ZOOM_WHEEL_STEP : 1 / ZOOM_WHEEL_STEP;
  zoom.value = clamp(zoom.value * delta, ZOOM_MIN, ZOOM_MAX);
}

function startDrag(event) {
  isDragging.value = true;
  dragStart.value = {
    x: event.clientX - panX.value,
    y: event.clientY - panY.value
  };
}

function onDrag(event) {
  if (!isDragging.value) return;
  
  panX.value = event.clientX - dragStart.value.x;
  panY.value = event.clientY - dragStart.value.y;
}

function stopDrag() {
  isDragging.value = false;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}
</script>

<template>
  <div class="rounded-lg p-4 theme-surface shadow-background-bottom">
    <h2 class="text-2xl font-semibold mb-2 theme-text">Shop Floor Plan</h2>
    
    <!-- Map Info -->
    <div v-if="shopMap.bounds" class="mb-4 text-sm theme-text opacity-70">
      <p>Dimensions: {{ shopMap.bounds.width.toFixed(0) }} × {{ shopMap.bounds.height.toFixed(0) }} units</p>
      <p v-if="shopMap.layers">Layers: {{ Object.keys(shopMap.layers).join(', ') }}</p>
      <p v-if="shopMap.entities">
        Lines: {{ shopMap.entities.lines?.length || 0 }} | 
        Polylines: {{ shopMap.entities.polylines?.length || 0 }} | 
        Text: {{ shopMap.entities.text?.length || 0 }}
      </p>
    </div>

    <!-- Zoom Controls -->
    <div class="mb-4 flex gap-2 items-center flex-wrap">
      <button 
        @click="zoomIn"
        class="px-3 py-1 theme-surface hover:theme-primary rounded transition shadow-background-bottom"
        title="Zoom In"
      >
        <span class="text-xl theme-text">+</span>
      </button>
      <button 
        @click="zoomOut"
        class="px-3 py-1 theme-surface hover:theme-primary rounded transition shadow-background-bottom"
        title="Zoom Out"
      >
        <span class="text-xl theme-text">−</span>
      </button>
      <button 
        @click="resetView"
        class="px-3 py-1 theme-surface hover:theme-primary rounded transition text-sm shadow-background-bottom theme-text"
      >
        Reset View
      </button>
      <span class="text-sm theme-text ml-2">
        Zoom: {{ (zoom * 100).toFixed(0) }}%
      </span>
      <span class="text-sm theme-text opacity-60 ml-4">
        💡 Scroll to zoom, drag to pan
      </span>
    </div>

    <!-- SVG Map Container -->
    <div 
      ref="svgContainer"
      class="rounded overflow-hidden theme-background relative shadow-background-bottom"
      style="height: 500px; cursor: grab;"
      :style="{ cursor: isDragging ? 'grabbing' : 'grab' }"
      @wheel="handleWheel"
      @mousedown="startDrag"
      @mousemove="onDrag"
      @mouseup="stopDrag"
      @mouseleave="stopDrag"
    >
      <div 
        class="absolute top-0 left-0 origin-top-left transition-transform"
        :style="{ transform: transform }"
        v-html="svgContent"
      ></div>
    </div>

    <!-- Layer Controls -->
    <div v-if="shopMap.layers" class="mt-4">
      <h3 class="font-semibold mb-2 theme-text">Layers:</h3>
      <div class="flex gap-2 flex-wrap">
        <span 
          v-for="layer in Object.keys(shopMap.layers)" 
          :key="layer"
          class="px-3 py-1 theme-background rounded-full text-sm theme-text shadow-background-bottom"
        >
          {{ layer }}
        </span>
      </div>
    </div>
  </div>
</template>
