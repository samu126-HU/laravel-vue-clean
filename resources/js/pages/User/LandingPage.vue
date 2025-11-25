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
  <div class="p-4">
    <PageHead title="Welcome" />
    
    <h1 class="text-4xl font-bold theme-text mb-4">
      Welcome to FindMyAisle
    </h1>
    
    <DxfUploader @map-loaded="handleMapLoaded" />

    <MapViewer v-if="shopMap" :shop-map="shopMap" />

    <p v-else class="text-lg theme-text opacity-60">
      Upload a DXF file to visualize your shop floor plan
    </p>
  </div>
</template>