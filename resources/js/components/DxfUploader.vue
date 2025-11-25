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
  
  reader.onload = (e) => {
    try {
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
    <button 
      @click="triggerFileUpload"
      :disabled="isProcessing"
      class="px-4 py-2 theme-btn-primary rounded transition disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {{ isProcessing ? 'Processing...' : 'Upload DXF File' }}
    </button>
    
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
