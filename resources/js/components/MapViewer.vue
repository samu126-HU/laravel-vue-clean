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
  }
});

const emit = defineEmits(['item-selected', 'item-hovered', 'aisle-renamed', 'aisle-categories-updated', 'access-points-calculated', 'access-point-updated']);

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
let darkModeCleanup = null;

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

  console.log(`Auto-selected ${selectedCount} aisles with category ${categoryId}`);
  
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
  <div class="relative w-full h-full theme-background rounded-sm overflow-hidden">
    <!-- Konva Canvas Container -->
    <div ref="containerRef" class="w-full h-full"></div>

    <!-- Info Panel (Top-left) - Admin Mode Only -->
    <transition name="slide-right">
      <div v-if="false" v-show="showInfo" class="absolute top-20 md:top-4 left-2 md:left-4 right-2 md:right-auto theme-surface rounded-lg shadow-lg p-3 md:p-4 max-w-full md:max-w-sm z-10">
        <button @click="showInfo = false" class="absolute top-2 right-2 w-6 h-6 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center justify-center text-sm theme-text">✕</button>
        
        <h2 v-if="shopName" class="text-lg md:text-xl font-bold theme-text mb-2 flex items-center gap-2">
          <span>📍</span>
          <span class="truncate">{{ shopName }}</span>
        </h2>
        <h3 class="text-xs md:text-sm font-semibold theme-text opacity-70 mb-1">Floor Plan</h3>
        <p class="text-xs md:text-sm theme-text"><span class="font-semibold">Dimensions:</span> {{ shopMap.bounds.width.toFixed(0) }} × {{ shopMap.bounds.height.toFixed(0) }}</p>
      </div>
    </transition>

    <button v-if="false" v-show="!showInfo" @click="showInfo = true" class="absolute top-20 md:top-4 left-2 md:left-4 theme-surface rounded-lg shadow-lg px-3 py-2 md:px-4 hover:shadow-xl transition-shadow z-10 theme-text text-sm md:text-base font-medium">
      ℹ️ Info
    </button>

    <!-- Zoom Controls (Bottom-right, Google Maps style) -->
    <transition name="slide-left">
      <div v-show="showControls" class="absolute bottom-16 md:bottom-24 right-2 md:right-4 theme-surface rounded-lg shadow-lg overflow-hidden z-10">
        <button @click="zoomIn" class="w-9 h-9 md:w-10 md:h-10 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 active:scale-95 border-b border-gray-200 dark:border-gray-700 theme-text text-xl font-bold transition-all touch-manipulation">
          +
        </button>
        <button @click="zoomOut" class="w-9 h-9 md:w-10 md:h-10 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 active:scale-95 border-b border-gray-200 dark:border-gray-700 theme-text text-xl font-bold transition-all touch-manipulation">
          −
        </button>
        <button @click="resetView" class="w-9 h-9 md:w-10 md:h-10 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 active:scale-95 theme-text text-lg transition-all touch-manipulation" title="Reset view">
          ⟲
        </button>
      </div>
    </transition>

    <!-- Zoom Level Indicator -->
    <div v-show="showControls" class="absolute bottom-4 right-2 md:right-4 theme-surface rounded-lg shadow-lg px-2 py-1 md:px-3 md:py-2 z-10">
      <div class="text-xs font-medium theme-text">
        {{ (zoom * 100).toFixed(0) }}%
      </div>
    </div>

    <button v-show="!showControls" @click="showControls = true" class="absolute bottom-4 right-2 md:right-4 theme-surface rounded-full shadow-lg w-10 h-10 md:w-12 md:h-12 flex items-center justify-center hover:shadow-xl active:scale-95 transition-all z-10 text-lg md:text-xl touch-manipulation">
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
    <div class="absolute top-4 left-2 right-2 md:left-1/2 md:right-auto md:transform md:-translate-x-1/2 z-10">
      <div class="theme-surface rounded-full shadow-lg px-3 py-2 md:px-5 md:py-3 flex items-center gap-2 md:gap-3 w-full md:min-w-[400px] md:w-auto">
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

    <!-- Help Hint (Bottom-center) -->
    <div class="hidden sm:block absolute bottom-4 left-1/2 transform -translate-x-1/2 theme-surface rounded-full shadow-md px-3 md:px-4 py-2 z-10">
      <div class="text-xs theme-text flex items-center gap-2 md:gap-3">
        <span class="hidden md:inline">💡 Scroll to zoom</span>
        <span class="md:hidden">💡 Pinch to zoom</span>
        <span class="text-gray-400">•</span>
        <span>Drag to pan</span>
        <span v-if="isAdmin" class="text-gray-400 hidden md:inline">•</span>
        <span v-if="isAdmin" class="hidden md:inline">Right-click to edit</span>
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

