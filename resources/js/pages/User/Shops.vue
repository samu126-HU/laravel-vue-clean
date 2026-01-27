<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { usePage } from '@inertiajs/vue3';
import axios from 'axios';
import { trans } from 'laravel-vue-i18n';
import PageHead from '../../components/PageHead.vue';
import ShopViewModal from '../../components/ShopViewModal.vue';

const page = usePage();
const user = computed(() => page.props.auth?.user);

const shops = ref([]);
const loading = ref(true);
const selectedShop = ref(null);
const showModal = ref(false);
const searchQuery = ref('');
const favoriteShops = ref([]);
const togglingFavorite = ref(null);
const showOnlyFavorites = ref(false);

const filteredShops = computed(() => {
    let result = shops.value;

    // Apply search filter
    if (searchQuery.value.trim()) {
        const query = searchQuery.value.toLowerCase();
        result = result.filter(shop =>
            shop.name.toLowerCase().includes(query) ||
            (shop.description && shop.description.toLowerCase().includes(query))
        );
    }

    // Apply favorites filter
    if (showOnlyFavorites.value && user.value) {
        result = result.filter(shop => isFavorite(shop.id));
    }

    // Sort: favorites first, then others
    if (!showOnlyFavorites.value && user.value && favoriteShops.value.length > 0) {
        result = [...result].sort((a, b) => {
            const aIsFav = isFavorite(a.id);
            const bIsFav = isFavorite(b.id);
            if (aIsFav && !bIsFav) return -1;
            if (!aIsFav && bIsFav) return 1;
            return 0;
        });
    }

    return result;
});

const gridClasses = computed(() => {
    const count = filteredShops.value.length;
    if (count === 1) {
        return 'grid grid-cols-1 max-w-2xl';
    } else if (count === 2) {
        return 'grid grid-cols-1 md:grid-cols-2 gap-6';
    } else if (count === 3) {
        return 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6';
    } else {
        return 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6';
    }
});

const fetchShops = async () => {
    loading.value = true;
    try {
        const response = await axios.get('/api/v1/shops');
        shops.value = response.data;
    } catch (error) {
        console.error('Failed to fetch shops:', error);
    } finally {
        loading.value = false;
    }
};

// Initialize favorites from user data
const initializeFavorites = () => {
    if (user.value?.favorite_shops) {
        favoriteShops.value = Array.isArray(user.value.favorite_shops)
            ? user.value.favorite_shops
            : [];
    } else {
        favoriteShops.value = [];
    }
};

// Watch for user changes
watch(user, () => {
    initializeFavorites();
}, { immediate: true });

const isFavorite = (shopId) => {
    return favoriteShops.value.includes(shopId);
};

const toggleFavorite = async (event, shop) => {
    event.stopPropagation();

    if (!user.value) {
        alert(trans('Please log in to save favorite shops!'));
        return;
    }

    togglingFavorite.value = shop.id;

    try {
        const response = await axios.post(`/api/v1/shops/${shop.id}/favorite`);
        favoriteShops.value = response.data.favorite_shops;
    } catch (error) {
        console.error('Failed to toggle favorite:', error);
        alert(trans('An error occurred while updating favorites.'));
    } finally {
        togglingFavorite.value = null;
    }
};

const openShopModal = async (shop) => {
    try {
        // Fetch full shop details including map_data
        const response = await axios.get(`/api/v1/shops/${shop.id}`);
        selectedShop.value = response.data;
        showModal.value = true;
    } catch (error) {
        console.error('Failed to fetch shop details:', error);
        // Fallback to basic shop data
        selectedShop.value = shop;
        showModal.value = true;
    }
};

const closeModal = () => {
    showModal.value = false;
    selectedShop.value = null;
};

onMounted(() => {
    fetchShops();
    
    // Check for fav parameter in URL
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('fav') === '1') {
        showOnlyFavorites.value = true;
    }
});
</script>

<template>
    <PageHead title="Shops" />

    <div class="min-h-screen theme-background theme-text">
        <div class="max-w-[85vw] mx-auto px-4 py-12">
            <div class="flex flex-col md:flex-row md:justify-between md:items-center my-6 md:mb-12 gap-4">
                <div class="mb-12">
                    <h1
                        class="text-4xl md:text-5xl font-bold mb-4 bg-linear-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">
                        {{ $t('Shops') }}
                    </h1>
                    <p class="text-lg opacity-80">
                        {{ $t('Explore nearby shops and find the perfect one for you!') }}
                    </p>
                </div>
            </div>

            <!-- Search Bar and Favorites Filter -->
            <div class="mb-8">
                <div class="flex flex-col md:flex-row gap-3">
                    <!-- Search Bar -->
                    <div class="w-full md:w-2/5 relative">
                        <input v-model="searchQuery" type="text"
                            :placeholder="$t('Search shops by name or description...')"
                            class="w-full px-4 py-3 pl-12 theme-surface border border-current border-opacity-20 rounded-lg theme-text focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
                        <svg class="w-5 h-5 absolute left-4 top-1/2 transform -translate-y-1/2 opacity-50"
                            fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <button v-if="searchQuery" @click="searchQuery = ''"
                            class="absolute right-3 top-1/2 transform -translate-y-1/2 opacity-50 hover:opacity-100 transition-opacity">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <!-- Favorites Toggle Button - Desktop -->
                    <button v-if="user && favoriteShops.length > 0"
                        @click="showOnlyFavorites = !showOnlyFavorites" :class="[
                            'hidden md:flex w-auto px-6 py-3 rounded-lg font-medium transition-all items-center gap-2 whitespace-nowrap ml-auto',
                            showOnlyFavorites
                                ? 'bg-red-500 text-white hover:bg-red-600'
                                : 'theme-surface border border-current border-opacity-20 theme-text hover:bg-opacity-80'
                        ]">
                        <svg class="w-5 h-5" :fill="showOnlyFavorites ? 'currentColor' : 'none'"
                            stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                        <span>{{ showOnlyFavorites ? $t('All') : $t('Favorites') }}</span>
                        <span v-if="!showOnlyFavorites"
                            class="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                            {{ favoriteShops.length }}
                        </span>
                    </button>
                </div>

                <!-- Favorites Toggle - Mobile (Minimalistic) -->
                <button v-if="user && favoriteShops.length > 0"
                    @click="showOnlyFavorites = !showOnlyFavorites" :class="[
                        'md:hidden w-full mt-3 px-4 py-2.5 rounded-lg font-medium transition-all flex items-center justify-center gap-2 text-sm',
                        showOnlyFavorites
                            ? 'bg-red-500 text-white'
                            : 'theme-surface border border-current border-opacity-20 theme-text'
                    ]">
                    <svg class="w-4 h-4" :fill="showOnlyFavorites ? 'currentColor' : 'none'"
                        stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    <span>{{ showOnlyFavorites ? $t('Show all shops') : $t('Only Favorites') }}</span>
                    <span v-if="!showOnlyFavorites"
                        class="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                        {{ favoriteShops.length }}
                    </span>
                </button>
            </div>

            <div v-if="loading" class="text-center py-8 theme-text">
                <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-current"></div>
            </div>

            <div v-else-if="shops.length === 0" class="text-center py-16">
                <div class="max-w-md mx-auto theme-surface rounded-xl p-8 shadow-lg">
                    <svg class="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor"
                        viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    <p class="text-lg opacity-60">{{ $t('There are no shops in the database yet.') }}</p>
                </div>
            </div>

            <div v-else-if="filteredShops.length === 0" class="text-center py-16">
                <div class="max-w-md mx-auto theme-surface rounded-xl p-8 shadow-lg">
                    <svg class="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor"
                        viewBox="0 0 24 24">
                        <path v-if="showOnlyFavorites" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <p class="text-lg opacity-60">
                        {{ showOnlyFavorites ? $t('No favorite shops.') : $t('No results found for your search.') }}
                    </p>
                    <button v-if="!showOnlyFavorites" @click="searchQuery = ''"
                        class="mt-4 theme-btn-primary px-4 py-2 rounded-lg text-sm">
                        {{ $t('Clear search') }}
                    </button>
                    <button v-else @click="showOnlyFavorites = false"
                        class="mt-4 theme-btn-primary px-4 py-2 rounded-lg text-sm">
                        {{ $t('Show All Shops') }}
                    </button>
                </div>
            </div>

            <div v-else :class="gridClasses">
                <div v-for="(shop, index) in filteredShops" :key="shop.id"
                    class="theme-surface rounded-xl shadow-lg p-6 flex flex-col hover:scale-105 active:scale-95 transition-transform cursor-pointer active:shadow-xl"
                    @click="openShopModal(shop)">
                    <div class="relative">
                        <div :class="[
                            'h-32 rounded-lg mb-4 flex items-center justify-center text-4xl font-bold',
                            index % 4 === 0 ? 'bg-blue-500 bg-opacity-20 text-blue-500' : '',
                            index % 4 === 1 ? 'bg-green-500 bg-opacity-20 text-green-500' : '',
                            index % 4 === 2 ? 'bg-purple-500 bg-opacity-20 text-purple-500' : '',
                            index % 4 === 3 ? 'bg-orange-500 bg-opacity-20 text-orange-500' : ''
                        ]">
                            {{ shop.name.charAt(0).toUpperCase() }}
                        </div>
                        <!-- Favorite Button -->
                        <button v-if="user" @click="toggleFavorite($event, shop)"
                            :disabled="togglingFavorite === shop.id"
                            class="absolute top-2 right-2 w-10 h-10 flex items-center justify-center rounded-lg transition-all"
                            :class="[
                                isFavorite(shop.id)
                                    ? 'bg-red-500 text-white hover:bg-red-600'
                                    : 'bg-white bg-opacity-80 text-gray-600 hover:bg-opacity-100',
                                togglingFavorite === shop.id ? 'opacity-50 cursor-not-allowed' : 'active:scale-95'
                            ]">
                            <svg v-if="isFavorite(shop.id)" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd"
                                    d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                                    clip-rule="evenodd" />
                            </svg>
                            <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                        </button>
                    </div>

                    <h3 class="text-xl font-bold mb-2 theme-text">{{ shop.name }}</h3>
                    <p class="text-sm opacity-75 mb-4 flex-1">{{ shop.description || $t('No description') }}</p>

                    <div class="mt-auto flex items-center justify-between">
                        <div class="flex items-center text-sm opacity-60">
                            <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                            </svg>
                            {{ $t('Map') }}
                        </div>
                        <button
                            class="theme-btn-primary px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 active:opacity-80 active:scale-95 transform transition-all flex items-center gap-2">
                            <span>{{ $t('Open') }}</span>
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Shop View Modal -->
    <ShopViewModal v-if="selectedShop" :visible="showModal" :shop="selectedShop" @close="closeModal" />
</template>