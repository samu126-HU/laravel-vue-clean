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

const emit = defineEmits(['item-selected', 'item-hovered', 'aisle-renamed', 'aisle-categories-updated', 'access-points-calculated', 'access-point-updated', 'update:selectedShoppingListId', 'highlight-aisles', 'items-completed', 'stepper-state-changed']);

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

// Stepper state
const stepperActive = ref(false);
const currentStepIndex = ref(0);
const routeSteps = ref([]);
const completedSteps = ref(new Set());
const stepperInfoVisible = ref(true);

const currentStep = computed(() => {
  if (!stepperActive.value || routeSteps.value.length === 0) return null;
  return routeSteps.value[currentStepIndex.value] || null;
});

const nextStep = computed(() => {
  if (!stepperActive.value || routeSteps.value.length === 0) return null;
  const nextIndex = currentStepIndex.value + 1;
  return nextIndex < routeSteps.value.length ? routeSteps.value[nextIndex] : null;
});

const previousStep = computed(() => {
  if (!stepperActive.value || routeSteps.value.length === 0) return null;
  const prevIndex = currentStepIndex.value - 1;
  return prevIndex >= 0 ? routeSteps.value[prevIndex] : null;
});

const isFirstStep = computed(() => currentStepIndex.value === 0);
const isLastStep = computed(() => currentStepIndex.value === routeSteps.value.length - 1);
const totalSteps = computed(() => routeSteps.value.length);
const completedCount = computed(() => completedSteps.value.size);

// Use pathfinding composable
const { 
  pathMode,
  selectedAisles,
  startPoint,
  endPoint,
  pathfinder,
  aisleNavigationPoints,
  initPathfinder, 
  togglePathMode, 
  handleAisleSelection,
  clearPathVisualization,
  resetPathMode,
  calculateRouteWithPathfinder,
  getAccessPoint
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
  clearPath,
  startStepper,
  stopStepper,
  createRouteFromList,
  nextStepAction,
  previousStepAction
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
    // Sync calculated points to local shelfAccessPoints
    shelfAccessPoints.value = { ...shelfAccessPoints.value, ...calculatedAccessPoints };
    // Emit calculated access points to be saved
    emit('access-points-calculated', calculatedAccessPoints);
  }
  
  // Sync existing shelf access points to the composable's aisleNavigationPoints
  if (Object.keys(shelfAccessPoints.value).length > 0) {
    Object.entries(shelfAccessPoints.value).forEach(([aisleId, point]) => {
      aisleNavigationPoints.value[aisleId] = point;
    });
    console.log('Synced shelf access points to pathfinder:', Object.keys(shelfAccessPoints.value).length);
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

function handleStartNavigation() {
  // Get actual route using pathfinder
  if (!selectedList.value) return;
  
  console.log('Starting navigation for list:', selectedList.value.name);
  
  // Create route steps using pathfinder
  const routeSteps = createRouteFromList(selectedList.value);
  
  if (routeSteps && routeSteps.length > 0) {
    console.log(`Created route with ${routeSteps.length} steps`);
    startStepper(routeSteps);
    sidebarOpen.value = false;
  } else {
    alert('Unable to create navigation route. Please ensure the map has been properly initialized.');
  }
}

function createRouteFromList(list) {
  if (!pathfinder.value) {
    console.error('Pathfinder not initialized');
    return null;
  }

  // Group items by aisle/category
  const aisleGroups = {};
  
  if (list.items) {
    list.items.forEach(item => {
      // Find which aisle this item belongs to based on category
      const categoryId = item.category_id || item.product?.category_id;
      
      if (!categoryId) {
        console.warn('Item has no category:', item);
        return;
      }
      
      // Find aisle that contains this category
      let targetAisleId = null;
      Object.entries(aisleCategories.value).forEach(([aisleId, categories]) => {
        if (categories.includes(categoryId)) {
          targetAisleId = aisleId;
        }
      });
      
      if (!targetAisleId) {
        console.warn(`No aisle found for category ${categoryId}:`, item);
        return;
      }
      
      if (!aisleGroups[targetAisleId]) {
        aisleGroups[targetAisleId] = [];
      }
      aisleGroups[targetAisleId].push(item);
    });
  }
  
  console.log('Grouped items by aisle:', aisleGroups);
  
  if (Object.keys(aisleGroups).length === 0) {
    console.error('No aisles found for items');
    return null;
  }
  
  // Build waypoints with access points - use the split IDs directly
  const waypoints = Object.entries(aisleGroups).map(([aisleId, items]) => {
    // Try to get access point with the split ID first
    let accessPoint = shelfAccessPoints.value[aisleId];
    
    // If not found, try without the split suffix (fallback)
    if (!accessPoint) {
      const baseId = aisleId.replace(/-split-\d+$/, '');
      accessPoint = shelfAccessPoints.value[baseId];
    }
    
    // If still not found, try to find any split of this base ID
    if (!accessPoint) {
      const baseId = aisleId.replace(/-split-\d+$/, '');
      const splitPattern = new RegExp(`^${baseId}-split-\\d+$`);
      const matchingKey = Object.keys(shelfAccessPoints.value).find(key => splitPattern.test(key));
      if (matchingKey) {
        accessPoint = shelfAccessPoints.value[matchingKey];
      }
    }
    
    if (!accessPoint) {
      console.warn(`No access point for aisle ${aisleId}`, 'Available:', Object.keys(shelfAccessPoints.value));
      return null;
    }
    
    // Use base ID for the name (without split suffix)
    const baseId = aisleId.replace(/-split-\d+$/, '');
    
    return {
      aisleId: baseId,
      splitId: aisleId,
      position: accessPoint,
      name: aisleNames.value[baseId] || aisleNames.value[aisleId] || `Aisle ${baseId}`,
      items: items
    };
  }).filter(wp => wp !== null);
  
  // Remove duplicate base aisles (keep first occurrence)
  const seenBaseIds = new Set();
  const uniqueWaypoints = waypoints.filter(wp => {
    if (seenBaseIds.has(wp.aisleId)) {
      // Merge items into the first waypoint with this base ID
      const existing = waypoints.find(w => w.aisleId === wp.aisleId);
      if (existing) {
        existing.items.push(...wp.items);
      }
      return false;
    }
    seenBaseIds.add(wp.aisleId);
    return true;
  });
  
  if (waypoints.length === 0) {
    console.error('No valid waypoints found');
    return null;
  }
  
  console.log(`Calculating route through ${uniqueWaypoints.length} waypoints`);
  
  // Use pathfinder to calculate optimal route
  const route = pathfinder.value.calculateRoute(uniqueWaypoints);
  
  if (!route) {
    console.error('Failed to calculate route');
    return null;
  }
  
  console.log('Route calculated:', route);
  return route;
}

function createMockStepsFromList(list) {
  // Create steps from shopping list items
  // Group items by aisle and create navigation points
  const steps = [];
  
  // Add start point
  steps.push({
    name: 'Entrance',
    position: { x: 100, y: 100 }, // Default start position
    items: []
  });
  
  // Group items by aisle
  const aisleGroups = {};
  if (list.items) {
    list.items.forEach(item => {
      // Try to find which aisle this item belongs to
      // This is a simplified version - in production, match with actual aisle categories
      const aisleId = item.category_id || 'unknown';
      if (!aisleGroups[aisleId]) {
        aisleGroups[aisleId] = [];
      }
      aisleGroups[aisleId].push(item);
    });
  }
  
  // Create step for each aisle group
  Object.entries(aisleGroups).forEach(([aisleId, items], index) => {
    const aisleName = aisleNames.value[aisleId] || `Aisle ${aisleId}`;
    
    // Try to find the actual position from the map
    let position = { x: 200 + (index * 150), y: 200 + (index * 100) };
    
    // Try to get actual shelf position if available
    if (shelfAccessPoints.value[aisleId]) {
      position = shelfAccessPoints.value[aisleId];
    } else if (props.shopMap?.entities?.shelves) {
      const shelf = props.shopMap.entities.shelves.find(s => s.id == aisleId);
      if (shelf && shelf.points && shelf.points.length > 0) {
        // Use center of shelf
        const xs = shelf.points.map(p => p.x);
        const ys = shelf.points.map(p => p.y);
        position = {
          x: (Math.min(...xs) + Math.max(...xs)) / 2,
          y: (Math.min(...ys) + Math.max(...ys)) / 2
        };
      }
    }
    
    steps.push({
      name: aisleName,
      position: position,
      items: items,
      aisleId: aisleId
    });
  });
  
  return steps;
}

function startStepper(steps) {
  if (!steps || steps.length === 0) {
    console.error('No steps provided to stepper');
    return;
  }
  
  routeSteps.value = steps;
  currentStepIndex.value = 0;
  completedSteps.value = new Set();
  stepperActive.value = true;
  stepperInfoVisible.value = true;
  
  // Emit stepper state
  emit('stepper-state-changed', {
    active: true,
    currentStep: currentStepIndex.value,
    totalSteps: steps.length,
    steps: steps
  });
  
  // Zoom to first step
  zoomToStep(0);
  
  // Draw initial path visualization
  setTimeout(() => {
    updateStepVisualization();
  }, 100);
}

function stopStepper() {
  stepperActive.value = false;
  currentStepIndex.value = 0;
  routeSteps.value = [];
  completedSteps.value = new Set();
  
  // Emit stepper state
  emit('stepper-state-changed', {
    active: false,
    currentStep: 0,
    totalSteps: 0,
    steps: []
  });
}

function nextStepAction() {
  if (isLastStep.value) {
    completeAllItems();
    return;
  }
  
  // Mark current step as completed
  completedSteps.value.add(currentStepIndex.value);
  
  currentStepIndex.value++;
  zoomToCurrentAndNext();
  
  // Update visual highlighting
  updateStepVisualization();
  
  // Emit updated state
  emit('stepper-state-changed', {
    active: true,
    currentStep: currentStepIndex.value,
    totalSteps: routeSteps.value.length,
    steps: routeSteps.value
  });
}

function previousStepAction() {
  if (!isFirstStep.value) {
    currentStepIndex.value--;
    zoomToCurrentAndNext();
    updateStepVisualization();
    
    // Emit updated state
    emit('stepper-state-changed', {
      active: true,
      currentStep: currentStepIndex.value,
      totalSteps: routeSteps.value.length,
      steps: routeSteps.value
    });
  }
}

function zoomToStep(stepIndex) {
  if (!routeSteps.value[stepIndex] || !stage.value) return;
  
  const step = routeSteps.value[stepIndex];
  const nextStepData = routeSteps.value[stepIndex + 1];
  
  // Get bounding box for current and next step
  const points = [step.position];
  if (nextStepData) {
    points.push(nextStepData.position);
    
    // Include all path points if available for better framing
    if (nextStepData.pathFromPrevious && nextStepData.pathFromPrevious.length > 0) {
      points.push(...nextStepData.pathFromPrevious);
    }
  }
  
  zoomToBounds(points, 400); // Increased padding to ensure whole route is visible
}

function zoomToCurrentAndNext() {
  zoomToStep(currentStepIndex.value);
}

function zoomToBounds(points, padding = 100) {
  if (!stage.value || !containerRef.value || points.length === 0) return;
  
  // Calculate bounding box
  const xs = points.map(p => p.x);
  const ys = points.map(p => p.y);
  
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  
  const width = maxX - minX;
  const height = maxY - minY;
  
  // Calculate scale to fit with padding
  const containerWidth = containerRef.value.offsetWidth;
  const containerHeight = containerRef.value.offsetHeight;
  
  // Account for stepper overlay at the bottom
  // Info panel + controls can be quite tall (especially on mobile when showing items)
  const bottomOverlayHeight = window.innerWidth < 1024 ? 400 : 280;
  const effectiveHeight = containerHeight - bottomOverlayHeight;
  
  const scaleX = containerWidth / (width + padding * 2);
  const scaleY = effectiveHeight / (height + padding * 2);
  const scale = Math.min(scaleX, scaleY, ZOOM_MAX);
  const finalScale = Math.max(scale, minZoomLevel.value);
  
  // Calculate center position
  const centerX = (minX + maxX) / 2;
  const centerY = (minY + maxY) / 2;
  
  // Calculate new position to center the bounds
  // Shift upward significantly to account for bottom overlay
  const verticalOffset = bottomOverlayHeight / 1.5; // More aggressive shift
  const newX = containerWidth / 2 - centerX * finalScale;
  const newY = (containerHeight - verticalOffset) / 2 - centerY * finalScale;
  
  // Animate to new position and scale
  const tween = new Konva.Tween({
    node: stage.value,
    duration: 0.3,
    x: newX,
    y: newY,
    scaleX: finalScale,
    scaleY: finalScale,
    easing: Konva.Easings.EaseInOut
  });
  
  tween.play();
  zoom.value = finalScale;
}

function updateStepVisualization() {
  if (!mainLayer.value || !stepperActive.value) return;
  
  // Remove existing step indicators and paths
  const existingIndicators = mainLayer.value.find('.step-indicator');
  existingIndicators.forEach(indicator => indicator.destroy());
  
  const existingPaths = mainLayer.value.find('.step-path');
  existingPaths.forEach(path => path.destroy());
  
  // Draw path from current to next step
  if (currentStep.value && nextStep.value && nextStep.value.pathFromPrevious) {
    const path = nextStep.value.pathFromPrevious;
    
    if (path && path.length > 1) {
      // Create line points array [x1, y1, x2, y2, ...]
      const points = path.flatMap(p => [p.x, p.y]);
      
      // Draw the path line
      const pathLine = new Konva.Line({
        points: points,
        stroke: '#3b82f6',
        strokeWidth: 16,
        lineJoin: 'round',
        lineCap: 'round',
        opacity: 0.8,
        name: 'step-path',
        listening: false,
        dash: [20, 10]
      });
      
      // Draw shadow for better visibility
      const pathShadow = new Konva.Line({
        points: points,
        stroke: '#000000',
        strokeWidth: 20,
        lineJoin: 'round',
        lineCap: 'round',
        opacity: 0.2,
        name: 'step-path',
        listening: false,
        dash: [20, 10]
      });
      
      mainLayer.value.add(pathShadow);
      mainLayer.value.add(pathLine);
      
      // Animate the dash
      const anim = new Konva.Animation((frame) => {
        const dashOffset = (frame.time / 50) % 30;
        pathLine.dashOffset(-dashOffset);
      }, mainLayer.value);
      anim.start();
      
      // Store animation reference to stop it later
      pathLine.animRef = anim;
    }
  }
  
  // Add indicator for current step
  if (currentStep.value && currentStep.value.position) {
    const indicator = new Konva.Circle({
      x: currentStep.value.position.x,
      y: currentStep.value.position.y,
      radius: 30,
      fill: '#3b82f6',
      opacity: 0.6,
      name: 'step-indicator',
      listening: false
    });
    
    const pulse = new Konva.Circle({
      x: currentStep.value.position.x,
      y: currentStep.value.position.y,
      radius: 30,
      stroke: '#3b82f6',
      strokeWidth: 3,
      opacity: 1,
      name: 'step-indicator',
      listening: false
    });
    
    // Add label
    const label = new Konva.Text({
      x: currentStep.value.position.x,
      y: currentStep.value.position.y,
      text: '📍',
      fontSize: 24,
      offsetX: 12,
      offsetY: 12,
      name: 'step-indicator',
      listening: false
    });
    
    mainLayer.value.add(indicator);
    mainLayer.value.add(pulse);
    mainLayer.value.add(label);
    
    // Pulse animation
    const anim = new Konva.Tween({
      node: pulse,
      duration: 1,
      radius: 50,
      opacity: 0,
      easing: Konva.Easings.EaseOut,
      onFinish: function() {
        if (stepperActive.value) {
          pulse.radius(30);
          pulse.opacity(1);
          this.play();
        }
      }
    });
    anim.play();
  }
  
  // Add indicator for next step
  if (nextStep.value && nextStep.value.position) {
    const nextIndicator = new Konva.Circle({
      x: nextStep.value.position.x,
      y: nextStep.value.position.y,
      radius: 20,
      fill: '#10b981',
      opacity: 0.5,
      name: 'step-indicator',
      listening: false
    });
    
    const nextLabel = new Konva.Text({
      x: nextStep.value.position.x,
      y: nextStep.value.position.y,
      text: '🎯',
      fontSize: 20,
      offsetX: 10,
      offsetY: 10,
      name: 'step-indicator',
      listening: false
    });
    
    mainLayer.value.add(nextIndicator);
    mainLayer.value.add(nextLabel);
  }
  
  mainLayer.value.batchDraw();
}

function completeAllItems() {
  // Mark all steps as completed
  for (let i = 0; i < routeSteps.value.length; i++) {
    completedSteps.value.add(i);
  }
  
  // Collect all item IDs from the route
  const itemIds = routeSteps.value
    .filter(step => step.items && step.items.length > 0)
    .flatMap(step => step.items.map(item => item.id));
  
  // Emit event to mark items as completed
  if (itemIds.length > 0) {
    emit('items-completed', {
      listId: props.selectedShoppingListId,
      itemIds: itemIds
    });
  }
  
  // Reset stepper
  stopStepper();
  
  // Reset view
  setTimeout(() => {
    resetView();
  }, 100);
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
          <h2 class="text-xl font-bold theme-text">{{ $t('Menu') }}</h2>
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
            <p><span class="font-semibold">{{ $t('Floor Plan') }}</span></p>
            <p><span class="font-semibold">{{ $t('Dimensions:') }}</span> {{ shopMap.bounds.width.toFixed(0) }} × {{ shopMap.bounds.height.toFixed(0) }}</p>
          </div>
        </div>

        <!-- Shopping List Section - Mobile only -->
        <div v-if="showShoppingLists && !stepperActive" class="mb-6 lg:hidden">
          <h3 class="text-sm font-semibold theme-text mb-3 opacity-70">{{ $t('Shopping Navigation') }}</h3>
          <p class="text-xs theme-text opacity-60 mb-3">{{ $t('Select a list to navigate') }}</p>
          
          <select 
            :value="selectedShoppingListId"
            @change="handleShoppingListChange"
            class="w-full theme-surface theme-text px-3 py-2 rounded-lg border theme-border mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          >
            <option value="">{{ $t('Select a shopping list...') }}</option>
            <option v-for="list in shoppingLists" :key="list.id" :value="list.id">
              {{ list.name }} ({{ list.items.length }} {{ $t('items') }})
            </option>
          </select>

          <div class="flex gap-2">
            <button 
              @click="handleHighlightAisles"
              :disabled="!selectedShoppingListId || loadingShoppingLists"
              class="flex-1 theme-btn-primary py-2.5 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 text-sm"
            >
              {{ loadingShoppingLists ? $t('Loading...') : $t('Highlight') }}
            </button>
            
            <button 
              @click="handleStartNavigation"
              :disabled="!selectedShoppingListId || loadingShoppingLists"
              class="flex-1 bg-green-500 hover:bg-green-600 text-white py-2.5 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 text-sm"
            >
              {{ $t('Navigate') }}
            </button>
          </div>

          <!-- Selected List Info -->
          <div v-if="selectedList" class="mt-3 theme-surface rounded-lg p-3 border theme-border">
            <h4 class="font-semibold theme-text text-xs mb-2">{{ selectedList.name }}</h4>
            <p class="text-xs theme-text opacity-60 mb-2">{{ selectedList.items.length }} {{ $t('items') }}</p>
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
          <h3 class="text-sm font-semibold theme-text mb-3 opacity-70">{{ $t('Zoom Controls') }}</h3>
          <div class="flex gap-2">
            <button 
              @click="zoomIn(); sidebarOpen = false"
              class="flex-1 theme-surface border theme-border rounded-lg py-3 font-semibold theme-text hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors active:scale-95"
            >
              {{ $t('+ Zoom In') }}
            </button>
            <button 
              @click="zoomOut(); sidebarOpen = false"
              class="flex-1 theme-surface border theme-border rounded-lg py-3 font-semibold theme-text hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors active:scale-95"
            >
              {{ $t('− Zoom Out') }}
            </button>
          </div>
          <button 
            @click="resetView(); sidebarOpen = false"
            class="w-full mt-2 theme-surface border theme-border rounded-lg py-3 font-semibold theme-text hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors active:scale-95"
          >
            {{ $t('⟲ Reset View') }}
          </button>
          <div class="mt-3 text-center">
            <div class="text-sm font-medium theme-text">
              {{ $t('Current Zoom:') }} {{ (zoom * 100).toFixed(0) }}%
            </div>
          </div>
        </div>

        <!-- Help -->
        <div class="border-t theme-border pt-4">
          <h3 class="text-sm font-semibold theme-text mb-3 opacity-70">{{ $t('Tips') }}</h3>
          <div class="text-sm theme-text space-y-2 opacity-75">
            <p>{{ $t('💡 Pinch to zoom on mobile') }}</p>
            <p>{{ $t('👆 Drag to pan around the map') }}</p>
            <p>{{ $t('🔍 Use search to find specific aisles') }}</p>
            <p v-if="isAdmin">{{ $t('✏️ Right-click to edit (desktop)') }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Info Panel (Top-left) - Desktop Only -->\n    <transition name="slide-right">
      <div v-if="false" v-show="showInfo" class="hidden lg:block absolute top-4 left-4 theme-surface rounded-lg shadow-lg p-4 max-w-sm z-10">
        <button @click="showInfo = false" class="absolute top-2 right-2 w-6 h-6 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center justify-center text-sm theme-text">✕</button>
        
        <h2 v-if="shopName" class="text-lg font-bold theme-text mb-2 flex items-center gap-2">
          <span>📍</span>
          <span class="truncate">{{ shopName }}</span>
        </h2>
        <h3 class="text-sm font-semibold theme-text opacity-70 mb-1">{{ $t('Floor Plan') }}</h3>
        <p class="text-sm theme-text"><span class="font-semibold">{{ $t('Dimensions:') }}</span> {{ shopMap.bounds.width.toFixed(0) }} × {{ shopMap.bounds.height.toFixed(0) }}</p>
      </div>
    </transition>

    <button v-if="false" v-show="!showInfo" @click="showInfo = true" class="hidden lg:block absolute top-4 left-4 theme-surface rounded-lg shadow-lg px-4 py-2 hover:shadow-xl transition-shadow z-10 theme-text font-medium">
      ℹ️ {{ $t('Info') }}
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
          :placeholder="$t('Search aisles...')" 
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
          {{ searchResults.length }} {{ searchResults.length !== 1 ? $t('results') : $t('result') }} {{ $t('found') }}
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
                {{ $t('Category:') }} {{ result.categoryName }}
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
    <div v-if="!stepperActive" class="hidden lg:block absolute bottom-4 left-1/2 transform -translate-x-1/2 theme-surface rounded-full shadow-md px-4 py-2 z-10">
      <div class="text-xs theme-text flex items-center gap-3">
        <span>{{ $t('Scroll to zoom') }}</span>
        <span class="text-gray-400">•</span>
        <span>{{ $t('Drag to pan') }}</span>
        <span v-if="isAdmin" class="text-gray-400">•</span>
        <span v-if="isAdmin">{{ $t('Right-click to edit') }}</span>
      </div>
    </div>

    <!-- Stepper Controls (Bottom-center, Mobile Only) -->
    <transition name="slide-up">
      <div v-if="stepperActive" class="lg:hidden absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20 w-[95vw]">
        <!-- Info Panel -->
        <transition name="slide-down">
          <div v-if="stepperInfoVisible" class="theme-surface rounded-lg shadow-2xl p-3 md:p-4 mb-3 border theme-border">
            <div class="flex items-start justify-between mb-3">
              <div class="flex-1">
                <div class="text-xs md:text-sm text-gray-500 dark:text-gray-400 mb-1">
                  {{ $t('Step') }} {{ currentStepIndex + 1 }} {{ $t('of') }} {{ totalSteps }}
                </div>
                <div class="text-lg md:text-xl font-bold theme-text mb-2">
                  {{ currentStep?.name || $t('Current Location') }}
                </div>
              </div>
              <button 
                @click="stepperInfoVisible = false"
                class="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ml-2"
              >
                <svg class="w-4 h-4 theme-text" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>

            <!-- Items at Current Step -->
            <div v-if="currentStep?.items && currentStep.items.length > 0" class="mb-3">
              <div class="text-xs md:text-sm font-semibold theme-text mb-2 flex items-center gap-2">
                <span>📋</span>
                <span>{{ $t('Items to collect:') }}</span>
              </div>
              <div class="space-y-1 max-h-32 overflow-y-auto">
                <div 
                  v-for="item in currentStep.items" 
                  :key="item.id"
                  class="text-xs md:text-sm theme-text bg-blue-50 dark:bg-blue-900/20 rounded px-2 py-1.5 flex items-center gap-2"
                >
                  <span class="text-blue-500">✓</span>
                  <span>{{ item.name }}</span>
                  <span v-if="item.quantity > 1" class="text-gray-500 text-xs">× {{ item.quantity }}</span>
                </div>
              </div>
            </div>

            <!-- Next Step Preview -->
            <div v-if="nextStep" class="border-t theme-border pt-3">
              <div class="text-xs md:text-sm text-gray-500 dark:text-gray-400 mb-1">
                {{ $t('Next:') }} {{ nextStep.name }}
              </div>
              <div v-if="nextStep.items && nextStep.items.length > 0" class="text-xs theme-text opacity-70">
                {{ nextStep.items.length }} {{ nextStep.items.length !== 1 ? $t('items') : $t('item') }} {{ $t('to collect') }}
              </div>
            </div>

            <!-- Completion Status -->
            <div class="border-t theme-border pt-3 mt-3">
              <div class="flex items-center justify-between text-xs md:text-sm">
                <span class="theme-text">{{ $t('Progress') }}</span>
                <span class="font-semibold theme-text">{{ completedCount }} / {{ totalSteps - 1 }}</span>
              </div>
              <div class="mt-2 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div 
                  class="h-full bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-300"
                  :style="{ width: `${(completedCount / Math.max(totalSteps - 1, 1)) * 100}%` }"
                ></div>
              </div>
            </div>
          </div>
        </transition>

        <!-- Collapsed Info Button -->
        <button 
          v-if="!stepperInfoVisible"
          @click="stepperInfoVisible = true"
          class="theme-surface rounded-lg shadow-lg px-4 py-2 mb-3 mx-auto block hover:shadow-xl transition-all active:scale-95"
        >
          <div class="flex items-center gap-2 text-sm theme-text">
            <span>{{ $t('Step') }} {{ currentStepIndex + 1 }} / {{ totalSteps }}</span>
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
            </svg>
          </div>
        </button>

        <!-- Navigation Controls -->
        <div class="theme-surface rounded-lg shadow-2xl p-2 md:p-3 flex items-center justify-between gap-2">
          <button 
            @click="previousStepAction"
            :disabled="isFirstStep"
            class="flex-shrink-0 px-3 md:px-4 py-2 md:py-3 rounded-lg font-medium transition-all disabled:opacity-30 disabled:cursor-not-allowed active:scale-95 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 theme-text text-sm md:text-base"
          >
            <span class="hidden md:inline">{{ $t('← Previous') }}</span>
            <span class="md:hidden">←</span>
          </button>

          <div class="flex-1 text-center">
            <div class="text-xs md:text-sm theme-text font-medium truncate px-2">
              {{ currentStep?.name || 'Start' }}
            </div>
          </div>

          <button 
            @click="nextStepAction"
            class="flex-shrink-0 px-3 md:px-4 py-2 md:py-3 rounded-lg font-medium transition-all active:scale-95 theme-text text-sm md:text-base"
            :class="isLastStep ? 'bg-green-500 hover:bg-green-600 text-white' : 'bg-blue-500 hover:bg-blue-600 text-white'"
          >
            <span class="hidden md:inline">{{ isLastStep ? $t('Complete ✓') : $t('Next →') }}</span>
            <span class="md:hidden">{{ isLastStep ? '✓' : '→' }}</span>
          </button>

          <button 
            @click="stopStepper"
            class="flex-shrink-0 p-2 md:p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors active:scale-95"
            :title="$t('Exit navigation')"
          >
            <svg class="w-5 h-5 theme-text" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </transition>

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

<style scoped>
/* Slide transitions */
.slide-right-enter-active,
.slide-right-leave-active,
.slide-left-enter-active,
.slide-left-leave-active,
.slide-up-enter-active,
.slide-up-leave-active,
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
}

.slide-right-enter-from {
  transform: translateX(-20px);
  opacity: 0;
}

.slide-right-leave-to {
  transform: translateX(-20px);
  opacity: 0;
}

.slide-left-enter-from {
  transform: translateX(20px);
  opacity: 0;
}

.slide-left-leave-to {
  transform: translateX(20px);
  opacity: 0;
}

.slide-up-enter-from {
  transform: translate(-50%, 20px);
  opacity: 0;
}

.slide-up-leave-to {
  transform: translate(-50%, 20px);
  opacity: 0;
}

.slide-down-enter-from {
  transform: translateY(-10px);
  opacity: 0;
}

.slide-down-leave-to {
  transform: translateY(-10px);
  opacity: 0;
}

/* Touch improvements */
@media (max-width: 768px) {
  button {
    -webkit-tap-highlight-color: transparent;
  }
}
</style>
