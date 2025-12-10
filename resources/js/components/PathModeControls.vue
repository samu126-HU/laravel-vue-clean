<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';

const props = defineProps({
  pathMode: {
    type: Boolean,
    required: true
  },
  selectedAisles: {
    type: Array,
    default: () => []
  },
  aisleNames: {
    type: Object,
    default: () => ({})
  },
  startPoint: {
    type: Object,
    default: null
  },
  endPoint: {
    type: Object,
    default: null
  }
});

const emit = defineEmits(['toggle-path-mode', 'clear-path', 'select-by-category']);

const categories = ref([]);
const showCategoryMenu = ref(false);

onMounted(async () => {
  // Load categories
  try {
    const response = await axios.get('/api/categories');
    categories.value = response.data.categories;
  } catch (error) {
    console.error('Error loading categories:', error);
  }
});

function getAisleName(aisleId) {
  return props.aisleNames[aisleId] || `Aisle ${aisleId}`;
}

function getRouteItems() {
  const items = [];
  
  // Add START point if available
  if (props.startPoint) {
    items.push({ label: 'START', type: 'start' });
  }
  
  // Add selected aisles
  props.selectedAisles.forEach(aisleId => {
    items.push({ label: getAisleName(aisleId), type: 'aisle' });
  });
  
  // Add END point if available
  if (props.endPoint) {
    items.push({ label: 'END', type: 'end' });
  }
  
  return items;
}

function handleSelectByCategory(categoryId) {
  emit('select-by-category', categoryId);
  showCategoryMenu.value = false;
}
</script>

<template>
  <div>
    <!-- Pathfinding Toggle Button - Mobile Optimized -->
    <button 
      @click="emit('toggle-path-mode')" 
      :class="['absolute top-20 right-2 md:top-4 md:right-4 theme-surface rounded-lg shadow-lg px-3 py-2 md:px-4 hover:shadow-xl active:scale-95 transition-all z-20 theme-text text-sm md:text-base font-medium flex items-center gap-2 touch-manipulation',
        pathMode ? 'ring-2 ring-blue-500' : '']"
    >
      <span class="text-base md:text-lg">{{ pathMode ? '🧭' : '🗺️' }}</span>
      <span class="hidden sm:inline">{{ pathMode ? 'Navigation' : 'Navigate' }}</span>
      <span v-if="pathMode && selectedAisles.length > 0" class="ml-1 px-2 py-0.5 bg-blue-500 text-white text-xs rounded-full">
        {{ selectedAisles.length }}
      </span>
    </button>

    <!-- Clear Path Button - Mobile Optimized -->
    <button 
      v-if="pathMode && selectedAisles.length > 0"
      @click="emit('clear-path')"
      class="absolute top-20 right-24 sm:right-32 md:top-4 md:right-52 theme-surface rounded-lg shadow-lg px-2 py-2 md:px-3 hover:shadow-xl active:scale-95 transition-all z-20 theme-text text-xs md:text-sm flex items-center gap-1 hover:bg-red-50 dark:hover:bg-red-900 touch-manipulation"
    >
      <span>🗑️</span>
      <span class="hidden sm:inline">Clear</span>
    </button>

    <!-- Select by Category Button -->
    <div v-if="pathMode" class="absolute top-32 sm:top-20 right-2 md:top-16 md:right-4 z-20">
      <button 
        @click="showCategoryMenu = !showCategoryMenu"
        class="theme-surface rounded-lg shadow-lg px-2 py-2 md:px-3 hover:shadow-xl active:scale-95 transition-all theme-text text-xs md:text-sm flex items-center gap-1 hover:bg-blue-50 dark:hover:bg-blue-900 touch-manipulation"
      >
        <span>🏷️</span>
        <span class="hidden sm:inline">Select by Category</span>
      </button>

      <!-- Category Dropdown Menu -->
      <transition name="slide-down">
        <div v-if="showCategoryMenu" class="absolute right-0 mt-2 theme-surface rounded-lg shadow-xl overflow-hidden min-w-[200px] max-h-[300px] overflow-y-auto">
          <div class="py-1">
            <button
              v-for="category in categories"
              :key="category.id"
              @click="handleSelectByCategory(category.id)"
              class="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 theme-text text-sm flex items-center gap-2 transition-colors"
            >
              <span class="text-lg">{{ category.icon }}</span>
              <span>{{ category.name }}</span>
            </button>
            <div v-if="categories.length === 0" class="px-4 py-2 text-sm theme-text opacity-60">
              No categories available
            </div>
          </div>
        </div>
      </transition>
    </div>

    <!-- Path Mode Instructions & Selected Aisles - Mobile Optimized -->
    <transition name="slide-down">
      <div v-if="pathMode" class="absolute top-32 left-2 right-2 md:top-20 md:left-auto md:right-4 theme-surface rounded-lg shadow-lg px-3 md:px-4 py-3 z-20 max-w-full md:max-w-xs">
        <div class="mb-2 md:mb-3">
          <p class="text-xs md:text-sm theme-text font-semibold mb-1">🧭 Select aisles to navigate</p>
          <p class="text-xs theme-text opacity-70 hidden md:block">
            Click on aisles to add them to your route
          </p>
        </div>
        
        <!-- Selected Aisles List -->
        <div v-if="selectedAisles.length > 0 || startPoint || endPoint" class="border-t border-gray-200 dark:border-gray-700 pt-2">
          <p class="text-xs theme-text font-semibold mb-2">Optimized Route:</p>
          <div class="space-y-1">
            <div 
              v-for="(item, index) in getRouteItems()" 
              :key="index"
              class="flex items-center gap-2 text-xs theme-text"
            >
              <span 
                class="shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold"
                :class="{
                  'bg-green-500': item.type === 'start',
                  'bg-red-500': item.type === 'end',
                  'bg-orange-500': item.type === 'aisle'
                }"
              >
                {{ item.type === 'start' ? 'S' : (item.type === 'end' ? 'E' : index - (startPoint ? 1 : 0) + 1) }}
              </span>
              <span class="truncate" :class="{ 'font-bold': item.type === 'start' || item.type === 'end' }">
                {{ item.label }}
              </span>
            </div>
          </div>
        </div>
        
        <div v-else class="text-xs theme-text opacity-60 text-center py-2 border-t border-gray-200 dark:border-gray-700 mt-2">
          No aisles selected yet
        </div>
      </div>
    </transition>
  </div>
</template>

<style scoped>
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
}

.slide-down-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
