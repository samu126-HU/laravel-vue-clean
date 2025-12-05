<script setup>
import { ref } from 'vue';
import { ShopMap } from '../utils/dxfConverter.js';

const emit = defineEmits(['mapLoaded']);

const fileInput = ref(null);
const isProcessing = ref(false);
const errorMessage = ref(null);

function triggerFileUpload() {
  fileInput.value?.click();
}

function handleFileUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  errorMessage.value = null;
  isProcessing.value = true;

  readFile(file);
}

function readFile(file) {
  const reader = new FileReader();
  
  reader.onload = async (e) => {
    try {
      // Parse in next tick to prevent UI blocking
      await new Promise(resolve => setTimeout(resolve, 0));
      
      const map = parseAndConvert(e.target.result);
      
      if (map) {
        emit('mapLoaded', map);
      } else {
        setError('Failed to parse DXF file');
      }
    } catch (error) {
      handleError(error);
    } finally {
      isProcessing.value = false;
    }
  };

  reader.onerror = () => {
    handleError(new Error('Failed to read file'));
    isProcessing.value = false;
  };

  reader.readAsText(file);
}

function parseAndConvert(dxfContent) {
  return ShopMap.fromDXFFile(dxfContent);
}

function handleError(error) {
  console.error('Error loading DXF:', error);
  setError('Error loading DXF file. Please check the file format.');
}

function setError(message) {
  errorMessage.value = message;
}
</script>

<template>
  <div class="mb-4">
    <div class="flex items-center gap-3">
      <button 
        @click="triggerFileUpload"
        :disabled="isProcessing"
        class="px-4 py-2 theme-btn-primary rounded transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {{ isProcessing ? 'Processing...' : 'Upload DXF File' }}
      </button>

      <!-- Info tooltip -->
      <div class="relative group">
        <button class="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 text-xs font-bold hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors">
          ?
        </button>
        <div class="absolute left-0 top-8 w-80 theme-surface rounded-lg shadow-xl p-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
          <h4 class="font-bold theme-text mb-2">📐 DXF Layer Guide</h4>
          <div class="text-sm theme-text space-y-2">
            <div>
              <strong class="text-blue-600 dark:text-blue-400">SHELVES</strong> - Draw your aisles/shelves here
            </div>
            <div>
              <strong class="text-orange-600 dark:text-orange-400">SPLITTER</strong> - Draw lines to split aisles into sections
            </div>
            <div>
              <strong class="text-green-600 dark:text-green-400">START</strong> - Place a circle/line for navigation start point
            </div>
            <div>
              <strong class="text-red-600 dark:text-red-400">END</strong> - Place a circle/line for navigation end point
            </div>
            <div>
              <strong class="text-gray-600 dark:text-gray-400">WALLS</strong> - Store boundaries and walls
            </div>
            <div class="pt-2 border-t border-gray-200 dark:border-gray-700">
              <span class="text-xs opacity-60">💡 Splitter lines automatically divide intersecting aisles</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <input 
      ref="fileInput"
      type="file" 
      accept=".dxf"
      @change="handleFileUpload"
      class="hidden"
    />

    <p v-if="errorMessage" class="mt-2 text-sm text-red-500">
      {{ errorMessage }}
    </p>
  </div>
</template>
