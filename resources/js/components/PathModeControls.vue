<script setup>
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

const emit = defineEmits(['toggle-path-mode', 'clear-path']);

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
</script>

<template>
  <div>
    <!-- Pathfinding Toggle Button -->
    <button 
      @click="emit('toggle-path-mode')" 
      :class="['absolute top-4 right-4 theme-surface rounded-lg shadow-lg px-4 py-2 hover:shadow-xl transition-all z-10 theme-text font-medium flex items-center gap-2',
        pathMode ? 'ring-2 ring-blue-500' : '']"
    >
      <span class="text-lg">{{ pathMode ? '🧭' : '🗺️' }}</span>
      <span>{{ pathMode ? 'Navigation Mode' : 'Navigate' }}</span>
      <span v-if="pathMode && selectedAisles.length > 0" class="ml-1 px-2 py-0.5 bg-blue-500 text-white text-xs rounded-full">
        {{ selectedAisles.length }}
      </span>
    </button>

    <!-- Clear Path Button -->
    <button 
      v-if="pathMode && selectedAisles.length > 0"
      @click="emit('clear-path')"
      class="absolute top-4 right-52 theme-surface rounded-lg shadow-lg px-3 py-2 hover:shadow-xl transition-all z-10 theme-text text-sm flex items-center gap-1 hover:bg-red-50 dark:hover:bg-red-900"
    >
      <span>🗑️</span>
      <span>Clear Route</span>
    </button>

    <!-- Path Mode Instructions & Selected Aisles -->
    <transition name="slide-down">
      <div v-if="pathMode" class="absolute top-20 right-4 theme-surface rounded-lg shadow-lg px-4 py-3 z-10 max-w-xs">
        <div class="mb-3">
          <p class="text-sm theme-text font-semibold mb-1">🧭 Select aisles to navigate</p>
          <p class="text-xs theme-text opacity-70">
            Click on aisles to add them to your route
          </p>
        </div>
        
        <!-- Selected Aisles List -->
        <div v-if="selectedAisles.length > 0 || startPoint || endPoint" class="border-t border-gray-200 dark:border-gray-700 pt-2 mt-2">
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
