<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { usePage } from '@inertiajs/vue3';
import axios from 'axios';
import Konva from 'konva';
import {
  getColors,
  renderLines,
  renderPolylines,
  renderShelves,
  renderCircles,
  renderArcs,
  renderText,
  renderSplitters,
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
import ContextMenu from './ContextMenu.vue';

const page = usePage();
const isAdmin = computed(() => {
  const user = page.props.auth?.user;
  return user?.is_admin === true || user?.is_admin === 1 || user?.is_admin === '1';
});

const props = defineProps({
  shopMap: {
    type: Object,
    required: true
  },
  shopName: {
    type: String,
    default: ''
  },
  adminMode: {
    type: Boolean,
    default: false
  },
  shoppingLists: {
    type: Array,
    default: () => []
  },
  selectedShoppingListId: {
    type: [String, Number],
    default: ''
  },
  loadingShoppingLists: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['item-selected', 'item-hovered', 'aisle-renamed', 'aisle-categories-updated', 'access-points-calculated', 'access-point-updated', 'update:selectedShoppingListId', 'highlight-aisles']);

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
const contextMenu = ref({
  visible: false,
  x: 0,
  y: 0,
  item: null
});
const aisleNames = ref({});
const aisleCategories = ref({});
const shelfAccessPoints = ref({});
const searchQuery = ref('');
const searchResults = ref([]);
const categories = ref([]);
const settingAccessPointFor = ref(null);
const sidebarOpen = ref(false);
const minZoomLevel = ref(0.1);
let darkModeCleanup = null;

// Touch handling for mobile
let lastTouchDistance = null;
let lastTouchCenter = null;
let firstTouchPosition = null; // Screen coordinates
let firstTouchStagePosition = null; // Stage coordinates
let debugMarker = null;

const selectedList = computed(() => {
  if (!props.selectedShoppingListId) return null;
  return props.shoppingLists.find(list => list.id == props.selectedShoppingListId);
});

const showShoppingLists = computed(() => {
  return !props.adminMode && props.shoppingLists && props.shoppingLists.length > 0;
});

const ZOOM_MIN = 0.1;
const ZOOM_MAX = 5;
const ZOOM_STEP = 1.2;

// Use pathfinding composable
const { 
  pathMode,
  selectedAisles,
  startPoint,
  endPoint,
  initPathfinder, 
  togglePathMode, 
  handleAisleSelection,
  clearPathVisualization,
  resetPathMode
} = usePathfinding();

onMounted(() => {
  initKonva();
  
  // Load aisle names from map data
  if (props.shopMap?.aisleNames) {
    aisleNames.value = { ...props.shopMap.aisleNames };
  }
  
  // Load aisle categories from map data
  if (props.shopMap?.aisleCategories) {
    aisleCategories.value = { ...props.shopMap.aisleCategories };
  }
  
  // Load shelf access points from map data
  if (props.shopMap?.shelfAccessPoints) {
    shelfAccessPoints.value = { ...props.shopMap.shelfAccessPoints };
  }
  
  // Load categories for search
  loadCategories();
  
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

// Clear path function that has access to mainLayer
const clearPath = () => {
  if (mainLayer.value) {
    resetPathMode(mainLayer.value);
  }
};

// Expose methods and properties to parent components
defineExpose({
  pathMode,
  togglePathMode,
  selectAislesByCategory,
  clearPath
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

  // Setup mobile touch events
  setupMobileGestures();

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
    
    // Render splitter lines for visualization (optional)
    if (entities.splitters && entities.splitters.length > 0) {
      renderSplitters(entities.splitters, mainLayer.value, 2);
    }
  }

  mainLayer.value.batchDraw();
  const scale = fitStageToMap(stage.value, containerRef.value, bounds, padding);
  zoom.value = scale;
  
  // Set minimum zoom to the initial fitted zoom level
  minZoomLevel.value = scale;
  
  // Initialize pathfinder and calculate access points if needed
  const calculatedAccessPoints = initPathfinder(map, 20);
  if (calculatedAccessPoints && Object.keys(calculatedAccessPoints).length > 0) {
    // Emit calculated access points to be saved
    emit('access-points-calculated', calculatedAccessPoints);
  }
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
    // In path mode, select aisles for navigation
    if (pathMode.value) {
      const shelfId = shape.attrs.data?.shelfId;
      if (shelfId !== undefined && shelfId !== null) {
        handleAisleSelection(shelfId, mainLayer.value);
        // Note: handleAisleSelection will handle highlighting through path visualization
      }
    } else {
      selectItem(shape);
    }
  });

  shape.on('contextmenu', (e) => {
    e.evt.preventDefault();
    
    // Only show context menu in admin mode
    if (!props.adminMode) {
      console.log('Context menu blocked - not in admin mode');
      return;
    }
    
    // Don't show context menu in path mode
    if (pathMode.value) return;
    
    const shelfId = shape.attrs.data?.shelfId;
    console.log('Context menu opened for shelf:', shelfId, 'isAdmin:', isAdmin.value);
    contextMenu.value = {
      visible: true,
      x: e.evt.clientX,
      y: e.evt.clientY,
      item: {
        shape: shape,
        data: shape.attrs.data,
        name: aisleNames.value[shelfId] || '',
        categories: aisleCategories.value[shelfId] || [],
        isAdmin: isAdmin.value
      }
    };
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
  stageZoomOut(stage.value, zoom, ZOOM_STEP, minZoomLevel.value);
}

function resetView() {
  if (props.shopMap?.bounds) {
    const scale = stageResetView(stage.value, containerRef.value, props.shopMap.bounds, 20);
    zoom.value = scale;
  }
}

function handleClearPath() {
  resetPathMode(mainLayer.value);
  
  // Reset all shelf highlights to original state
  if (mainLayer.value) {
    const allShelves = mainLayer.value.find('.shelf-group');
    allShelves.forEach(shelf => {
      updateShapeColors(shelf, getColors(), strokeWidths, false);
    });
    mainLayer.value.batchDraw();
  }
}

function selectAislesByCategory(categoryId) {
  if (!pathMode.value) {
    console.warn('Path mode must be enabled to select aisles by category');
    return;
  }

  if (!props.shopMap?.entities?.shelves) {
    console.error('No shelves found in map');
    return;
  }

  let selectedCount = 0;
  
  // Find all shelves that have this category
  props.shopMap.entities.shelves.forEach(shelf => {
    const shelfId = shelf.id;
    const categoryIds = aisleCategories.value[shelfId] || [];
    
    if (categoryIds.includes(categoryId)) {
      // Check if not already selected
      if (!selectedAisles.value.includes(shelfId)) {
        handleAisleSelection(shelfId, mainLayer.value);
        selectedCount++;
      }
    }
  });
  
  if (selectedCount === 0) {
    const category = categories.value.find(c => c.id === categoryId);
    alert(`No aisles found with category: ${category?.name || categoryId}`);
  }
}

async function loadCategories() {
  try {
    const response = await axios.get('/api/v1/categories');
    categories.value = response.data.categories;
  } catch (error) {
    console.error('Error loading categories:', error);
  }
}

function handleSearch() {
  const query = searchQuery.value.toLowerCase().trim();
  
  if (!query) {
    searchResults.value = [];
    return;
  }
  
  const results = [];
  
  // Search through all shelves
  if (props.shopMap?.entities?.shelves) {
    props.shopMap.entities.shelves.forEach(shelf => {
      const shelfId = shelf.id;
      const aisleName = aisleNames.value[shelfId] || '';
      const categoryIds = aisleCategories.value[shelfId] || [];
      
      // Check if name matches
      if (aisleName.toLowerCase().includes(query)) {
        results.push({
          shelfId,
          name: aisleName || `Aisle ${shelfId}`,
          matchType: 'name'
        });
        return;
      }
      
      // Check if any category matches
      for (const catId of categoryIds) {
        const category = categories.value.find(c => c.id === catId);
        if (category && category.name.toLowerCase().includes(query)) {
          results.push({
            shelfId,
            name: aisleName || `Aisle ${shelfId}`,
            matchType: 'category',
            categoryName: category.name
          });
          break;
        }
      }
    });
  }
  
  searchResults.value = results;
  console.log('Search results:', results);
}

function selectSearchResult(result) {
  // Find the shelf shape on the map
  const shape = mainLayer.value.findOne(`#shelf-${result.shelfId}`);
  
  if (shape) {
    // Trigger click event to select/highlight the aisle
    selectItem(shape);
    
    // Clear search
    searchQuery.value = '';
    searchResults.value = [];
  } else {
    console.error('Shape not found for shelf:', result.shelfId);
  }
}

function closeContextMenu() {
  contextMenu.value.visible = false;
}

function handleRenameAisle(newName) {
  if (!contextMenu.value.item) return;
  
  const itemId = contextMenu.value.item.data?.shelfId;
  console.log('Renaming aisle:', { itemId, newName, data: contextMenu.value.item.data });
  
  if (itemId) {
    aisleNames.value[itemId] = newName;
    
    // Emit event to save to database
    emit('aisle-renamed', {
      id: itemId,
      name: newName,
      allNames: aisleNames.value
    });
  } else {
    console.error('No shelf ID found in item data');
  }
}

function handleDeleteAisleName() {
  if (!contextMenu.value.item) return;
  
  const itemId = contextMenu.value.item.data?.shelfId;
  if (itemId) {
    delete aisleNames.value[itemId];
    
    // Emit event to save to database
    emit('aisle-renamed', {
      id: itemId,
      name: '',
      allNames: aisleNames.value
    });
  }
}

function handleSetCategory(categoryIds) {
  if (!contextMenu.value.item) return;
  
  const itemId = contextMenu.value.item.data?.shelfId;
  console.log('Setting categories:', { itemId, categoryIds });
  
  if (itemId) {
    if (categoryIds.length > 0) {
      aisleCategories.value[itemId] = categoryIds;
    } else {
      delete aisleCategories.value[itemId];
    }
    
    // Emit event to save to database
    emit('aisle-categories-updated', {
      id: itemId,
      categories: categoryIds,
      allCategories: aisleCategories.value
    });
  }
}

function handleShoppingListChange(event) {
  const value = event.target.value;
  emit('update:selectedShoppingListId', value);
}

function handleHighlightAisles() {
  emit('highlight-aisles');
  sidebarOpen.value = false;
}

function setupMobileGestures() {
  if (!stage.value) return;

  const stageEl = stage.value.container();

  // Capture first touch position
  stageEl.addEventListener('touchstart', (e) => {
    if (e.touches.length === 1) {
      // Save first touch position in screen coordinates
      const rect = stage.value.container().getBoundingClientRect();
      firstTouchPosition = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY
      };
      
      // Convert to stage coordinates for zoom center
      const stageX = (e.touches[0].clientX - rect.left - stage.value.x()) / stage.value.scaleX();
      const stageY = (e.touches[0].clientY - rect.top - stage.value.y()) / stage.value.scaleY();
      
      firstTouchStagePosition = {
        x: stageX,
        y: stageY
      };
      
      // Create debug marker in stage coordinates
      if (debugMarker) {
        debugMarker.destroy();
      }
      
      debugMarker = new Konva.Circle({
        x: stageX,
        y: stageY,
        radius: 30 / stage.value.scaleX(), // Scale radius with zoom
        fill: 'red',
        opacity: 0.7,
        listening: false
      });
      
      mainLayer.value.add(debugMarker);
      mainLayer.value.batchDraw();
      
      console.log('First touch at screen:', firstTouchPosition, 'stage:', firstTouchStagePosition);
    }
    if (e.touches.length > 1) {
      e.preventDefault();
      // Disable dragging during pinch zoom
      stage.value.draggable(false);
      console.log('Second touch detected, zoom mode active, dragging disabled');
    }
  }, { passive: false });

  stageEl.addEventListener('touchmove', handleTouchMove, { passive: false });
  stageEl.addEventListener('touchend', handleTouchEnd);
}

function getDistance(touch1, touch2) {
  const dx = touch1.clientX - touch2.clientX;
  const dy = touch1.clientY - touch2.clientY;
  return Math.sqrt(dx * dx + dy * dy);
}

function getCenter(touch1, touch2) {
  return {
    x: (touch1.clientX + touch2.clientX) / 2,
    y: (touch1.clientY + touch2.clientY) / 2
  };
}

function handleTouchMove(e) {
  if (!stage.value) return;

  // Pinch zoom with two fingers
  if (e.touches.length === 2) {
    e.preventDefault();

    const touch1 = e.touches[0];
    const touch2 = e.touches[1];
    const currentDistance = getDistance(touch1, touch2);

    // Initialize lastTouchDistance on first two-finger move
    if (lastTouchDistance === null) {
      lastTouchDistance = currentDistance;
      return;
    }

    if (firstTouchStagePosition !== null && firstTouchPosition !== null) {
      // Calculate zoom
      const scale = currentDistance / lastTouchDistance;
      const oldScale = stage.value.scaleX();
      const newScale = Math.max(minZoomLevel.value, Math.min(ZOOM_MAX, oldScale * scale));

      // Get current rect
      const rect = stage.value.container().getBoundingClientRect();
      
      // Screen position where first touch happened
      const screenX = firstTouchPosition.x - rect.left;
      const screenY = firstTouchPosition.y - rect.top;

      // Calculate new stage position to keep the point fixed
      const newPos = {
        x: screenX - firstTouchStagePosition.x * newScale,
        y: screenY - firstTouchStagePosition.y * newScale
      };

      console.log('Zoom:', { oldScale, newScale, screenX, screenY, stagePoint: firstTouchStagePosition, newPos });

      stage.value.scale({ x: newScale, y: newScale });
      stage.value.position(newPos);
      zoom.value = newScale;
    }

    lastTouchDistance = currentDistance;
  }
}

function handleTouchEnd() {
  // Re-enable dragging
  if (stage.value) {
    stage.value.draggable(true);
  }
  
  lastTouchDistance = null;
  lastTouchCenter = null;
  firstTouchPosition = null;
  firstTouchStagePosition = null;
  
  // Remove debug marker
  if (debugMarker) {
    debugMarker.destroy();
    debugMarker = null;
    mainLayer.value.batchDraw();
  }
  
  console.log('Touch ended, cleared state, dragging enabled');
}

function handleSetAccessPoint() {
  if (!contextMenu.value.item) return;
  
  const shelfId = contextMenu.value.item.data?.shelfId;
  console.log('Setting access point mode for shelf:', shelfId);
  
  settingAccessPointFor.value = shelfId;
  document.body.style.cursor = 'crosshair';
  
  // Add a temporary click listener to the stage
  const stageClickHandler = (e) => {
    // Get click position relative to the stage
    const pos = stage.value.getPointerPosition();
    const stageAttrs = stage.value.attrs;
    
    // Transform to map coordinates
    const x = (pos.x - stageAttrs.x) / stageAttrs.scaleX;
    const y = (pos.y - stageAttrs.y) / stageAttrs.scaleY;
    
    console.log(`Setting access point for shelf ${shelfId} at (${x.toFixed(0)}, ${y.toFixed(0)})`);
    
    // Store the access point
    shelfAccessPoints.value[shelfId] = {
      x,
      y,
      method: 'manual',
      shelfId
    };
    
    // Emit event to save to database
    emit('access-point-updated', {
      shelfId,
      accessPoint: shelfAccessPoints.value[shelfId],
      allAccessPoints: shelfAccessPoints.value
    });
    
    // Clean up
    settingAccessPointFor.value = null;
    document.body.style.cursor = 'default';
    stage.value.off('click', stageClickHandler);
  };
  
  stage.value.on('click', stageClickHandler);
}
</script>

<template>
  <div class="fixed inset-0 lg:relative lg:w-full lg:h-full theme-background overflow-hidden z-50 lg:z-auto" style="height: 100vh; height: 100dvh;">
    <!-- Konva Canvas Container -->
    <div ref="containerRef" class="w-full h-full" style="touch-action: none;"></div>

    <!-- Mobile Menu Button (Top-left) -->
    <button 
      @click="sidebarOpen = true"
      class="lg:hidden absolute top-4 left-4 theme-surface rounded-lg shadow-lg p-3 z-20 hover:shadow-xl transition-shadow active:scale-95"
    >
      <svg class="w-6 h-6 theme-text" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    </button>

    <!-- Mobile Sidebar Overlay -->
    <div
      v-if="sidebarOpen"
      @click="sidebarOpen = false"
      class="lg:hidden fixed inset-0 bg-black/50 z-30"
    ></div>

    <!-- Mobile Sidebar -->
    <div 
      :class="sidebarOpen ? 'translate-x-0' : '-translate-x-full'"
      class="lg:hidden fixed top-0 left-0 bottom-0 w-80 max-w-[85vw] theme-surface shadow-2xl z-40 transform transition-transform duration-300 ease-in-out overflow-y-auto"
    >
      <div class="p-4">
        <!-- Close Button -->
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-xl font-bold theme-text">Menu</h2>
          <button 
            @click="sidebarOpen = false"
            class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <svg class="w-6 h-6 theme-text" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Shop Info -->
        <div v-if="shopName" class="mb-6">
          <h3 class="text-lg font-bold theme-text mb-2 flex items-center gap-2">
            <span>📍</span>
            <span>{{ shopName }}</span>
          </h3>
          <div class="text-sm theme-text space-y-1">
            <p><span class="font-semibold">Floor Plan</span></p>
            <p><span class="font-semibold">Dimensions:</span> {{ shopMap.bounds.width.toFixed(0) }} × {{ shopMap.bounds.height.toFixed(0) }}</p>
          </div>
        </div>

        <!-- Shopping List Section -->
        <div v-if="showShoppingLists" class="mb-6">
          <h3 class="text-sm font-semibold theme-text mb-3 opacity-70">Shopping List</h3>
          <p class="text-xs theme-text opacity-60 mb-3">Select a list to highlight aisles</p>
          
          <select 
            :value="selectedShoppingListId"
            @change="handleShoppingListChange"
            class="w-full theme-surface theme-text px-3 py-2 rounded-lg border theme-border mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          >
            <option value="">Select a shopping list...</option>
            <option v-for="list in shoppingLists" :key="list.id" :value="list.id">
              {{ list.name }} ({{ list.items.length }} items)
            </option>
          </select>

          <button 
            @click="handleHighlightAisles"
            :disabled="!selectedShoppingListId || loadingShoppingLists"
            class="w-full theme-btn-primary py-2.5 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 text-sm"
          >
            {{ loadingShoppingLists ? 'Loading...' : 'Highlight Aisles' }}
          </button>

          <!-- Selected List Info -->
          <div v-if="selectedList" class="mt-3 theme-surface rounded-lg p-3 border theme-border">
            <h4 class="font-semibold theme-text text-xs mb-2">{{ selectedList.name }}</h4>
            <p class="text-xs theme-text opacity-60 mb-2">{{ selectedList.items.length }} items</p>
            <div class="max-h-32 overflow-y-auto space-y-1">
              <div v-for="item in selectedList.items" :key="item.id" class="text-xs theme-text opacity-80 flex items-start gap-1">
                <span class="opacity-50">•</span>
                <span class="truncate">{{ item.name }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Zoom Controls -->
        <div class="mb-6">
          <h3 class="text-sm font-semibold theme-text mb-3 opacity-70">Zoom Controls</h3>
          <div class="flex gap-2">
            <button 
              @click="zoomIn(); sidebarOpen = false"
              class="flex-1 theme-surface border theme-border rounded-lg py-3 font-semibold theme-text hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors active:scale-95"
            >
              + Zoom In
            </button>
            <button 
              @click="zoomOut(); sidebarOpen = false"
              class="flex-1 theme-surface border theme-border rounded-lg py-3 font-semibold theme-text hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors active:scale-95"
            >
              − Zoom Out
            </button>
          </div>
          <button 
            @click="resetView(); sidebarOpen = false"
            class="w-full mt-2 theme-surface border theme-border rounded-lg py-3 font-semibold theme-text hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors active:scale-95"
          >
            ⟲ Reset View
          </button>
          <div class="mt-3 text-center">
            <div class="text-sm font-medium theme-text">
              Current Zoom: {{ (zoom * 100).toFixed(0) }}%
            </div>
          </div>
        </div>

        <!-- Help -->
        <div class="border-t theme-border pt-4">
          <h3 class="text-sm font-semibold theme-text mb-3 opacity-70">Tips</h3>
          <div class="text-sm theme-text space-y-2 opacity-75">
            <p>💡 Pinch to zoom on mobile</p>
            <p>👆 Drag to pan around the map</p>
            <p>🔍 Use search to find specific aisles</p>
            <p v-if="isAdmin">✏️ Right-click to edit (desktop)</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Info Panel (Top-left) - Desktop Only, Admin Mode Only -->
    <transition name="slide-right">
      <div v-if="false" v-show="showInfo" class="hidden lg:block absolute top-4 left-4 theme-surface rounded-lg shadow-lg p-4 max-w-sm z-10">
        <button @click="showInfo = false" class="absolute top-2 right-2 w-6 h-6 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center justify-center text-sm theme-text">✕</button>
        
        <h2 v-if="shopName" class="text-lg font-bold theme-text mb-2 flex items-center gap-2">
          <span>📍</span>
          <span class="truncate">{{ shopName }}</span>
        </h2>
        <h3 class="text-sm font-semibold theme-text opacity-70 mb-1">Floor Plan</h3>
        <p class="text-sm theme-text"><span class="font-semibold">Dimensions:</span> {{ shopMap.bounds.width.toFixed(0) }} × {{ shopMap.bounds.height.toFixed(0) }}</p>
      </div>
    </transition>

    <button v-if="false" v-show="!showInfo" @click="showInfo = true" class="hidden lg:block absolute top-4 left-4 theme-surface rounded-lg shadow-lg px-4 py-2 hover:shadow-xl transition-shadow z-10 theme-text font-medium">
      ℹ️ Info
    </button>

    <!-- Zoom Controls (Bottom-right, Desktop) -->
    <transition name="slide-left">
      <div v-show="showControls" class="hidden lg:block absolute bottom-24 right-4 theme-surface rounded-lg shadow-lg overflow-hidden z-10">
        <button @click="zoomIn" class="w-10 h-10 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 active:scale-95 border-b border-gray-200 dark:border-gray-700 theme-text text-xl font-bold transition-all">
          +
        </button>
        <button @click="zoomOut" class="w-10 h-10 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 active:scale-95 border-b border-gray-200 dark:border-gray-700 theme-text text-xl font-bold transition-all">
          −
        </button>
        <button @click="resetView" class="w-10 h-10 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 active:scale-95 theme-text text-lg transition-all" title="Reset view">
          ⟲
        </button>
      </div>
    </transition>

    <!-- Zoom Level Indicator (Desktop) -->
    <div v-show="showControls" class="hidden lg:block absolute bottom-4 right-4 theme-surface rounded-lg shadow-lg px-3 py-2 z-10">
      <div class="text-xs font-medium theme-text">
        {{ (zoom * 100).toFixed(0) }}%
      </div>
    </div>

    <button v-show="!showControls" @click="showControls = true" class="hidden lg:flex absolute bottom-4 right-4 theme-surface rounded-full shadow-lg w-12 h-12 items-center justify-center hover:shadow-xl active:scale-95 transition-all z-10 text-xl">
      🎛️
    </button>

    <!-- Pathfinding Controls - Admin Mode Only -->
    <PathModeControls 
      v-if="false"
      :path-mode="pathMode"
      :selected-aisles="selectedAisles"
      :aisle-names="aisleNames"
      :start-point="startPoint"
      :end-point="endPoint"
      @toggle-path-mode="togglePathMode"
      @clear-path="handleClearPath"
      @select-by-category="selectAislesByCategory"
    />

    <!-- Search Box (Top-center, Google Maps style) -->
    <div class="absolute top-4 left-20 right-4 lg:left-1/2 lg:right-auto lg:transform lg:-translate-x-1/2 z-10">
      <div class="theme-surface rounded-full shadow-lg px-3 py-2 md:px-5 md:py-3 flex items-center gap-2 md:gap-3 w-full lg:min-w-[400px] lg:w-auto">
        <svg class="w-4 h-4 md:w-5 md:h-5 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
        </svg>
        <input 
          v-model="searchQuery"
          @input="handleSearch"
          @focus="handleSearch"
          type="text" 
          placeholder="Search aisles..." 
          class="flex-1 bg-transparent border-none outline-none theme-text placeholder-gray-400 text-sm min-w-0"
        />
        <button 
          v-if="searchQuery"
          @click="searchQuery = ''; searchResults = []"
          class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors shrink-0 active:scale-95 touch-manipulation"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>
      
      <!-- Search Results Dropdown -->
      <div 
        v-if="searchResults.length > 0"
        class="theme-surface rounded-lg shadow-lg mt-2 border theme-border overflow-hidden w-full"
      >
        <div class="px-3 md:px-4 py-2 text-xs text-gray-500 border-b theme-border">
          {{ searchResults.length }} result{{ searchResults.length !== 1 ? 's' : '' }} found
        </div>
        <div class="max-h-48 md:max-h-64 overflow-y-auto">
          <button
            v-for="result in searchResults"
            :key="result.shelfId"
            @click="selectSearchResult(result)"
            class="w-full px-3 md:px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 active:bg-gray-200 dark:active:bg-gray-600 flex items-center justify-between theme-text transition-colors touch-manipulation"
          >
            <div class="min-w-0 flex-1">
              <div class="font-medium truncate text-sm">{{ result.name }}</div>
              <div v-if="result.matchType === 'category'" class="text-xs text-gray-500 truncate">
                Category: {{ result.categoryName }}
              </div>
            </div>
            <svg class="w-4 h-4 text-gray-400 shrink-0 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Help Hint (Bottom-center, Desktop only) -->
    <div class="hidden lg:block absolute bottom-4 left-1/2 transform -translate-x-1/2 theme-surface rounded-full shadow-md px-4 py-2 z-10">
      <div class="text-xs theme-text flex items-center gap-3">
        <span>💡 Scroll to zoom</span>
        <span class="text-gray-400">•</span>
        <span>Drag to pan</span>
        <span v-if="isAdmin" class="text-gray-400">•</span>
        <span v-if="isAdmin">Right-click to edit</span>
      </div>
    </div>

    <!-- Context Menu -->
    <ContextMenu
      :visible="contextMenu.visible"
      :x="contextMenu.x"
      :y="contextMenu.y"
      :item="contextMenu.item"
      @close="closeContextMenu"
      @rename="handleRenameAisle"
      @delete="handleDeleteAisleName"
      @set-category="handleSetCategory"
      @set-access-point="handleSetAccessPoint"
    />

  </div>
</template>

