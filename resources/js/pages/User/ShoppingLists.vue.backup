<template>
  <div class="theme-surface">
    <div class="max-w-[95vw] md:max-w-[85vw] mx-auto m-3">
      <div class="flex justify-between items-center my-3">
        <h1 class="text-lg md:text-3xl font-bold theme-text">Bevásárlólistáim</h1>
        <button v-if="user" @click="showCreateModal = true"
          class="theme-btn-primary p-1 px-2 rounded-lg flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd"
              d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
              clip-rule="evenodd" />
          </svg>
          <span class="hidden md:inline">Új lista létrehozása</span>
          <span class="inline md:hidden">Hozzáadás</span>
        </button>
      </div>

      <!-- Authentication check -->
      <div v-if="!user" class="theme-background rounded-lg p-6 text-center shadow-lg">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto mb-4 theme-primary" fill="none"
          viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
        <h2 class="text-xl font-semibold mb-2 theme-text">Bejelentkezés szükséges</h2>
        <p class="theme-text opacity-70 mb-4">A bevásárlólisták használatához regisztrált felhasználónak kell lenned.
        </p>
        <div class="flex gap-4 justify-center">
          <Link href="/login" class="theme-btn-primary px-6 py-2 rounded-lg">
            Bejelentkezés
          </Link>
          <Link href="/register" class="theme-btn-primary px-6 py-2 rounded-lg">
            Regisztráció
          </Link>
        </div>
      </div>

      <!-- Shopping lists -->
      <div v-else>
        <div v-if="loading" class="text-center py-8">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
        </div>

        <div v-else-if="shoppingLists.length === 0" class="theme-background rounded-lg p-8 text-center shadow-lg">
          <p class="theme-text opacity-70">Még nincs bevásárlólistád. Hozd létre az első listádat!</p>
        </div>

        <div v-else class="grid grid-cols-1 gap-4">
          <div v-for="list in shoppingLists" :key="list.id"
            class="theme-background rounded-lg shadow-lg hover:shadow-xl transition">
            <div class="m-2 p-1 flex justify-between items-start ">
              <div>
                <h3 class="text-xl font-semibold theme-text">{{ list.name }}</h3>
                <p v-if="list.description" class="theme-text opacity-70 ">{{ list.description }}</p>
                <p class="text-sm theme-text opacity-60 ">
                  {{ list.items.length }} termék
                  <span v-if="checkedItemsCount(list) > 0">
                    ({{ checkedItemsCount(list) }} kipipálva)
                  </span>
                </p>
              </div>
              <div class="flex gap-2">
                <button @click="editList(list)" class="theme-text opacity-70 hover:opacity-100 transition"
                  title="Szerkesztés">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                  </svg>
                </button>
                <button @click="openAddItemsModal(list)" class="theme-text opacity-70 hover:opacity-100 transition"
                  title="Termék hozzáadása">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
                  </svg>
                </button>
                <button @click="deleteList(list.id)" class="text-red-500 hover:text-red-700 transition" title="Törlés">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd"
                      d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                      clip-rule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>

            <!-- Items list -->
            <div class="border-t p-1 border-current border-opacity-20">
              <div v-if="list.items.length === 0" class="theme-text opacity-50 text-sm m-2">
                Nincs még termék a listán
              </div>
              <div v-else class="m-2 space-y-2">
                <div v-for="item in list.items" :key="item.id"
                  class="flex items-center gap-3 rounded theme-text hover:opacity-70 transition">
                  <label class="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" :checked="item.checked" @change="toggleItemChecked(list.id, item)"
                      class="sr-only peer" />
                    <div class="w-5 h-5 border-2 border-current border-opacity-30 rounded peer-checked:bg-blue-500 peer-checked:border-blue-500 transition-all duration-200 flex items-center justify-center">
                      <svg v-show="item.checked" xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 text-white" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                      </svg>
                    </div>
                  </label>
                  <span :class="{ 'line-through opacity-40': item.checked }" class="flex-1 theme-text">
                    {{ item.name }}
                    <span v-if="item.product" class="text-xs opacity-60">
                      ({{ item.product.category.name }})
                    </span>
                  </span>
                  <span class="theme-text opacity-70">{{ item.quantity }}x</span>
                  <button @click="removeItem(list.id, item.id)" class="text-red-500 hover:text-red-700 transition">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd"
                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                        clip-rule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Create/Edit Modal -->
  <div v-if="showCreateModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    @click.self="closeModal">
    <div class="theme-background rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
      <h2 class="text-2xl font-bold mb-4 theme-text">
        {{ editingList ? 'Lista szerkesztése' : 'Új lista létrehozása' }}
      </h2>
      <form @submit.prevent="saveList">
        <div class="mb-4">
          <label class="block theme-text font-medium mb-2">Név</label>
          <input v-model="listForm.name" type="text" required
            class="w-full px-3 py-2 border border-current border-opacity-20 rounded-lg theme-background theme-text focus:ring-2 focus:ring-blue-500 transition"
            placeholder="pl. Heti bevásárlás" />
        </div>
        <div class="mb-4">
          <label class="block theme-text font-medium mb-2">Leírás (opcionális)</label>
          <textarea v-model="listForm.description"
            class="w-full px-3 py-2 border border-current border-opacity-20 rounded-lg theme-background theme-text focus:ring-2 focus:ring-blue-500 transition"
            rows="3" placeholder="Megjegyzések..."></textarea>
        </div>
        <div class="flex gap-2 justify-end">
          <button type="button" @click="closeModal"
            class="px-4 py-2 border border-current border-opacity-20 rounded-lg theme-text hover:opacity-70 transition">
            Mégse
          </button>
          <button type="submit" class="theme-btn-primary px-4 py-2 rounded-lg">
            {{ editingList ? 'Mentés' : 'Létrehozás' }}
          </button>
        </div>
      </form>
    </div>
  </div>

  <!-- Add Items Modal -->
  <div v-if="showAddItemsModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    @click.self="closeAddItemsModal">
    <div class="theme-background rounded-lg p-6 max-w-2xl w-full mx-4 shadow-xl max-h-[80vh] flex flex-col">
      <h2 class="text-2xl font-bold mb-4 theme-text">
        Termékek hozzáadása: {{ selectedListForItems?.name }}
      </h2>
      
      <!-- Search Box -->
      <div class="mb-4">
        <input 
          v-model="productSearch" 
          @input="searchProducts"
          type="text" 
          placeholder="Keresés termékek között..."
          class="w-full px-3 py-2 border border-current border-opacity-20 rounded-lg theme-background theme-text focus:ring-2 focus:ring-blue-500 transition"
        />
      </div>

      <!-- Product Results -->
      <div class="flex-1 overflow-y-auto mb-4">
        <div v-if="searchingProducts" class="text-center py-8">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
        </div>
        <div v-else-if="searchResults.length === 0 && productSearch" class="text-center py-8 theme-text opacity-70">
          Nincs találat
        </div>
        <div v-else-if="searchResults.length === 0" class="text-center py-8 theme-text opacity-70">
          Kezdj el gépelni a kereséshez
        </div>
        <div v-else class="space-y-2">
          <div 
            v-for="product in searchResults" 
            :key="product.id"
            class="flex items-center justify-between p-3 rounded-lg hover:opacity-80 transition cursor-pointer theme-surface"
            @click="addProductToList(product)"
          >
            <div class="flex-1">
              <p class="font-semibold theme-text">{{ product.name }}</p>
              <p class="text-sm theme-text opacity-60">{{ product.category.name }}</p>
              <p class="text-sm theme-text opacity-70">{{ product.price }} Ft</p>
            </div>
            <button 
              class="theme-btn-primary px-3 py-1 rounded-lg text-sm"
              @click.stop="addProductToList(product)"
            >
              Hozzáadás
            </button>
          </div>
        </div>
      </div>

      <div class="flex justify-end">
        <button 
          type="button"
          @click="closeAddItemsModal"
          class="px-4 py-2 border border-current border-opacity-20 rounded-lg theme-text hover:opacity-70 transition"
        >
          Bezárás
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { Link, usePage } from '@inertiajs/vue3';
import DefaultLayout from '@/layouts/DefaultLayout.vue';
import axios from 'axios';

const page = usePage();
const user = computed(() => page.props.auth?.user);

const loading = ref(false);
const shoppingLists = ref([]);
const showCreateModal = ref(false);
const editingList = ref(null);
const listForm = reactive({
  name: '',
  description: ''
});

const showAddItemsModal = ref(false);
const selectedListForItems = ref(null);
const productSearch = ref('');
const searchResults = ref([]);
const searchingProducts = ref(false);
let searchTimeout = null;

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

const saveList = async () => {
  try {
    if (editingList.value) {
      await axios.put(`/api/shopping-lists/${editingList.value.id}`, listForm);
    } else {
      await axios.post('/api/shopping-lists', listForm);
    }
    await fetchShoppingLists();
    closeModal();
  } catch (error) {
    console.error('Failed to save list:', error);
  }
};

const editList = (list) => {
  editingList.value = list;
  listForm.name = list.name;
  listForm.description = list.description || '';
  showCreateModal.value = true;
};

const deleteList = async (listId) => {
  if (!confirm('Biztosan törölni szeretnéd ezt a listát?')) return;

  try {
    await axios.delete(`/api/shopping-lists/${listId}`);
    await fetchShoppingLists();
  } catch (error) {
    console.error('Failed to delete list:', error);
  }
};

const closeModal = () => {
  showCreateModal.value = false;
  editingList.value = null;
  listForm.name = '';
  listForm.description = '';
};

const openAddItemsModal = (list) => {
  selectedListForItems.value = list;
  showAddItemsModal.value = true;
  productSearch.value = '';
  searchResults.value = [];
};

const closeAddItemsModal = () => {
  showAddItemsModal.value = false;
  selectedListForItems.value = null;
  productSearch.value = '';
  searchResults.value = [];
};

const searchProducts = () => {
  if (searchTimeout) {
    clearTimeout(searchTimeout);
  }

  if (!productSearch.value || productSearch.value.trim().length < 2) {
    searchResults.value = [];
    return;
  }

  searchTimeout = setTimeout(async () => {
    searchingProducts.value = true;
    try {
      const response = await axios.get('/api/products', {
        params: {
          search: productSearch.value
        }
      });
      searchResults.value = response.data;
    } catch (error) {
      console.error('Failed to search products:', error);
    } finally {
      searchingProducts.value = false;
    }
  }, 300);
};

const addProductToList = async (product) => {
  if (!selectedListForItems.value) return;

  try {
    await axios.post(`/api/shopping-lists/${selectedListForItems.value.id}/items`, {
      product_id: product.id,
      name: product.name,
      quantity: 1
    });
    await fetchShoppingLists();
  } catch (error) {
    console.error('Failed to add product:', error);
  }
};

const removeItem = async (listId, itemId) => {
  try {
    await axios.delete(`/api/shopping-lists/${listId}/items/${itemId}`);
    await fetchShoppingLists();
  } catch (error) {
    console.error('Failed to remove item:', error);
  }
};

const toggleItemChecked = async (listId, item) => {
  try {
    await axios.put(`/api/shopping-lists/${listId}/items/${item.id}`, {
      checked: !item.checked
    });
    item.checked = !item.checked;
  } catch (error) {
    console.error('Failed to update item:', error);
  }
};

const checkedItemsCount = (list) => {
  return list.items.filter(item => item.checked).length;
};

onMounted(() => {
  fetchShoppingLists();
});
</script>
