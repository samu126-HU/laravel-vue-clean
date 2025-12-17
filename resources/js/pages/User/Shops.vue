<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import PageHead from '../../components/PageHead.vue';
import ShopViewModal from '../../components/ShopViewModal.vue';

const shops = ref([]);
const loading = ref(true);
const selectedShop = ref(null);
const showModal = ref(false);

const fetchShops = async () => {
  loading.value = true;
  try {
    const response = await axios.get('/api/shops');
    shops.value = response.data;
  } catch (error) {
    console.error('Failed to fetch shops:', error);
  } finally {
    loading.value = false;
  }
};

const openShopModal = async (shop) => {
  try {
    // Fetch full shop details including map_data
    const response = await axios.get(`/api/shops/${shop.id}`);
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
});
</script>

<template>
    <PageHead title="Shops" />

    <div class="p-4">
        <div v-if="loading" class="text-center py-8 theme-text">
            Töltés...
        </div>

        <div v-else-if="shops.length === 0" class="text-center py-8 theme-text opacity-60">
            Nincsenek még üzletek az adatbázisban.
        </div>

        <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            <div v-for="shop in shops" :key="shop.id" class="theme-background rounded-lg shadow p-4 flex flex-col">
                <div class="h-32 theme-surface rounded mb-4 flex items-center justify-center theme-text">
                    {{ shop.name.charAt(0) }}
                </div>

                <h3 class="text-lg font-semibold mb-2">{{ shop.name }}</h3>
                <p class="text-sm mb-4 flex-1">{{ shop.description || 'Nincs leírás' }}</p>

                <div class="mt-auto flex items-center justify-end">
                    <button 
                        @click="openShopModal(shop)"
                        class="text-sm theme-text theme-btn-primary px-3 py-1 rounded hover:opacity-80 transition-opacity"
                    >
                        View
                    </button>
                </div>
            </div>
        </div>
    </div>

    <!-- Shop View Modal -->
    <ShopViewModal
        v-if="selectedShop"
        :visible="showModal"
        :shop="selectedShop"
        @close="closeModal"
    />
</template>