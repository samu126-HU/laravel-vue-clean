<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import Konva from 'konva';
import {
  getColors,
  renderLines,
  renderPolylines,
  renderShelves,
  renderCircles,
  renderArcs,
  renderText,
  updateShapeColors,
  updateShapeSelection
} from '../utils/konvaRenderer';
import { 
  initKonvaStage, 
  setupZoom, 
  setupStageClick, 
  fitStageToMap, 
  handleResize as handleStageResize,
  zoomIn as stageZoomIn,
  zoomOut as stageZoomOut,
  resetView as stageResetView
} from '../utils/stageHelpers';
import { watchDarkMode } from '../utils/darkModeDetector';
import { usePathfinding } from '../composables/usePathfinding';
import PathModeControls from './PathModeControls.vue';

const props = defineProps({
  shopMap: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['item-selected', 'item-hovered']);

const strokeWidths = {
  lines: 10,
  polylines: 10,
  circles: 10,
  arcs: 10
};

const containerRef = ref(null);
const stage = ref(null);
const mainLayer = ref(null);
const zoom = ref(1);
const selectedItem = ref(null);
const showControls = ref(true);
const showInfo = ref(true);
let darkModeCleanup = null;

const ZOOM_MIN = 0.1;
const ZOOM_MAX = 5;
const ZOOM_STEP = 1.2;

// Use pathfinding composable
const { 
  pathMode,
  pathPoints,
  initPathfinder, 
  togglePathMode, 
  handlePathClick,
  clearPathVisualization,
  resetPathMode
} = usePathfinding();

onMounted(() => {
  initKonva();
  
  // Watch for dark mode changes and re-render
  darkModeCleanup = watchDarkMode(() => {
    if (props.shopMap && stage.value) {
      renderMap(props.shopMap);
    }
  });

  // Watch for container resize
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  if (darkModeCleanup) {
    darkModeCleanup();
  }
  window.removeEventListener('resize', handleResize);
});

function handleResize() {
  handleStageResize(stage.value, containerRef.value, props.shopMap?.bounds, 20);
}

function initKonva() {
  if (!containerRef.value) return;

  // Initialize stage and layer
  const result = initKonvaStage(containerRef.value, { draggable: true });
  stage.value = result.stage;
  mainLayer.value = result.mainLayer;

  // Setup zoom
  setupZoom(stage.value, zoom, { ZOOM_MIN, ZOOM_MAX });

  // Setup click handler for pathfinding
  setupStageClick(stage.value, (worldPos) => {
    if (pathMode.value) {
      handlePathClick(worldPos, mainLayer.value);
    }
  });

  if (props.shopMap) {
    renderMap(props.shopMap);
  }
}

function renderMap(map) {
  if (!map?.bounds || !mainLayer.value) return;

  mainLayer.value.destroyChildren();
  selectedItem.value = null;

  const { bounds, entities } = map;
  const padding = 20;
  const colors = getColors();

  // Background
  const bg = new Konva.Rect({
    x: bounds.minX - padding,
    y: bounds.minY - padding,
    width: bounds.width + padding * 2,
    height: bounds.height + padding * 2,
  });
  mainLayer.value.add(bg);

  if (entities) {
    renderLines(entities.lines, mainLayer.value, colors, strokeWidths);
    renderPolylines(entities.polylines, mainLayer.value, colors, strokeWidths);
    renderCircles(entities.circles, mainLayer.value, colors, strokeWidths);
    renderArcs(entities.arcs, mainLayer.value, colors, strokeWidths);
    renderShelves(entities.shelves, mainLayer.value, colors, strokeWidths, makeInteractive);
    renderText(entities.text, mainLayer.value, colors);
  }

  mainLayer.value.batchDraw();
  const scale = fitStageToMap(stage.value, containerRef.value, bounds, padding);
  zoom.value = scale;
  
  // Initialize pathfinder
  initPathfinder(map, 20);
}

function makeInteractive(shape) {
  shape.on('mouseenter', () => {
    document.body.style.cursor = 'pointer';
    if (shape !== selectedItem.value) {
      updateShapeColors(shape, getColors(), strokeWidths, true);
      mainLayer.value.batchDraw();
    }
    emit('item-hovered', shape.attrs.data);
  });

  shape.on('mouseleave', () => {
    document.body.style.cursor = 'default';
    if (shape !== selectedItem.value) {
      updateShapeColors(shape, getColors(), strokeWidths, false);
      mainLayer.value.batchDraw();
    }
  });

  shape.on('click', () => {
    selectItem(shape);
  });
}

function selectItem(shape) {
  const colors = getColors();

  // Deselect previous
  if (selectedItem.value) {
    updateShapeSelection(selectedItem.value, colors, strokeWidths, false);
  }
  
  if ((parseInt(shape.index) === parseInt(selectedItem.value?.index))) {
    // Deselect if clicking the same item
    selectedItem.value = null;
    mainLayer.value.batchDraw();
    emit('item-selected', null);
    return;
  }
  
  // Select new
  selectedItem.value = shape;
  updateShapeSelection(shape, colors, strokeWidths, true);

  mainLayer.value.batchDraw();
  emit('item-selected', shape.attrs.data);
}

function zoomIn() {
  stageZoomIn(stage.value, zoom, ZOOM_STEP, ZOOM_MAX);
}

function zoomOut() {
  stageZoomOut(stage.value, zoom, ZOOM_STEP, ZOOM_MIN);
}

function resetView() {
  if (props.shopMap?.bounds) {
    const scale = stageResetView(stage.value, containerRef.value, props.shopMap.bounds, 20);
    zoom.value = scale;
  }
}

function handleClearPath() {
  resetPathMode(mainLayer.value);
}
</script>

<template>
  <div class="relative w-full h-full theme-background rounded-sm overflow-hidden">
    <!-- Konva Canvas Container -->
    <div ref="containerRef" class="w-full h-full"></div>

    <!-- Info Panel (Top-left) -->
    <transition name="slide-right">
      <div v-show="showInfo" class="absolute top-4 left-4 theme-surface rounded-lg shadow-lg p-4 max-w-sm z-10">
        <button @click="showInfo = false" class="absolute top-2 right-2 w-6 h-6 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center justify-center text-sm theme-text">✕</button>
        
        <h2 class="text-lg font-bold theme-text">Floor Plan</h2>
        <p><span class="font-semibold">Dimensions:</span> {{ shopMap.bounds.width.toFixed(0) }} × {{ shopMap.bounds.height.toFixed(0) }}</p>
      </div>
    </transition>

    <button v-show="!showInfo" @click="showInfo = true" class="absolute top-4 left-4 theme-surface rounded-lg shadow-lg px-4 py-2 hover:shadow-xl transition-shadow z-10 theme-text font-medium">
      ℹ️ Info
    </button>

    <!-- Zoom Controls (Bottom-right, Google Maps style) -->
    <transition name="slide-left">
      <div v-show="showControls" class="absolute bottom-24 right-4 theme-surface rounded-lg shadow-lg overflow-hidden z-10">
        <button @click="zoomIn" class="w-10 h-10 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 border-b border-gray-200 dark:border-gray-700 theme-text text-xl font-bold transition-colors">
          +
        </button>
        <button @click="zoomOut" class="w-10 h-10 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 border-b border-gray-200 dark:border-gray-700 theme-text text-xl font-bold transition-colors">
          −
        </button>
        <button @click="resetView" class="w-10 h-10 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 theme-text text-lg transition-colors" title="Reset view">
          ⟲
        </button>
      </div>
    </transition>

    <!-- Zoom Level Indicator -->
    <div v-show="showControls" class="absolute bottom-4 right-4 theme-surface rounded-lg shadow-lg px-3 py-2 z-10">
      <div class="text-xs font-medium theme-text">
        {{ (zoom * 100).toFixed(0) }}%
      </div>
    </div>

    <button v-show="!showControls" @click="showControls = true" class="absolute bottom-4 right-4 theme-surface rounded-full shadow-lg w-12 h-12 flex items-center justify-center hover:shadow-xl transition-shadow z-10 text-xl">
      🎛️
    </button>

    <!-- Pathfinding Controls -->
    <PathModeControls 
      :path-mode="pathMode"
      :waypoint-count="pathPoints.length"
      @toggle-path-mode="togglePathMode"
      @clear-path="handleClearPath"
    />

    <!-- Search Box (Top-center, Google Maps style) -->
    <div class="absolute top-4 left-1/2 transform -translate-x-1/2 z-10">
      <div class="theme-surface rounded-full shadow-lg px-5 py-3 flex items-center gap-3 min-w-[400px]">
        <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
        </svg>
        <input 
          type="text" 
          placeholder="Search for items, shelves, or aisles..." 
          class="flex-1 bg-transparent border-none outline-none theme-text placeholder-gray-400 text-sm"
        />
      </div>
    </div>

    <!-- Help Hint (Bottom-center) -->
    <div class="absolute bottom-4 left-1/2 transform -translate-x-1/2 theme-surface rounded-full shadow-md px-4 py-2 z-10">
      <div class="text-xs theme-text flex items-center gap-3">
        <span>💡 Scroll to zoom</span>
        <span class="text-gray-400">•</span>
        <span>Drag to pan</span>
        <span class="text-gray-400">•</span>
        <span>Click to select</span>
      </div>
    </div>
  </div>
</template>

