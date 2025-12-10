<template>
    <div class="flex-1 theme-surface">
      <div class="max-w-4xl mx-auto py-6 px-4">
        <div class="flex justify-between items-center mb-6">
          <h1 class="text-3xl font-bold theme-text">Bevásárlólistáim</h1>
          <button 
            @click="showCreateModal = true"
            class="theme-btn-primary px-4 py-2 rounded-lg"
          >
            + Új lista
          </button>
        </div>

        <div v-if="loading" class="text-center py-8 theme-text">
          Töltés...
        </div>

        <div v-else-if="shoppingLists.length === 0" class="text-center py-8 theme-text opacity-60">
          Még nincsenek bevásárlólistáid. Hozz létre egyet!
        </div>

        <div v-else class="space-y-4">
          <div 
            v-for="list in shoppingLists" 
            :key="list.id"
            class="theme-background rounded-lg shadow p-6"
          >
            <div class="flex justify-between items-start mb-4">
              <div>
                <h2 class="text-xl font-bold theme-text">{{ list.name }}</h2>
                <p class="text-sm theme-text opacity-60">
                  {{ list.items.length }} termék, {{ checkedItemsCount(list) }} megvásárolva
                </p>
              </div>
              <div class="flex gap-2">
                <button 
                  @click="openAddItemsModal(list)"
                  class="theme-btn-primary px-3 py-1 rounded-lg text-sm"
                >
                  + Termékek
                </button>
                <button 
                  @click="editList(list)"
                  class="px-3 py-1 border border-current border-opacity-20 rounded-lg theme-text hover:opacity-70 transition text-sm"
                >
                  Szerkesztés
                </button>
                <button 
                  @click="deleteList(list.id)"
                  class="px-3 py-1 border border-current border-opacity-20 rounded-lg theme-text hover:opacity-70 transition text-sm text-red-600"
                >
                  Törlés
                </button>
              </div>
            </div>

            <div v-if="list.items.length > 0" class="space-y-2">
              <div 
                v-for="item in list.items" 
                :key="item.id"
                class="flex items-center justify-between p-3 theme-surface rounded-lg"
              >
                <div class="flex items-center gap-3 flex-1">
                  <input 
                    type="checkbox"
                    :checked="item.checked"
                    @change="toggleItemChecked(list.id, item)"
                    class="w-5 h-5 cursor-pointer"
                  />
                  <div>
                    <p class="theme-text" :class="{ 'line-through opacity-50': item.checked }">
                      {{ item.name }}
                    </p>
                    <p v-if="item.product?.category" class="text-sm theme-text opacity-50">
                      {{ item.product.category.name }}
                    </p>
                  </div>
                </div>
                <div class="flex items-center gap-4">
                  <span class="theme-text opacity-60">{{ item.quantity }}x</span>
                  <button 
                    @click="removeItem(list.id, item.id)"
                    class="theme-text opacity-60 hover:opacity-100 transition"
                  >
                    ×
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <div 
      v-if="showCreateModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      @click.self="closeModal"
    >
      <div class="theme-background rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
        <h2 class="text-xl font-bold mb-4 theme-text">
          {{ editingList ? 'Lista szerkesztése' : 'Új lista' }}
        </h2>
        
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium mb-2 theme-text">Név</label>
            <input 
              v-model="listForm.name"
              type="text" 
              class="w-full px-3 py-2 theme-background border border-current border-opacity-20 rounded-lg theme-text focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Pl. Heti bevásárlás"
              @keyup.enter="saveList"
            />
          </div>
        </div>

        <div class="flex justify-end gap-3 mt-6">
          <button 
            type="button"
            @click="closeModal"
            class="px-4 py-2 border border-current border-opacity-20 rounded-lg theme-text hover:opacity-70 transition"
          >
            Mégse
          </button>
          <button 
            type="button"
            @click="saveList"
            class="theme-btn-primary px-4 py-2 rounded-lg"
          >
            {{ editingList ? 'Mentés' : 'Létrehozás' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Full-screen Add Items Modal -->
    <div 
      v-if="showAddItemsModal && selectedListForItems"
      class="fixed left-0 right-0 bottom-0 top-16 theme-background z-40 flex flex-col"
    >
      <!-- Top Bar -->
      <div class="p-4 border-b border-current border-opacity-10">
        <div class="max-w-4xl mx-auto flex gap-3">
          <input 
            v-model="productSearch"
            @input="searchProducts"
            @focus="searchInputFocused = true; showSearchResults = productSearch.trim().length >= 2"
            @blur="handleSearchBlur"
            type="text" 
            class="flex-1 px-4 py-2 theme-surface border border-current border-opacity-20 rounded-lg theme-text focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Termék keresése..."
          />
          <button 
            @click="closeAddItemsModal"
            class="px-6 py-2 border border-current border-opacity-20 rounded-lg theme-text hover:opacity-70 transition"
          >
            Mégse
          </button>
        </div>
      </div>

      <!-- Content Area -->
      <div class="flex-1 overflow-y-auto p-4">
        <div class="max-w-4xl mx-auto">
          <!-- Search Results (when focused and searching) -->
          <div v-if="showSearchResults && productSearch.trim().length >= 2">
            <h3 class="text-lg font-bold mb-4 theme-text">Találatok</h3>
            <div v-if="searchingProducts" class="text-center py-8 theme-text opacity-60">
              Keresés...
            </div>
            <div v-else-if="searchResults.length === 0" class="text-center py-8 theme-text opacity-60">
              Nincs találat
            </div>
            <div v-else class="space-y-3">
              <div 
                v-for="product in searchResults" 
                :key="product.id"
                class="theme-surface rounded-lg p-4 flex items-center justify-between"
              >
                <div>
                  <h4 class="font-medium theme-text">{{ product.name }}</h4>
                  <p v-if="product.category" class="text-sm theme-text opacity-50">{{ product.category.name }}</p>
                </div>
                <div class="flex items-center gap-2">
                  <button 
                    @click="decrementQuantity(product.id)"
                    class="w-8 h-8 flex items-center justify-center border border-current border-opacity-20 rounded theme-text hover:opacity-70 transition"
                  >
                    −
                  </button>
                  <input 
                    v-model.number="productQuantities[product.id]"
                    @focus="showSearchResults = true"
                    type="number"
                    min="1"
                    class="w-16 px-2 py-1 text-center theme-background border border-current border-opacity-20 rounded theme-text focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button 
                    @click="incrementQuantity(product.id)"
                    class="w-8 h-8 flex items-center justify-center border border-current border-opacity-20 rounded theme-text hover:opacity-70 transition"
                  >
                    +
                  </button>
                  <button 
                    @click="addProductToList(product)"
                    class="ml-2 theme-btn-primary px-4 py-1 rounded-lg text-sm"
                  >
                    Hozzáadás
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Already Added Items (when not focused or search empty) -->
          <div v-else>
            <h3 class="text-lg font-bold mb-4 theme-text">Hozzáadott termékek</h3>
            <div v-if="selectedListForItems.items.length === 0" class="text-center py-8 theme-text opacity-60">
              Még nincsenek termékek ezen a listán
            </div>
            <div v-else class="space-y-3">
              <div 
                v-for="item in selectedListForItems.items" 
                :key="item.id"
                class="theme-surface rounded-lg p-4 flex items-center justify-between"
              >
                <div>
                  <h4 class="font-medium theme-text">{{ item.name }}</h4>
                  <p v-if="item.product?.category" class="text-sm theme-text opacity-50">{{ item.product.category.name }}</p>
                </div>
                <div class="flex items-center gap-2">
                  <button 
                    @click="decrementItemQuantity(item)"
                    class="w-8 h-8 flex items-center justify-center border border-current border-opacity-20 rounded theme-text hover:opacity-70 transition"
                  >
                    −
                  </button>
                  <input 
                    v-model.number="item.quantity"
                    @change="updateItemQuantity(item)"
                    type="number"
                    min="1"
                    class="w-16 px-2 py-1 text-center theme-background border border-current border-opacity-20 rounded theme-text focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button 
                    @click="incrementItemQuantity(item)"
                    class="w-8 h-8 flex items-center justify-center border border-current border-opacity-20 rounded theme-text hover:opacity-70 transition"
                  >
                    +
                  </button>
                  <button 
                    @click="removeItem(selectedListForItems.id, item.id)"
                    class="ml-2 w-8 h-8 flex items-center justify-center border border-red-500 border-opacity-50 rounded text-red-600 hover:bg-red-500 hover:bg-opacity-10 transition"
                  >
                    ×
                  </button>
                </div>
              </div>
            </div>
          </div>
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
  name: ''
});

const showAddItemsModal = ref(false);
const selectedListForItems = ref(null);
const productSearch = ref('');
const searchResults = ref([]);
const searchingProducts = ref(false);
const searchInputFocused = ref(false);
const showSearchResults = ref(false);
const productQuantities = reactive({});
let searchTimeout = null;

const fetchShoppingLists = async () => {
  if (!user.value) return;

  loading.value = true;
  try {
    const response = await axios.get('/api/shopping-lists');
    shoppingLists.value = response.data;
    
    // Update selectedListForItems if it's open
    if (selectedListForItems.value) {
      const updatedList = shoppingLists.value.find(l => l.id === selectedListForItems.value.id);
      if (updatedList) {
        selectedListForItems.value = updatedList;
      }
    }
  } catch (error) {
    console.error('Failed to fetch shopping lists:', error);
  } finally {
    loading.value = false;
  }
};

const saveList = async () => {
  try {
    let savedList;
    if (editingList.value) {
      const response = await axios.put(`/api/shopping-lists/${editingList.value.id}`, listForm);
      savedList = response.data;
    } else {
      const response = await axios.post('/api/shopping-lists', listForm);
      savedList = response.data;
    }
    await fetchShoppingLists();
    closeModal();
    
    // Open add items modal for newly created lists
    if (!editingList.value && savedList) {
      // Find the full list object with items
      const fullList = shoppingLists.value.find(l => l.id === savedList.id);
      if (fullList) {
        openAddItemsModal(fullList);
      }
    }
  } catch (error) {
    console.error('Failed to save list:', error);
  }
};

const editList = (list) => {
  editingList.value = list;
  listForm.name = list.name;
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
};

const openAddItemsModal = (list) => {
  selectedListForItems.value = list;
  showAddItemsModal.value = true;
  productSearch.value = '';
  searchResults.value = [];
  searchInputFocused.value = false;
  showSearchResults.value = false;
};

const closeAddItemsModal = () => {
  showAddItemsModal.value = false;
  selectedListForItems.value = null;
  productSearch.value = '';
  searchResults.value = [];
  searchInputFocused.value = false;
  showSearchResults.value = false;
};

const handleSearchBlur = () => {
  // Don't hide search results on blur - let explicit actions control the view
  searchInputFocused.value = false;
};

const searchProducts = () => {
  if (searchTimeout) {
    clearTimeout(searchTimeout);
  }

  if (!productSearch.value || productSearch.value.trim().length < 2) {
    searchResults.value = [];
    showSearchResults.value = false;
    return;
  }
  
  showSearchResults.value = true;

  searchTimeout = setTimeout(async () => {
    searchingProducts.value = true;
    try {
      const response = await axios.get('/api/products', {
        params: {
          search: productSearch.value
        }
      });
      searchResults.value = response.data;
      
      // Initialize quantities for new products
      searchResults.value.forEach(product => {
        if (!productQuantities[product.id]) {
          productQuantities[product.id] = 1;
        }
      });
    } catch (error) {
      console.error('Failed to search products:', error);
    } finally {
      searchingProducts.value = false;
    }
  }, 300);
};

const incrementQuantity = (productId) => {
  if (!productQuantities[productId]) {
    productQuantities[productId] = 1;
  }
  productQuantities[productId]++;
};

const decrementQuantity = (productId) => {
  if (!productQuantities[productId]) {
    productQuantities[productId] = 1;
  }
  if (productQuantities[productId] > 1) {
    productQuantities[productId]--;
  }
};

const addProductToList = async (product) => {
  if (!selectedListForItems.value) return;

  const quantity = productQuantities[product.id] || 1;

  try {
    await axios.post(`/api/shopping-lists/${selectedListForItems.value.id}/items`, {
      product_id: product.id,
      name: product.name,
      quantity: quantity
    });
    await fetchShoppingLists();
    
    // Reset quantity after adding
    productQuantities[product.id] = 1;
  } catch (error) {
    console.error('Failed to add product:', error);
  }
};

const incrementItemQuantity = async (item) => {
  item.quantity++;
  await updateItemQuantity(item);
};

const decrementItemQuantity = async (item) => {
  if (item.quantity > 1) {
    item.quantity--;
    await updateItemQuantity(item);
  }
};

const updateItemQuantity = async (item) => {
  if (!selectedListForItems.value) return;

  try {
    await axios.put(`/api/shopping-lists/${selectedListForItems.value.id}/items/${item.id}`, {
      quantity: item.quantity
    });
  } catch (error) {
    console.error('Failed to update item quantity:', error);
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
