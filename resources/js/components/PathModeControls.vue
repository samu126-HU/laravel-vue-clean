<script setup>
const props = defineProps({
  pathMode: {
    type: Boolean,
    required: true
  },
  waypointCount: {
    type: Number,
    default: 0
  }
});

const emit = defineEmits(['toggle-path-mode', 'clear-path']);
</script>

<template>
  <div>
    <!-- Pathfinding Toggle Button -->
    <button 
      @click="emit('toggle-path-mode')" 
      :class="['absolute top-4 right-4 theme-surface rounded-lg shadow-lg px-4 py-2 hover:shadow-xl transition-all z-10 theme-text font-medium flex items-center gap-2',
        pathMode ? 'ring-2 ring-green-500' : '']"
    >
      <span class="text-lg">{{ pathMode ? '🟢' : '🔵' }}</span>
      <span>{{ pathMode ? 'Path Mode ON' : 'Path Mode' }}</span>
      <span v-if="pathMode && waypointCount > 0" class="ml-1 px-2 py-0.5 bg-blue-500 text-white text-xs rounded-full">
        {{ waypointCount }}
      </span>
    </button>

    <!-- Clear Path Button -->
    <button 
      v-if="pathMode && waypointCount > 0"
      @click="emit('clear-path')"
      class="absolute top-4 right-52 theme-surface rounded-lg shadow-lg px-3 py-2 hover:shadow-xl transition-all z-10 theme-text text-sm flex items-center gap-1 hover:bg-red-50 dark:hover:bg-red-900"
    >
      <span>🗑️</span>
      <span>Clear Path</span>
    </button>

    <!-- Path Mode Instructions -->
    <transition name="slide-down">
      <div v-if="pathMode" class="absolute top-20 right-4 theme-surface rounded-lg shadow-lg px-4 py-3 z-10 max-w-xs">
        <p class="text-sm theme-text font-semibold mb-1">🗺️ Click multiple points to create a route</p>
        <p class="text-xs theme-text opacity-70">
          <span class="inline-block w-3 h-3 rounded-full bg-blue-500 mr-1"></span>Start
          <span class="inline-block w-3 h-3 rounded-full bg-orange-500 mx-1"></span>Waypoints
          <span class="inline-block w-3 h-3 rounded-full bg-red-500 mx-1"></span>Current End
        </p>
        <p class="text-xs theme-text opacity-60 mt-2">Click anywhere to add more waypoints</p>
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
