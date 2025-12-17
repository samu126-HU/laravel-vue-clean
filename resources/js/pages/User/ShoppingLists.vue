<template>
  <div class="flex-1 theme-surface">
    <div class="md:max-w-[85vw] mx-auto px-2 md:py-6 md:px-4">
      <div class="flex justify-between items-center my-3 md:mb-6">
        <h1 class="text-2xl font-bold theme-text">Bevásárlólistáim</h1>
        <button v-if="user" @click="openCreateModal" class="theme-btn-primary px-4 py-2 rounded-lg">
          + Új lista
        </button>
      </div>

      <div v-if="!user" class="text-center py-8 theme-text opacity-60">
        Kérlek jelentkezz be a bevásárlólisták megtekintéséhez.
      </div>

      <div v-else-if="loading" class="text-center py-8 theme-text">Töltés...</div>

      <div v-else-if="shoppingLists.length === 0" class="text-center py-8 theme-text opacity-60">
        Még nincsenek bevásárlólistáid. Hozz létre egyet!
      </div>

      <div v-else class="grid md:grid-cols-2 gap-3 md:gap-6">
        <div v-for="list in shoppingLists" :key="list.id" class="theme-background rounded-lg shadow p-3 md:p-6">
          <div class="flex justify-between items-start mb-2 md:mb-4">
            <div>
              <h2
                class="max-w-[65vw] md:max-w-[25vw] xl:max-w-[15vw] 2xl:max-w-[20vw] truncate text-xl font-bold theme-text">
                {{ list.name }}
              </h2>
              <p class="text-sm theme-text opacity-60">
                {{ list.items.length }} termék, {{ checkedItemsCount(list) }} megvásárolva
              </p>
            </div>

            <!-- Desktop: Show buttons separately -->
            <div class="hidden xl:flex gap-2">
              <button @click="openAddItemsModal(list)" class="theme-btn-primary px-3 py-1 rounded-lg text-sm">
                + Termékek
              </button>
              <button @click="editList(list)"
                class="px-3 py-1 border border-current border-opacity-20 rounded-lg theme-text hover:opacity-70 transition text-sm">
                Szerkesztés
              </button>
              <button @click="handleDeleteList(list.id)"
                class="px-3 py-1 border border-current border-opacity-20 rounded-lg theme-text hover:opacity-70 transition text-sm text-red-600">
                Törlés
              </button>
            </div>

            <!-- Mobile: Dropdown menu -->
            <div class="xl:hidden relative">
              <button @click="toggleDropdown(list.id)"
                class="px-3 py-1 border border-current border-opacity-20 rounded-lg theme-text hover:opacity-70 transition text-sm">
                ⋮
              </button>
              <div v-if="openDropdownId === list.id"
                class="absolute right-0 mt-2 w-40 theme-background rounded-lg shadow-lg border border-current border-opacity-20 z-10">
                <button @click="
                  openAddItemsModal(list);
                closeDropdown();
                " class="w-full text-left px-4 py-2 theme-text hover:opacity-70 transition text-sm">
                  + Termékek
                </button>
                <button @click="
                  editList(list);
                closeDropdown();
                " class="w-full text-left px-4 py-2 theme-text hover:opacity-70 transition text-sm">
                  ✎ Szerkesztés
                </button>
                <button @click="
                  handleDeleteList(list.id);
                closeDropdown();
                " class="w-full text-left px-4 py-2 text-red-600 hover:opacity-70 transition text-sm">
                  ✕ Törlés
                </button>
              </div>
            </div>
          </div>

          <!-- Collapse/Expand Button -->
          <button v-if="list.items.length > 0" @click="toggleItemsList(list.id)"
            class="w-full text-left py-2 theme-text opacity-70 hover:opacity-100 transition flex items-center gap-2">
            <span class="text-sm">{{ isListExpanded(list.id) ? "🞃" : "🞂" }} Termékek megjelenítése</span>
          </button>

          <div v-if="list.items.length > 0 && isListExpanded(list.id)" class="space-y-2">
            <div v-for="item in list.items" :key="item.id"
              class="flex items-center justify-between p-3 theme-surface rounded-lg">
              <div class="flex items-center gap-3 flex-1">
                <input type="checkbox" :checked="item.checked" @change="handleToggleItemChecked(list.id, item)"
                  class="w-5 h-5 cursor-pointer" />
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
                <button @click="handleRemoveItem(list.id, item.id)"
                  class="theme-text opacity-60 hover:opacity-100 transition">
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
  <div v-if="showCreateModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    @click.self="closeModal">
    <div class="theme-background rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
      <h2 class="text-xl font-bold mb-4 theme-text">
        {{ editingList ? "Lista szerkesztése" : "Új lista" }}
      </h2>

      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium mb-2 theme-text">Név</label>
          <input v-model="listForm.name" type="text"
            class="w-full px-3 py-2 theme-background border border-current border-opacity-20 rounded-lg theme-text focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Pl. Heti bevásárlás" @keyup.enter="saveList" />
        </div>
      </div>

      <div class="flex justify-end gap-3 mt-6">
        <button type="button" @click="closeCreateModal"
          class="px-4 py-2 border border-current border-opacity-20 rounded-lg theme-text hover:opacity-70 transition">
          Mégse
        </button>
        <button type="button" @click="saveList" class="theme-btn-primary px-4 py-2 rounded-lg">
          {{ editingList ? "Mentés" : "Létrehozás" }}
        </button>
      </div>
    </div>
  </div>

  <!-- Full-screen Add Items Modal -->
  <div v-if="showAddItemsModal && selectedListForItems"
    class="fixed left-0 right-0 bottom-0 top-16 theme-background z-40 flex flex-col">
    <!-- Top Bar -->
    <div class="p-4 border-b border-current border-opacity-10">
      <div class="max-w-4xl mx-auto flex gap-3">
        <input v-model="productSearch" @input="searchProducts" @focus="handleSearchFocus" @blur="handleSearchBlur"
          type="text"
          class="flex-1 px-4 py-2 theme-surface border border-current border-opacity-20 rounded-lg theme-text focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Termék keresése..." />
        <button @click="handleBackButton"
          class="px-6 py-2 border border-current border-opacity-20 rounded-lg theme-text hover:opacity-70 transition">
          Vissza
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
            <div v-for="product in searchResults" :key="product.id"
              class="theme-surface rounded-lg p-4 flex flex-col xs:flex-row items-start xs:items-center justify-between gap-3">
              <div>
                <h4 class="font-medium theme-text">{{ product.name }}</h4>
                <p v-if="product.category" class="text-sm theme-text opacity-50">
                  {{ product.category.name }}
                </p>
              </div>
              <div class="flex items-center gap-2 ml-auto">
                <button @click="decrementQuantity(product.id)"
                  class="w-8 h-8 flex items-center justify-center border border-current border-opacity-20 rounded theme-text hover:opacity-70 transition">
                  −
                </button>
                <input v-model.number="productQuantities[product.id]" @focus="showSearchResults = true" @input="e => {
                  const val = parseInt(e.target.value) || 1;
                  productQuantities[product.id] = Math.max(1, Math.min(999, val));
                }" type="number" min="1" max="999"
                  class="w-12 px-2 py-1 text-center theme-background border border-current border-opacity-20 rounded theme-text focus:outline-none focus:ring-2 focus:ring-blue-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                <button @click="incrementQuantity(product.id)"
                  class="w-8 h-8 flex items-center justify-center border border-current border-opacity-20 rounded theme-text hover:opacity-70 transition">
                  +
                </button>
                <button @click="addProductToList(product)"
                  class="md:ml-2  px-2.5 py-0.5 flex items-center justify-center theme-btn-primary text-lg rounded-lg">
                  <span class="hidden md:inline">Hozzáadás</span>
                  <span class="inline md:hidden">+</span>
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
            <div v-for="item in selectedListForItems.items" :key="item.id"
              class="theme-surface rounded-lg p-4 flex flex-col xs:flex-row items-start xs:items-center justify-between gap-3">
              <div>
                <h4 class="font-medium theme-text">{{ item.name }}</h4>
                <p v-if="item.product?.category" class="text-sm theme-text opacity-50">
                  {{ item.product.category.name }}
                </p>
              </div>
              <div class="ml-auto flex items-center gap-2">
                <button @click="decrementItemQuantity(item)"
                  class="w-8 h-8 flex items-center justify-center border border-current border-opacity-20 rounded theme-text hover:opacity-70 transition">
                  −
                </button>
                <input v-model.number="item.quantity" @change="updateItemQuantity(item)" @input="e => {
                  const val = parseInt(e.target.value) || 1;
                  productQuantities[product.id] = Math.max(1, Math.min(999, val));
                }" type="number" min="1" max="999"
                  class="w-12 px-2 py-1 text-center theme-background border border-current border-opacity-20 rounded theme-text focus:outline-none focus:ring-2 focus:ring-blue-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                <button @click="incrementItemQuantity(item)"
                  class="w-8 h-8 flex items-center justify-center border border-current border-opacity-20 rounded theme-text hover:opacity-70 transition">
                  +
                </button>
                <button @click="handleRemoveItem(selectedListForItems.id, item.id)"
                  class="ml-2 w-8 h-8 flex items-center justify-center border border-red-500 border-opacity-50 rounded text-red-600 hover:bg-red-500 hover:bg-opacity-10 transition">
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
import { ref, computed, onMounted, watch } from "vue";
import { usePage } from "@inertiajs/vue3";
import { useShoppingLists } from "@/composables/useShoppingLists";
import { useShoppingListItems } from "@/composables/useShoppingListItems";
import { useProductSearch } from "@/composables/useProductSearch";
import { useShoppingListModals } from "@/composables/useShoppingListModals";

const page = usePage();
const user = computed(() => page.props.auth?.user);

// Mobile dropdown menu
const openDropdownId = ref(null);

const toggleDropdown = (listId) => {
  openDropdownId.value = openDropdownId.value === listId ? null : listId;
};

const closeDropdown = () => {
  openDropdownId.value = null;
};

// Collapsible items list
const collapsedLists = ref(new Set());
const isDesktop = ref(window.innerWidth >= 768);

// Check if screen is desktop size
const updateIsDesktop = () => {
  isDesktop.value = window.innerWidth >= 768;
};

// Toggle items list visibility
const toggleItemsList = (listId) => {
  if (collapsedLists.value.has(listId)) {
    collapsedLists.value.delete(listId);
  } else {
    collapsedLists.value.add(listId);
  }
};

// Check if list is expanded (default open on desktop, closed on mobile)
const isListExpanded = (listId) => {
  if (isDesktop.value) {
    // Desktop: expanded by default unless explicitly collapsed
    return !collapsedLists.value.has(listId);
  } else {
    // Mobile: collapsed by default unless explicitly expanded
    return collapsedLists.value.has(listId);
  }
};

// Listen for window resize
if (typeof window !== "undefined") {
  window.addEventListener("resize", updateIsDesktop);
}

// Shopping lists management
const {
  loading,
  shoppingLists,
  fetchShoppingLists,
  createList,
  updateList,
  deleteList,
  checkedItemsCount,
} = useShoppingLists();

// Shopping list items management
const {
  productQuantities,
  addItem,
  updateItem,
  removeItem,
  toggleItemChecked,
  incrementQuantity,
  decrementQuantity,
  initializeQuantity,
  resetQuantity,
} = useShoppingListItems();

// Product search
const {
  productSearch,
  searchResults,
  searchingProducts,
  searchInputFocused,
  showSearchResults,
  searchProducts: performSearch,
  clearSearch,
  handleSearchBlur,
  handleSearchFocus,
} = useProductSearch();

// Modals
const {
  showCreateModal,
  showAddItemsModal,
  editingList,
  selectedListForItems,
  listForm,
  openCreateModal,
  openEditModal,
  closeCreateModal,
  openAddItemsModal: openItemsModal,
  closeAddItemsModal: closeItemsModal,
} = useShoppingListModals();

// Fetch lists and update selected list
const refreshLists = async () => {
  await fetchShoppingLists(user.value?.id);
  if (selectedListForItems.value) {
    const updatedList = shoppingLists.value.find(
      (l) => l.id === selectedListForItems.value.id
    );
    if (updatedList) {
      selectedListForItems.value = updatedList;
    }
  }
};

// Save list (create or update)
const saveList = async () => {
  try {
    let savedList;
    const isNewList = !editingList.value; // Store this before closing modal
    
    if (editingList.value) {
      savedList = await updateList(editingList.value.id, listForm);
    } else {
      savedList = await createList(listForm);
    }
    await refreshLists();
    closeCreateModal();

    // Open add items modal for newly created lists only
    if (isNewList && savedList) {
      const fullList = shoppingLists.value.find((l) => l.id === savedList.id);
      if (fullList) {
        openAddItemsModal(fullList);
      }
    }
  } catch (error) {
    console.error("Failed to save list:", error);
  }
};

// Edit list
const editList = (list) => {
  openEditModal(list);
};

// Delete list with confirmation
const handleDeleteList = async (listId) => {
  if (!confirm("Biztosan törölni szeretnéd ezt a listát?")) return;
  try {
    await deleteList(listId);
    await refreshLists();
  } catch (error) {
    console.error("Failed to delete list:", error);
  }
};

// Open add items modal
const openAddItemsModal = (list) => {
  openItemsModal(list);
  clearSearch();
};

// Close add items modal
const closeAddItemsModal = () => {
  closeItemsModal();
  clearSearch();
};

// Handle back button - clear search if showing results, otherwise close modal
const handleBackButton = () => {
  if (showSearchResults.value && productSearch.value.trim().length >= 2) {
    // If showing search results, clear search to show added items
    productSearch.value = '';
    showSearchResults.value = false;
    searchResults.value = [];
  } else {
    // Otherwise close the modal
    closeAddItemsModal();
  }
};

// Search products
const searchProducts = () => {
  performSearch();
};

// Add product to list
const addProductToList = async (product) => {
  if (!selectedListForItems.value) return;

  const quantity = productQuantities[product.id] || 1;

  try {
    await addItem(selectedListForItems.value.id, {
      product_id: product.id,
      name: product.name,
      quantity: quantity,
    });
    await refreshLists();
    resetQuantity(product.id);
  } catch (error) {
    console.error("Failed to add product:", error);
  }
};

// Increment item quantity
const incrementItemQuantity = async (item) => {
  item.quantity++;
  await updateItemQuantity(item);
};

// Decrement item quantity
const decrementItemQuantity = async (item) => {
  if (item.quantity > 1) {
    item.quantity--;
    await updateItemQuantity(item);
  }
};

// Update item quantity
const updateItemQuantity = async (item) => {
  if (!selectedListForItems.value) return;
  try {
    await updateItem(selectedListForItems.value.id, item.id, {
      quantity: item.quantity,
    });
  } catch (error) {
    console.error("Failed to update item quantity:", error);
  }
};

// Remove item from list
const handleRemoveItem = async (listId, itemId) => {
  try {
    await removeItem(listId, itemId);
    await refreshLists();
  } catch (error) {
    console.error("Failed to remove item:", error);
  }
};

// Toggle item checked status
const handleToggleItemChecked = async (listId, item) => {
  try {
    await toggleItemChecked(listId, item);
  } catch (error) {
    console.error("Failed to toggle item:", error);
  }
};

// Initialize quantities when search results change
watch(searchResults, (results) => {
  results.forEach((product) => {
    initializeQuantity(product.id);
  });
});

onMounted(() => {
  refreshLists();
});
</script>
