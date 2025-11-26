<script setup>
import { ref } from 'vue';
import PageHead from '../../components/PageHead.vue';
import MapViewer from '../../components/MapViewer.vue';
import DxfUploader from '../../components/DxfUploader.vue';

const shopMap = ref(null);

function handleMapLoaded(map) {
  shopMap.value = map;
}
</script>

<template>
  <PageHead title="Welcome" />

  <div class="h-full flex flex-col p-2">
    
    <DxfUploader @map-loaded="handleMapLoaded" />

    <div v-if="shopMap" class="flex-1 min-h-0">
      <MapViewer :shop-map="shopMap" />
    </div>

    <p v-else class="text-lg theme-text opacity-60 p-4">
      Upload a DXF file to visualize your shop floor plan
    </p>
  </div>
</template>