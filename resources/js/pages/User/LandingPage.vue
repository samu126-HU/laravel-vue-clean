<script setup>
import { ref, onMounted } from 'vue';
import PageHead from '../../components/PageHead.vue';
import MapViewer from '../../components/MapViewer.vue';
import DxfUploader from '../../components/DxfUploader.vue';
import axios from 'axios';

const shopMap = ref(null);
const loading = ref(true);
const shopInfo = ref(null);

onMounted(async () => {
  // Load the latest shop from database on page load
  try {
    const response = await axios.get('/api/shops/latest');
    if (response.data.map) {
      shopMap.value = response.data.map;
      shopInfo.value = response.data.shop;
      console.log('Loaded shop from database:', shopInfo.value);
    }
  } catch (error) {
    console.error('Error loading shop:', error);
  } finally {
    loading.value = false;
  }
});

async function handleMapLoaded(map) {
  shopMap.value = map;
  
  // Save to database
  try {
    const response = await axios.post('/api/shops', {
      name: 'Test Shop',
      description: 'Auto-saved shop map',
      address: null,
      map_data: map
    });
    
    shopInfo.value = response.data.shop;
    console.log('Shop saved to database:', response.data);
  } catch (error) {
    console.error('Error saving shop:', error);
  }
}
</script>

<template>
  <PageHead title="Welcome" />

  <div class="h-full flex flex-col p-2">
    
    <DxfUploader @map-loaded="handleMapLoaded" />

    <div v-if="loading" class="flex-1 flex items-center justify-center">
      <p class="text-lg theme-text opacity-60">Loading shop...</p>
    </div>

    <div v-else-if="shopMap" class="flex-1 min-h-0">
      <MapViewer :shop-map="shopMap" />
      <div v-if="shopInfo" class="absolute top-20 left-4 theme-surface rounded-lg shadow-lg px-3 py-2 text-sm theme-text">
        📍 {{ shopInfo.name }}
      </div>
    </div>

    <p v-else class="text-lg theme-text opacity-60 p-4">
      Upload a DXF file to visualize your shop floor plan
    </p>
  </div>
</template>