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
  
  // Save to database (access points will be calculated and saved via event)
  try {
    const response = await axios.post('/api/shops', {
      name: 'Test Shop',
      description: 'Auto-saved shop map',
      address: null,
      map_data: map,
      aisle_names: {},
      shelf_access_points: {} // Will be updated once calculated
    });
    
    shopInfo.value = response.data.shop;
    console.log('Shop saved to database:', response.data);
  } catch (error) {
    console.error('Error saving shop:', error);
  }
}

async function handleAccessPointsCalculated(accessPoints) {
  if (!shopInfo.value) return;
  
  console.log('Access points calculated, saving to database:', accessPoints);
  
  // Update local map data
  if (!shopMap.value.shelfAccessPoints) {
    shopMap.value.shelfAccessPoints = {};
  }
  shopMap.value.shelfAccessPoints = { ...accessPoints };
  
  // Save to database
  try {
    const response = await axios.put(`/api/shops/${shopInfo.value.id}`, {
      name: shopInfo.value.name,
      description: shopInfo.value.description,
      address: shopInfo.value.address,
      map_data: shopMap.value,
      aisle_names: shopMap.value.aisleNames || {},
      aisle_categories: shopMap.value.aisleCategories || {},
      shelf_access_points: accessPoints
    });
    console.log('Access points saved to database:', response.data);
  } catch (error) {
    console.error('Error saving access points:', error);
  }
}

async function handleAccessPointUpdated({ shelfId, accessPoint, allAccessPoints }) {
  if (!shopInfo.value) return;
  
  console.log('Access point manually updated for shelf:', shelfId, accessPoint);
  
  // Update local map data
  if (!shopMap.value.shelfAccessPoints) {
    shopMap.value.shelfAccessPoints = {};
  }
  shopMap.value.shelfAccessPoints = { ...allAccessPoints };
  
  // Save to database
  try {
    const response = await axios.put(`/api/shops/${shopInfo.value.id}`, {
      name: shopInfo.value.name,
      description: shopInfo.value.description,
      address: shopInfo.value.address,
      map_data: shopMap.value,
      aisle_names: shopMap.value.aisleNames || {},
      aisle_categories: shopMap.value.aisleCategories || {},
      shelf_access_points: allAccessPoints
    });
    console.log('Manual access point saved to database:', response.data);
  } catch (error) {
    console.error('Error saving manual access point:', error);
  }
}

async function handleAisleRenamed({ id, name, allNames }) {
  if (!shopInfo.value) return;
  
  // Update local map data
  if (!shopMap.value.aisleNames) {
    shopMap.value.aisleNames = {};
  }
  shopMap.value.aisleNames = { ...allNames };
  
  // Save to database
  try {
    const response = await axios.put(`/api/shops/${shopInfo.value.id}`, {
      name: shopInfo.value.name,
      description: shopInfo.value.description,
      address: shopInfo.value.address,
      map_data: shopMap.value,
      aisle_names: allNames,
      aisle_categories: shopMap.value.aisleCategories || {}
    });
    console.log('Aisle names updated:', response.data);
  } catch (error) {
    console.error('Error updating aisle names:', error);
  }
}

async function handleAisleCategoriesUpdated({ id, categories, allCategories }) {
  if (!shopInfo.value) return;
  
  // Update local map data
  if (!shopMap.value.aisleCategories) {
    shopMap.value.aisleCategories = {};
  }
  shopMap.value.aisleCategories = { ...allCategories };
  
  // Save to database
  try {
    const response = await axios.put(`/api/shops/${shopInfo.value.id}`, {
      name: shopInfo.value.name,
      description: shopInfo.value.description,
      address: shopInfo.value.address,
      map_data: shopMap.value,
      aisle_names: shopMap.value.aisleNames || {},
      aisle_categories: allCategories
    });
    console.log('Aisle categories updated:', response.data);
  } catch (error) {
    console.error('Error updating aisle categories:', error);
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
      <MapViewer 
        :shop-map="shopMap"
        :shop-name="shopInfo?.name"
        @aisle-renamed="handleAisleRenamed"
        @aisle-categories-updated="handleAisleCategoriesUpdated"
        @access-points-calculated="handleAccessPointsCalculated"
        @access-point-updated="handleAccessPointUpdated"
      />
    </div>

    <p v-else class="text-lg theme-text opacity-60 p-4">
      Upload a DXF file to visualize your shop floor plan
    </p>
  </div>
</template>