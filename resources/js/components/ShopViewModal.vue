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
                                        {{ $t('Shop Information') }}
                                    </h3>
                                    <button @click="closeModal"
                                        class="w-10 h-10 rounded-full hover:bg-gray-700 flex items-center justify-center theme-text transition-colors">
                                        ✕
                                    </button>
                                </div>
                                <div class="space-y-3">
                                    <div>
                                        <span class="theme-text opacity-60 text-sm font-medium">{{ $t('Name') }}</span>
                                        <p class="theme-text text-lg">{{ shop.name }}</p>
                                    </div>
                                    <div v-if="shop.address">
                                        <span class="theme-text opacity-60 text-sm font-medium">{{ $t('Address') }}</span>
                                        <p class="theme-text">{{ shop.address }}</p>
                                    </div>
                                    <div v-if="shop.description">
                                        <span class="theme-text opacity-60 text-sm font-medium">{{ $t('Description') }}</span>
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
                                    {{ $t('Interactive Floor Plan') }}
                                </h3>
                                <p class="theme-text opacity-70 text-sm md:text-base mb-6">
                                    {{ $t('View the interactive floor plan and navigate through the shop to find products easily') }}
                                </p>
                                <button @click="currentView = 'map'"
                                    class="theme-btn-primary px-6 py-3 rounded-lg w-full font-medium text-base md:text-lg shadow-lg hover:shadow-xl transition-all">
                                    {{ $t('Open Floor Plan') }}
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
                                <p class="theme-text opacity-60 text-lg mb-2">{{ $t('Floor plan not available') }}</p>
                                <p class="theme-text opacity-50 text-sm">{{ $t("This shop hasn't uploaded a floor plan yet") }}</p>
                            </div>
                        </div>
                    </div>

                    <!-- Map View -->
                    <div v-else-if="currentView === 'map'" class="h-full relative flex">
                        <!-- Sidebar (Desktop Only) -->
                        <div class="hidden lg:flex w-80 theme-background border-r border-gray-700 flex-col z-20 overflow-hidden">
                            <!-- Shop Info Section -->
                            <div class="p-4 border-b border-gray-700">
                                <button @click="currentView = 'info'"
                                    class="mb-3 theme-surface px-4 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all flex items-center gap-2 theme-text font-medium border border-gray-700 w-full">
                                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                    </svg>
                                    <span>{{ $t('Back to Info') }}</span>
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

                            <!-- Navigation Section (Active) -->
                            <div v-if="navigationState.active" class="flex-1 p-4 overflow-y-auto">
                                <div class="flex items-center justify-between mb-4">
                                    <h3 class="font-semibold theme-text text-lg flex items-center gap-2">
                                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                                        </svg>
                                        {{ $t('Navigation') }}
                                    </h3>
                                    <button @click="handleStopNavigation"
                                        class="p-2 rounded-lg hover:bg-gray-700 transition-colors"
                                        :title="$t('Exit navigation')">
                                        <svg class="w-5 h-5 theme-text" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>

                                <!-- Progress -->
                                <div class="mb-4 theme-surface rounded-lg p-3 border border-gray-700">
                                    <div class="text-sm theme-text opacity-70 mb-1">
                                        {{ $t('Step') }} {{ navigationState.currentStep + 1 }} {{ $t('of') }} {{ navigationState.totalSteps }}
                                    </div>
                                    <div class="h-2 bg-gray-700 rounded-full overflow-hidden mb-2">
                                        <div class="h-full bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-300"
                                            :style="{ width: `${((navigationState.currentStep + 1) / navigationState.totalSteps) * 100}%` }">
                                        </div>
                                    </div>
                                </div>

                                <!-- Current Step Info -->
                                <div v-if="currentNavStep" class="mb-4">
                                    <div class="text-lg font-bold theme-text mb-2">
                                        {{ currentNavStep.name || $t('Current Location') }}
                                    </div>
                                    
                                    <!-- Items at Current Step -->
                                    <div v-if="currentNavStep.items && currentNavStep.items.length > 0" class="mb-3">
                                        <div class="text-sm font-semibold theme-text mb-2 flex items-center gap-2">
                                            <span>📋</span>
                                            <span>{{ $t('Items to collect:') }}</span>
                                        </div>
                                        <div class="space-y-2 max-h-48 overflow-y-auto">
                                            <div v-for="item in currentNavStep.items" :key="item.id"
                                                class="text-sm theme-text bg-blue-900/30 rounded-lg px-3 py-2 flex items-center gap-2">
                                                <span class="text-blue-400">✓</span>
                                                <span class="flex-1">{{ item.name }}</span>
                                                <span v-if="item.quantity > 1" class="text-gray-400 text-xs">× {{ item.quantity }}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <!-- Next Step Preview -->
                                    <div v-if="nextNavStep" class="theme-surface rounded-lg p-3 border border-gray-700">
                                        <div class="text-sm theme-text opacity-70 mb-1">{{ $t('Next:') }}</div>
                                        <div class="font-semibold theme-text">{{ nextNavStep.name }}</div>
                                        <div v-if="nextNavStep.items && nextNavStep.items.length > 0" class="text-xs theme-text opacity-60 mt-1">
                                            {{ nextNavStep.items.length }} {{ nextNavStep.items.length !== 1 ? $t('items') : $t('item') }} {{ $t('to collect') }}
                                        </div>
                                    </div>
                                </div>

                                <!-- Navigation Buttons -->
                                <div class="space-y-2">
                                    <button @click="handlePreviousStep" :disabled="isFirstNavStep"
                                        class="w-full px-4 py-3 rounded-lg font-medium transition-all disabled:opacity-30 disabled:cursor-not-allowed bg-gray-700 hover:bg-gray-600 theme-text">
                                        {{ $t('← Previous') }}
                                    </button>
                                    <button @click="handleNextStep"
                                        class="w-full px-4 py-3 rounded-lg font-medium transition-all theme-text"
                                        :class="isLastNavStep ? 'bg-green-500 hover:bg-green-600' : 'bg-blue-500 hover:bg-blue-600'">
                                        {{ isLastNavStep ? $t('Complete ✓') : $t('Next →') }}
                                    </button>
                                </div>
                            </div>

                            <!-- Shopping List Section -->
                            <div v-else class="flex-1 p-4 overflow-y-auto">
                                <h3 class="font-semibold theme-text mb-3 text-lg flex items-center gap-2">
                                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                                    </svg>
                                    {{ $t('Shopping List') }}
                                </h3>
                                <p class="text-sm theme-text opacity-70 mb-3">{{ $t('Select a shopping list to highlight aisles') }}</p>

                                <select v-model="selectedShoppingListId"
                                    class="w-full theme-surface theme-text px-3 py-2 rounded-lg border border-gray-700 mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500">
                                    <option value="">{{ $t('Select a shopping list...') }}</option>
                                    <option v-for="list in shoppingLists" :key="list.id" :value="list.id">
                                        {{ list.name }} ({{ list.items.length }} {{ $t('items') }})
                                    </option>
                                </select>

                                <button @click="handleAutoSelect" :disabled="!selectedShoppingListId || loading"
                                    class="theme-btn-primary w-full py-2.5 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed mb-2">
                                    {{ loading ? $t('Loading...') : $t('Highlight Aisles') }}
                                </button>

                                <button @click="handleStartNavigation" :disabled="!selectedShoppingListId || loading"
                                    class="bg-green-500 hover:bg-green-600 text-white w-full py-2.5 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                                    {{ $t('Start Navigation') }}
                                </button>

                                <!-- Selected List Info -->
                                <div v-if="selectedList" class="mt-4 theme-surface rounded-lg p-3 border border-gray-700">
                                    <h4 class="font-semibold theme-text text-sm mb-2">{{ selectedList.name }}</h4>
                                    <p class="text-xs theme-text opacity-60 mb-2">{{ selectedList.items.length }} {{ $t('items') }}</p>
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
                            <MapViewer 
                                v-if="shopMap" 
                                :shop-map="shopMap" 
                                :shop-name="shop.name" 
                                :admin-mode="false" 
                                :shopping-lists="shoppingLists"
                                :selected-shopping-list-id="selectedShoppingListId"
                                :loading-shopping-lists="loading"
                                @update:selectedShoppingListId="selectedShoppingListId = $event"
                                @highlight-aisles="handleAutoSelect"
                                @stepper-state-changed="handleStepperStateChange"
                                @items-completed="handleItemsCompleted"
                                ref="mapViewerRef" 
                            />
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
import { trans } from 'laravel-vue-i18n';
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

const navigationState = ref({
    active: false,
    currentStep: 0,
    totalSteps: 0,
    steps: []
});

const currentNavStep = computed(() => {
    if (!navigationState.value.active || navigationState.value.steps.length === 0) return null;
    return navigationState.value.steps[navigationState.value.currentStep];
});

const nextNavStep = computed(() => {
    if (!navigationState.value.active || navigationState.value.steps.length === 0) return null;
    const nextIndex = navigationState.value.currentStep + 1;
    return nextIndex < navigationState.value.steps.length ? navigationState.value.steps[nextIndex] : null;
});

const isFirstNavStep = computed(() => navigationState.value.currentStep === 0);
const isLastNavStep = computed(() => navigationState.value.currentStep === navigationState.value.totalSteps - 1);

const selectedList = computed(() => {
    if (!selectedShoppingListId.value) return null;
    return shoppingLists.value.find(list => list.id == selectedShoppingListId.value);
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
        const response = await axios.get('/api/v1/shopping-lists');
        shoppingLists.value = response.data;
    } catch (error) {
        console.error('Failed to fetch shopping lists:', error);
    } finally {
        loading.value = false;
    }
};

const handleAutoSelect = () => {
    if (!selectedList.value) {
        alert(trans('Please select a shopping list first'));
        return;
    }
    
    if (!mapViewerRef.value) {
        alert(trans('Map viewer is not ready. Please try again.'));
        return;
    }
    
    // Extract unique category IDs from shopping list items
    const categoryIds = new Set();
    selectedList.value.items.forEach(item => {
        if (item.product?.category_id) {
            categoryIds.add(item.product.category_id);
        }
    });
    
    if (categoryIds.size === 0) {
        alert(trans('No products with categories found in this shopping list'));
        return;
    }
    
    // Enable path mode if not already enabled
    if (!mapViewerRef.value.pathMode.value) {
        mapViewerRef.value.togglePathMode();
    }
    
    // Select aisles for each category
    categoryIds.forEach(categoryId => {
        mapViewerRef.value.selectAislesByCategory(categoryId);
    });
};

const handleStartNavigation = () => {
    if (!selectedList.value) {
        alert(trans('Please select a shopping list first'));
        return;
    }
    
    if (!mapViewerRef.value) {
        alert(trans('Map viewer is not ready. Please try again.'));
        return;
    }
    
    // Call the MapViewer's startNavigation through the exposed method
    // The MapViewer will handle creating the route from the selected list
    const routeSteps = mapViewerRef.value.createRouteFromList?.(selectedList.value);
    
    if (routeSteps && routeSteps.length > 0) {
        mapViewerRef.value.startStepper(routeSteps);
    }
};

const handleStepperStateChange = (state) => {
    navigationState.value = state;
};

const handleNextStep = () => {
    if (mapViewerRef.value) {
        mapViewerRef.value.nextStepAction?.();
    }
};

const handlePreviousStep = () => {
    if (mapViewerRef.value) {
        mapViewerRef.value.previousStepAction?.();
    }
};

const handleStopNavigation = () => {
    if (mapViewerRef.value) {
        mapViewerRef.value.stopStepper?.();
    }
};

const handleItemsCompleted = async (data) => {
    console.log('Items completed:', data);
    
    try {
        // Mark items as completed via API
        await axios.post(`/api/v1/shopping-lists/${data.listId}/items/complete`, {
            item_ids: data.itemIds
        });
        
        console.log('Items marked as completed successfully');
        
        // Close modal and return to shopping lists page with success message
        setTimeout(() => {
            closeModal();
            window.location.href = `/shopping-lists?completed=${data.listId}&items=${data.itemIds.length}`;
        }, 500);
    } catch (error) {
        console.error('Failed to mark items as completed:', error);
        // Still close modal even if API fails
        setTimeout(() => {
            closeModal();
            window.location.href = '/shopping-lists';
        }, 500);
    }
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
