<template>
  <AdminLayout>
    <div class="h-[calc(100vh-4rem)]">
      <div class="flex items-center justify-between mb-4">
        <div>
          <Link href="/admin/shops" class="text-blue-400 hover:underline mb-2 inline-block">← Back to Shops</Link>
          <h1 class="text-3xl font-bold theme-text">Edit Layout: {{ shop?.name }}</h1>
        </div>
        <div class="flex gap-2">
          <button
            @click="showUploadModal = true"
            class="theme-btn-primary px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            Upload DXF
          </button>
          <button
            v-if="hasUnsavedChanges"
            @click="saveChanges"
            class="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg"
          >
            Save Changes
          </button>
        </div>
      </div>

      <!-- Map Viewer with Sidebar -->
      <div v-if="shop && shopMap" class="h-[calc(100%-5rem)] border border-gray-700 rounded-lg overflow-hidden flex">
        <!-- Sidebar -->
        <div class="w-80 theme-background border-r border-gray-700 flex flex-col z-20 overflow-hidden">
          <!-- Shop Info Section -->
          <div class="p-4 border-b border-gray-700">
            <h2 class="text-xl font-bold theme-text mb-2 flex items-center gap-2">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              {{ shop.name }}
            </h2>
            <p v-if="shop.address" class="text-sm theme-text opacity-70">{{ shop.address }}</p>
          </div>

          <!-- Tools Section -->
          <div class="flex-1 p-4 overflow-y-auto">
            <!-- Navigation Section -->
            <div class="mb-4">
              <h3 class="font-semibold theme-text mb-3 text-lg flex items-center gap-2">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
                Navigation
              </h3>
              
              <button
                @click="togglePathMode"
                :class="['w-full theme-btn-primary py-2.5 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all mb-3',
                  pathMode ? 'ring-2 ring-blue-500' : '']"
              >
                <span class="text-base mr-2">{{ pathMode ? '🧭' : '🗺️' }}</span>
                {{ pathMode ? 'Exit Navigation' : 'Start Navigation' }}
              </button>

              <!-- Category Selection (when in path mode) -->
              <div v-if="pathMode" class="theme-surface rounded-lg p-3 border border-gray-700 mb-3">
                <label class="text-sm theme-text font-medium mb-2 block">Select by Category</label>
                <select
                  v-model="selectedCategoryId"
                  @change="handleSelectByCategory"
                  class="w-full theme-surface theme-text px-3 py-2 rounded-lg border border-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Choose a category...</option>
                  <option v-for="category in categories" :key="category.id" :value="category.id">
                    {{ category.icon }} {{ category.name }}
                  </option>
                </select>
              </div>

              <!-- Clear Path Button -->
              <button
                v-if="pathMode"
                @click="clearPath"
                class="w-full theme-btn-secondary py-2 rounded-lg font-medium text-sm mb-3 hover:bg-red-50 dark:hover:bg-red-900"
              >
                🗑️ Clear Path
              </button>
            </div>

            <div class="border-t border-gray-700 pt-4">
              <h3 class="font-semibold theme-text mb-3 text-lg flex items-center gap-2">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Layout Tools
              </h3>
              <p class="text-sm theme-text opacity-70 mb-4">Right-click on aisles to edit names and categories</p>
              
              <div class="space-y-3">
                <div class="theme-surface rounded-lg p-3 border border-gray-700">
                  <h4 class="font-semibold theme-text text-sm mb-2 flex items-center gap-2">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Quick Actions
                  </h4>
                  <ul class="text-xs theme-text opacity-70 space-y-1">
                    <li>• Right-click aisles to rename</li>
                    <li>• Assign categories to aisles</li>
                    <li>• Set shelf access points</li>
                  </ul>
                </div>

                <div v-if="hasUnsavedChanges" class="theme-surface rounded-lg p-3 border border-yellow-700 bg-yellow-900/10">
                  <p class="text-sm theme-text font-medium flex items-center gap-2">
                    <svg class="w-4 h-4 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    Unsaved Changes
                  </p>
                  <p class="text-xs theme-text opacity-60 mt-1">Don't forget to save your changes</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Map Container -->
        <div class="flex-1 relative">
          <MapViewer
            ref="mapViewerRef"
            :shop-map="completeShopMap"
            :shop-name="shop.name"
            :admin-mode="true"
            @aisle-renamed="handleAisleRenamed"
            @aisle-categories-updated="handleAisleCategoriesUpdated"
            @access-points-calculated="handleAccessPointsCalculated"
            @access-point-updated="handleAccessPointUpdated"
          />
        </div>
      </div>

      <!-- No Map State -->
      <div v-else-if="shop && !shopMap" class="h-[calc(100%-5rem)] border border-gray-700 rounded-lg flex items-center justify-center theme-surface">
        <div class="text-center theme-text-secondary">
          <svg class="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p class="text-lg mb-2">No layout uploaded yet</p>
          <p class="text-sm mb-4">Upload a DXF file to create the shop layout</p>
          <button
            @click="showUploadModal = true"
            class="theme-btn-primary px-4 py-2 rounded-lg"
          >
            Upload DXF File
          </button>
        </div>
      </div>

      <!-- Upload Modal -->
      <div
        v-if="showUploadModal"
        class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
        @click.self="showUploadModal = false"
      >
        <div class="theme-surface rounded-lg p-6 w-full max-w-md border border-gray-700">
          <h2 class="text-2xl font-bold theme-text mb-4">Upload DXF File</h2>
          
          <div class="mb-4">
            <label class="block theme-text-secondary text-sm mb-2">Select DXF File</label>
            <input
              ref="fileInput"
              type="file"
              accept=".dxf"
              @change="handleFileSelect"
              class="w-full theme-surface theme-text px-4 py-2 rounded-lg border border-gray-700"
            />
            <p class="text-xs theme-text-secondary mt-2">Only .dxf files are supported</p>
          </div>

          <div v-if="uploadProgress > 0 && uploadProgress < 100" class="mb-4">
            <div class="w-full bg-gray-700 rounded-full h-2">
              <div class="bg-blue-500 h-2 rounded-full transition-all" :style="{ width: uploadProgress + '%' }"></div>
            </div>
            <p class="text-xs theme-text-secondary mt-1">Uploading: {{ uploadProgress }}%</p>
          </div>

          <div class="flex gap-3">
            <button
              @click="uploadFile"
              :disabled="!selectedFile || uploading"
              class="flex-1 theme-btn-primary py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ uploading ? 'Uploading...' : 'Upload' }}
            </button>
            <button
              @click="showUploadModal = false"
              class="flex-1 theme-btn-secondary py-2 rounded-lg"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { Link, router } from '@inertiajs/vue3';
import AdminLayout from '@/layouts/AdminLayout.vue';
import MapViewer from '@/components/MapViewer.vue';
import { ShopMap } from '@/utils/dxfConverter.js';
import axios from 'axios';

const props = defineProps({
  shopId: {
    type: [String, Number],
    required: true
  }
});

const shop = ref(null);
const shopMap = ref(null);
const showUploadModal = ref(false);
const selectedFile = ref(null);
const fileInput = ref(null);
const uploading = ref(false);
const uploadProgress = ref(0);
const hasUnsavedChanges = ref(false);
const pendingChanges = ref({
  aisleNames: null,
  aisleCategories: null,
  shelfAccessPoints: null
});
const mapViewerRef = ref(null);
const pathMode = ref(false);
const categories = ref([]);
const selectedCategoryId = ref('');

const completeShopMap = computed(() => {
  if (!shopMap.value) return null;
  
  return {
    ...shopMap.value,
    aisleNames: shop.value?.aisle_names || {},
    aisleCategories: shop.value?.aisle_categories || {},
    shelfAccessPoints: shop.value?.shelf_access_points || {}
  };
});

onMounted(async () => {
  await loadShop();
  await loadCategories();
});

const loadCategories = async () => {
  try {
    const response = await axios.get('/api/categories');
    categories.value = response.data.categories;
  } catch (error) {
    console.error('Error loading categories:', error);
  }
};

const loadShop = async () => {
  try {
    const response = await axios.get(`/api/shops/${props.shopId}`);
    shop.value = response.data;
    
    console.log('Shop loaded:', response.data);
    
    // Load map data if exists
    if (response.data.map_data) {
      shopMap.value = response.data.map_data;
    }
  } catch (error) {
    console.error('Failed to load shop:', error);
    alert('Failed to load shop data');
  }
};

const handleFileSelect = (event) => {
  const file = event.target.files[0];
  if (file && file.name.endsWith('.dxf')) {
    selectedFile.value = file;
  } else {
    alert('Please select a valid DXF file');
    event.target.value = '';
  }
};

const uploadFile = async () => {
  if (!selectedFile.value) return;

  uploading.value = true;
  uploadProgress.value = 0;

  const reader = new FileReader();
  
  reader.onload = async (e) => {
    try {
      uploadProgress.value = 50; // Reading done
      
      // Parse DXF file on client side
      const mapData = ShopMap.fromDXFFile(e.target.result);
      
      if (!mapData) {
        throw new Error('Failed to parse DXF file');
      }
      
      uploadProgress.value = 75; // Parsing done
      
      // Save to database
      const response = await axios.put(`/api/admin/shops/${props.shopId}`, {
        map_data: mapData,
        aisle_names: shop.value?.aisle_names || {},
        aisle_categories: shop.value?.aisle_categories || {},
        shelf_access_points: shop.value?.shelf_access_points || {}
      });
      
      uploadProgress.value = 100;
      
      // Update local state
      shopMap.value = mapData;
      shop.value.map_data = mapData;
      
      // Wait a moment to show 100% progress
      await new Promise(resolve => setTimeout(resolve, 500));
      
      showUploadModal.value = false;
      selectedFile.value = null;
      uploadProgress.value = 0;
      
      alert('DXF file uploaded and processed successfully!');
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Failed to upload DXF file: ' + (error.message || 'Unknown error'));
      uploadProgress.value = 0;
    } finally {
      uploading.value = false;
    }
  };
  
  reader.onerror = () => {
    alert('Failed to read file');
    uploading.value = false;
    uploadProgress.value = 0;
  };
  
  reader.readAsText(selectedFile.value);
};

const handleAisleRenamed = (data) => {
  pendingChanges.value.aisleNames = data.allNames;
  hasUnsavedChanges.value = true;
};

const handleAisleCategoriesUpdated = (data) => {
  pendingChanges.value.aisleCategories = data.allCategories;
  hasUnsavedChanges.value = true;
};

const handleAccessPointsCalculated = (accessPoints) => {
  // Auto-save calculated access points
  pendingChanges.value.shelfAccessPoints = accessPoints;
  saveChanges(true);
};

const handleAccessPointUpdated = (data) => {
  pendingChanges.value.shelfAccessPoints = data.allAccessPoints;
  hasUnsavedChanges.value = true;
};

const saveChanges = async (silent = false) => {
  try {
    const updateData = {};
    
    if (pendingChanges.value.aisleNames) {
      updateData.aisle_names = pendingChanges.value.aisleNames;
    }
    
    if (pendingChanges.value.aisleCategories) {
      updateData.aisle_categories = pendingChanges.value.aisleCategories;
    }
    
    if (pendingChanges.value.shelfAccessPoints) {
      updateData.shelf_access_points = pendingChanges.value.shelfAccessPoints;
    }

    console.log('Saving shop data:', updateData);
    const response = await axios.put(`/api/admin/shops/${props.shopId}`, updateData);
    console.log('Save response:', response.data);
    
    // Update shop object with saved data
    if (shop.value) {
      if (updateData.aisle_names) shop.value.aisle_names = updateData.aisle_names;
      if (updateData.aisle_categories) shop.value.aisle_categories = updateData.aisle_categories;
      if (updateData.shelf_access_points) shop.value.shelf_access_points = updateData.shelf_access_points;
    }
    
    hasUnsavedChanges.value = false;
    pendingChanges.value = {
      aisleNames: null,
      aisleCategories: null,
      shelfAccessPoints: null
    };
    
    if (!silent) {
      alert('Changes saved successfully!');
    }
  } catch (error) {
    console.error('Failed to save changes:', error);
    console.error('Error details:', error.response?.data);
    alert('Failed to save changes: ' + (error.response?.data?.message || error.message));
  }
};

const togglePathMode = () => {
  if (mapViewerRef.value) {
    mapViewerRef.value.togglePathMode();
    pathMode.value = mapViewerRef.value.pathMode;
  }
};

const clearPath = () => {
  if (mapViewerRef.value) {
    mapViewerRef.value.clearPath();
  }
};

const handleSelectByCategory = () => {
  if (selectedCategoryId.value && mapViewerRef.value) {
    mapViewerRef.value.selectAislesByCategory(selectedCategoryId.value);
    selectedCategoryId.value = '';
  }
};
</script>
