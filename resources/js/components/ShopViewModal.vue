<template>
    <teleport to="body">
        <div v-if="visible" class="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
            @click.self="closeModal">
            <div class="rounded-lg w-full h-full max-w-7xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">

                <!-- Content -->
                <div class="flex-1 overflow-hidden">
                    <!-- Info View -->
                    <div v-if="currentView === 'info'" class="p-4 md:p-6 overflow-y-auto h-full">
                        <div class="max-w-3xl mx-auto space-y-4">
                            <!-- Shop Information Card -->
                            <div class="theme-surface rounded-lg p-6 shadow-lg border border-gray-700">
                                <div class="flex items-center justify-between mb-4">
                                    <h3 class="text-lg md:text-xl font-semibold theme-text flex items-center gap-2">
                                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        Shop Information
                                    </h3>
                                    <button @click="closeModal"
                                        class="w-10 h-10 rounded-full hover:bg-gray-700 flex items-center justify-center theme-text transition-colors">
                                        ✕
                                    </button>
                                </div>
                                <div class="space-y-3">
                                    <div>
                                        <span class="theme-text opacity-60 text-sm font-medium">Name</span>
                                        <p class="theme-text text-lg">{{ shop.name }}</p>
                                    </div>
                                    <div v-if="shop.address">
                                        <span class="theme-text opacity-60 text-sm font-medium">Address</span>
                                        <p class="theme-text">{{ shop.address }}</p>
                                    </div>
                                    <div v-if="shop.description">
                                        <span class="theme-text opacity-60 text-sm font-medium">Description</span>
                                        <p class="theme-text">{{ shop.description }}</p>
                                    </div>
                                </div>
                            </div>

                            <!-- Floor Plan Card -->
                            <div v-if="hasMap" class="theme-surface rounded-lg p-6 shadow-lg border border-gray-700">
                                <h3 class="text-lg md:text-xl font-semibold theme-text mb-4 flex items-center gap-2">
                                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                                    </svg>
                                    Interactive Floor Plan
                                </h3>
                                <p class="theme-text opacity-70 text-sm md:text-base mb-6">
                                    View the interactive floor plan and navigate through the shop to find products
                                    easily
                                </p>
                                <button @click="currentView = 'map'"
                                    class="theme-btn-primary px-6 py-3 rounded-lg w-full font-medium text-base md:text-lg shadow-lg hover:shadow-xl transition-all">
                                    Open Floor Plan
                                </button>
                            </div>

                            <!-- No Floor Plan Card -->
                            <div v-else
                                class="theme-surface rounded-lg p-8 text-center shadow-lg border border-gray-700">
                                <svg class="w-16 h-16 mx-auto mb-4 opacity-40 theme-text" fill="none"
                                    stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                                </svg>
                                <p class="theme-text opacity-60 text-lg mb-2">Floor plan not available</p>
                                <p class="theme-text opacity-50 text-sm">This shop hasn't uploaded a floor plan yet</p>
                            </div>
                        </div>
                    </div>

                    <!-- Map View -->
                    <div v-else-if="currentView === 'map'" class="h-full relative flex">
                        <!-- Sidebar -->
                        <div class="w-80 theme-background border-r border-gray-700 flex flex-col z-20 overflow-hidden">
                            <!-- Shop Info Section -->
                            <div class="p-4 border-b border-gray-700">
                                <button @click="currentView = 'info'"
                                    class="mb-3 theme-surface px-4 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all flex items-center gap-2 theme-text font-medium border border-gray-700 w-full">
                                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                    </svg>
                                    <span>Back to Info</span>
                                </button>
                                
                                <h2 class="text-xl font-bold theme-text mb-2 flex items-center gap-2">
                                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                        </svg>
                                    {{ shop.name }}
                                </h2>
                                <p v-if="shop.address" class="text-sm theme-text opacity-70">{{ shop.address }}</p>
                            </div>

                            <!-- Shopping List Section -->
                            <div class="flex-1 p-4 overflow-y-auto">
                                <h3 class="font-semibold theme-text mb-3 text-lg flex items-center gap-2">
                                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                                    </svg>
                                    Shopping List
                                </h3>
                                <p class="text-sm theme-text opacity-70 mb-3">Select a shopping list to highlight aisles</p>

                                <select v-model="selectedShoppingListId"
                                    class="w-full theme-surface theme-text px-3 py-2 rounded-lg border border-gray-700 mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500">
                                    <option value="">Select a shopping list...</option>
                                    <option v-for="list in shoppingLists" :key="list.id" :value="list.id">
                                        {{ list.name }} ({{ list.items.length }} items)
                                    </option>
                                </select>

                                <button @click="handleAutoSelect" :disabled="!selectedShoppingListId || loading"
                                    class="theme-btn-primary w-full py-2.5 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                                    {{ loading ? 'Loading...' : 'Highlight Aisles' }}
                                </button>

                                <!-- Selected List Info -->
                                <div v-if="selectedList" class="mt-4 theme-surface rounded-lg p-3 border border-gray-700">
                                    <h4 class="font-semibold theme-text text-sm mb-2">{{ selectedList.name }}</h4>
                                    <p class="text-xs theme-text opacity-60 mb-2">{{ selectedList.items.length }} items</p>
                                    <div class="max-h-40 overflow-y-auto space-y-1">
                                        <div v-for="item in selectedList.items" :key="item.id"
                                            class="text-xs theme-text opacity-80 flex items-start gap-1">
                                            <span class="opacity-50">•</span>
                                            <span>{{ item.name }}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Map Container -->
                        <div class="flex-1 relative">
                            <MapViewer v-if="shopMap" :shop-map="shopMap" :shop-name="shop.name" :admin-mode="false" ref="mapViewerRef" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </teleport>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { usePage } from '@inertiajs/vue3';
import MapViewer from './MapViewer.vue';
import axios from 'axios';

const props = defineProps({
    visible: {
        type: Boolean,
        required: true
    },
    shop: {
        type: Object,
        required: true
    }
});

const emit = defineEmits(['close']);

const page = usePage();
const user = computed(() => page.props.auth?.user);

const currentView = ref('info');
const shoppingLists = ref([]);
const selectedShoppingListId = ref('');
const loading = ref(false);
const mapViewerRef = ref(null);

const selectedList = computed(() => {
    if (!selectedShoppingListId.value) return null;
    return shoppingLists.value.find(list => list.id === selectedShoppingListId.value);
});

const hasMap = computed(() => {
    return props.shop?.map_data && Object.keys(props.shop.map_data).length > 0;
});

const shopMap = computed(() => {
    if (!props.shop?.map_data) return null;

    return {
        ...props.shop.map_data,
        aisleNames: props.shop.aisle_names || {},
        aisleCategories: props.shop.aisle_categories || {},
        shelfAccessPoints: props.shop.shelf_access_points || {}
    };
});

const closeModal = () => {
    currentView.value = 'info';
    selectedShoppingListId.value = '';
    emit('close');
};

const fetchShoppingLists = async () => {
    if (!user.value) return;
    
    loading.value = true;
    try {
        const response = await axios.get('/api/shopping-lists');
        shoppingLists.value = response.data;
    } catch (error) {
        console.error('Failed to fetch shopping lists:', error);
    } finally {
        loading.value = false;
    }
};

const handleAutoSelect = () => {
    if (!selectedList.value || !mapViewerRef.value) return;
    
    // Extract unique category IDs from shopping list items
    const categoryIds = new Set();
    selectedList.value.items.forEach(item => {
        if (item.product?.category_id) {
            categoryIds.add(item.product.category_id);
        }
    });
    
    if (categoryIds.size === 0) {
        alert('No products with categories found in this shopping list');
        return;
    }
    
    // Enable path mode if not already enabled
    if (!mapViewerRef.value.pathMode) {
        mapViewerRef.value.togglePathMode();
    }
    
    // Select aisles for each category
    categoryIds.forEach(categoryId => {
        mapViewerRef.value.selectAislesByCategory(categoryId);
    });
};

// Fetch shopping lists when modal opens in map view
watch(() => currentView.value, (newView) => {
    if (newView === 'map' && user.value) {
        fetchShoppingLists();
    }
});

onMounted(() => {
    if (user.value) {
        fetchShoppingLists();
    }
});
</script>
