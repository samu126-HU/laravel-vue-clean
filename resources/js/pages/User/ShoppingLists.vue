<template>
  <Toast />
  <div class="flex-1 min-h-screen theme-background theme-text">
    <div class="md:max-w-[85vw] mx-auto px-4 md:py-12 md:px-4">
      <!-- Success Message -->
      <transition name="slide-down">
        <div v-if="completionMessage.show" class="mt-6 mb-6">
          <div class="theme-surface rounded-lg p-4 border border-green-500 border-opacity-30 shadow-lg">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div class="flex-1 min-w-0">
                <div class="font-semibold theme-text">{{ $t('Shopping Complete!') }}</div>
                <div v-if="completionMessage.listName" class="text-sm theme-text opacity-70">
                  {{ completionMessage.listName }} • {{ completionMessage.itemsCount }} {{ $t('items checked off') }}
                </div>
              </div>
              <button @click="dismissCompletionMessage" class="flex-shrink-0 p-1 hover:bg-gray-500 hover:bg-opacity-20 rounded transition-colors">
                <svg class="w-5 h-5 theme-text opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </transition>

      <div class="flex flex-col md:flex-row md:justify-between md:items-center my-6 md:mb-12 gap-4">
            <div class="mb-12">
                <h1 class="text-4xl md:text-5xl font-bold mb-4 bg-linear-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">
                    {{ $t('My Shopping Lists') }}
                </h1>
                <p class="text-lg opacity-80">
                    {{ $t('Manage and edit your shopping lists in one place') }}
                </p>
            </div>
        <button v-if="user" @click="openCreateModal" 
          class="theme-btn-primary px-6 py-3 rounded-lg font-medium hover:opacity-90 active:opacity-80 active:scale-95 transform transition-all flex items-center gap-2 shadow-lg">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          {{ $t('New List') }}
        </button>
      </div>

      <div v-if="!user" class="text-center py-16">
        <div class="max-w-md mx-auto theme-surface rounded-xl p-8 shadow-lg">
          <svg class="w-16 h-16 mx-auto mb-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <p class="text-lg opacity-60">{{ $t('Please log in to view shopping lists.') }}</p>
        </div>
      </div>

      <div v-else-if="loading" class="text-center py-16 theme-text">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-current"></div>
      </div>

      <div v-else-if="shoppingLists.length === 0" class="text-center py-16">
        <div class="max-w-md mx-auto theme-surface rounded-xl p-8 shadow-lg">
          <svg class="w-16 h-16 mx-auto mb-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <p class="text-lg opacity-60 mb-4">{{ $t("You don't have any shopping lists yet.") }}</p>
          <button @click="openCreateModal" class="theme-btn-primary px-6 py-3 rounded-lg font-medium active:scale-95 transform transition-all">
            {{ $t('Create one!') }}
          </button>
        </div>
      </div>

      <div v-else class="grid md:grid-cols-2 gap-6">
        <div v-for="(list, index) in shoppingLists" :key="list.id" 
          class="theme-surface rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
          <div class="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3 mb-4">
            <div class="flex items-start gap-3 min-w-0 overflow-hidden">
              <div :class="[
                'w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0',
                index % 4 === 0 ? 'bg-blue-500 bg-opacity-20' : '',
                index % 4 === 1 ? 'bg-green-500 bg-opacity-20' : '',
                index % 4 === 2 ? 'bg-purple-500 bg-opacity-20' : '',
                index % 4 === 3 ? 'bg-orange-500 bg-opacity-20' : ''
              ]">
                <svg :class="[
                  'w-6 h-6',
                  index % 4 === 0 ? 'text-blue-500' : '',
                  index % 4 === 1 ? 'text-green-500' : '',
                  index % 4 === 2 ? 'text-purple-500' : '',
                  index % 4 === 3 ? 'text-orange-500' : ''
                ]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <div class="flex-1 min-w-0 overflow-hidden">
                <h2 class="block max-w-full text-xl font-bold theme-text truncate pr-2" :title="list.name">
                  {{ list.name }}
                </h2>
                <div class="flex flex-wrap items-center gap-4 text-sm theme-text opacity-60 mt-1 min-w-0">
                  <span class="flex items-center gap-1">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                    {{ list.items.length }} {{ $t('products') }}
                  </span>
                  <span class="flex items-center gap-1">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                    {{ checkedItemsCount(list) }} {{ $t('done') }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Desktop: Show buttons separately -->
            <div class="hidden lg:flex shrink-0 justify-self-end gap-2">
              <button @click="openAddItemsModal(list)" 
                :aria-label="$t('Add Products')"
                class="theme-btn-primary px-2 2xl:px-3 py-2 rounded-lg text-sm font-medium hover:opacity-90 active:opacity-80 active:scale-95 transform transition-all flex items-center justify-center 2xl:justify-start gap-0 2xl:gap-1">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
                <span class="hidden 2xl:inline">{{ $t('Add Products') }}</span>
              </button>
              <button @click="editList(list)"
                :aria-label="$t('Edit')"
                class="px-2 2xl:px-3 py-2 border border-current border-opacity-20 rounded-lg theme-text hover:bg-opacity-10 hover:bg-gray-500 active:bg-gray-500 active:bg-opacity-20 active:scale-95 transform transition-all text-sm font-medium flex items-center justify-center 2xl:justify-start gap-0 2xl:gap-1">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <span class="hidden 2xl:inline">{{ $t('Edit') }}</span>
              </button>
              <button @click="handleDeleteList(list.id)"
                :aria-label="$t('Delete')"
                class="px-2 2xl:px-3 py-2 border border-red-500 border-opacity-50 rounded-lg text-red-600 hover:bg-red-500 hover:bg-opacity-10 active:bg-red-500 active:bg-opacity-20 active:scale-95 transform transition-all text-sm font-medium flex items-center justify-center 2xl:justify-start gap-0 2xl:gap-1">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                <span class="hidden 2xl:inline">{{ $t('Delete') }}</span>
              </button>
            </div>

            <!-- Mobile: Dropdown menu -->
            <div class="lg:hidden relative shrink-0 justify-self-end">
              <button @click="toggleDropdown(list.id)"
                class="px-3 py-1 border border-current border-opacity-20 rounded-lg theme-text hover:opacity-70 active:bg-gray-500 active:bg-opacity-20 active:scale-95 transform transition-all text-sm">
                ⋮
              </button>
              <div v-if="openDropdownId === list.id"
                class="absolute right-0 mt-2 w-40 theme-background rounded-lg shadow-lg border border-current border-opacity-20 z-10">
                <button @click="
                  openAddItemsModal(list);
                closeDropdown();
                " class="w-full text-left px-4 py-2 theme-text hover:opacity-70 active:bg-gray-500 active:bg-opacity-20 transition text-sm">
                  {{ $t('Add Products') }}
                </button>
                <button @click="
                  editList(list);
                closeDropdown();
                " class="w-full text-left px-4 py-2 theme-text hover:opacity-70 active:bg-gray-500 active:bg-opacity-20 transition text-sm">
                  {{ $t('Edit') }}
                </button>
                <button @click="
                  handleDeleteList(list.id);
                closeDropdown();
                " class="w-full text-left px-4 py-2 text-red-600 hover:opacity-70 active:bg-red-500 active:bg-opacity-20 transition text-sm">
                  {{ $t('Delete') }}
                </button>
              </div>
            </div>
          </div>

          <!-- Collapse/Expand Button -->
          <button v-if="list.items.length > 0" @click="toggleItemsList(list.id)"
            class="w-full text-left py-2 theme-text opacity-70 hover:opacity-100 transition flex items-center gap-2">
            <span class="text-sm">{{ isListExpanded(list.id) ? "🥣" : "🥢" }} {{ $t('Show Products') }}</span>
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
        {{ editingList ? $t('Edit List') : $t('New List') }}
      </h2>

      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium mb-2 theme-text">{{ $t('Name') }}</label>
          <input v-model="listForm.name" type="text" maxlength="25"
            class="w-full px-3 py-2 theme-background border border-current border-opacity-20 rounded-lg theme-text focus:outline-none focus:ring-2 focus:ring-blue-500"
            :placeholder="$t('Grandma\'s shopping list')" @keyup.enter="saveList" />
        </div>
      </div>

      <div class="flex justify-end gap-3 mt-6">
        <button type="button" @click="closeCreateModal"
          class="px-4 py-2 border border-current border-opacity-20 rounded-lg theme-text hover:opacity-70 active:bg-gray-500 active:bg-opacity-20 active:scale-95 transform transition-all">
          {{ $t('Cancel') }}
        </button>
        <button type="button" @click="saveList" class="theme-btn-primary px-4 py-2 rounded-lg active:scale-95 transform transition-all">
          {{ editingList ? $t('Save') : $t('Create') }}
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
          :placeholder="$t('Product search')" />
        <button @click="handleBackButton"
          class="px-6 py-2 border border-current border-opacity-20 rounded-lg theme-text hover:opacity-70 active:bg-gray-500 active:bg-opacity-20 active:scale-95 transform transition-all">
          {{ $t('Back') }}
        </button>
      </div>
    </div>

    <!-- Content Area -->
    <div class="flex-1 overflow-y-auto p-4">
      <div class="max-w-4xl mx-auto">

        <!-- Search Results (when focused and searching) -->
        <div v-if="showSearchResults && productSearch.trim().length >= 2">
          <h3 class="text-lg font-bold mb-4 theme-text">{{ $t('Results') }}</h3>
          <div v-if="searchingProducts" class="text-center py-8 theme-text opacity-60">
            {{ $t('Searching...') }}
          </div>
          <div v-else-if="searchResults.length === 0" class="text-center py-8 theme-text opacity-60">
            {{ $t('No results') }}
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
                  class="w-8 h-8 flex items-center justify-center border border-current border-opacity-20 rounded theme-text hover:opacity-70 active:bg-gray-500 active:bg-opacity-20 active:scale-95 transform transition-all">
                  −
                </button>
                <input v-model.number="productQuantities[product.id]" @focus="showSearchResults = true" @input="e => {
                  const val = parseInt(e.target.value) || 1;
                  productQuantities[product.id] = Math.max(1, Math.min(999, val));
                }" type="number" min="1" max="999"
                  class="w-12 px-2 py-1 text-center theme-background border border-current border-opacity-20 rounded theme-text focus:outline-none focus:ring-2 focus:ring-blue-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                <button @click="incrementQuantity(product.id)"
                  class="w-8 h-8 flex items-center justify-center border border-current border-opacity-20 rounded theme-text hover:opacity-70 active:bg-gray-500 active:bg-opacity-20 active:scale-95 transform transition-all">
                  +
                </button>
                <button @click="addProductToList(product)"
                  class="md:ml-2  px-2.5 py-0.5 flex items-center justify-center theme-btn-primary text-lg rounded-lg active:scale-95 transform transition-all">
                  <span class="hidden md:inline">{{ $t('Add') }}</span>
                  <span class="inline md:hidden">+</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Already Added Items (when not focused or search empty) -->

        <div v-else>
          <h3 class="text-lg font-bold mb-4 theme-text">{{ $t('Added Products') }}</h3>
          <div v-if="selectedListForItems.items.length === 0" class="text-center py-8 theme-text opacity-60">
            {{ $t('No products on this list yet') }}
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
                  class="w-8 h-8 flex items-center justify-center border border-current border-opacity-20 rounded theme-text hover:opacity-70 active:bg-gray-500 active:bg-opacity-20 active:scale-95 transform transition-all">
                  −
                </button>
                <input v-model.number="item.quantity" @change="updateItemQuantity(item)" @input="e => {
                  const val = parseInt(e.target.value) || 1;
                  productQuantities[product.id] = Math.max(1, Math.min(999, val));
                }" type="number" min="1" max="999"
                  class="w-12 px-2 py-1 text-center theme-background border border-current border-opacity-20 rounded theme-text focus:outline-none focus:ring-2 focus:ring-blue-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                <button @click="incrementItemQuantity(item)"
                  class="w-8 h-8 flex items-center justify-center border border-current border-opacity-20 rounded theme-text hover:opacity-70 active:bg-gray-500 active:bg-opacity-20 active:scale-95 transform transition-all">
                  +
                </button>
                <button @click="handleRemoveItem(selectedListForItems.id, item.id)"
                  class="ml-2 w-8 h-8 flex items-center justify-center border border-red-500 border-opacity-50 rounded text-red-600 hover:bg-red-500 hover:bg-opacity-10 active:bg-red-500 active:bg-opacity-20 active:scale-95 transform transition-all">
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
import { trans } from 'laravel-vue-i18n';
import Toast from '../../Components/Toast.vue';
import { useToast } from '../../composables/useToast';
import { useShoppingLists } from "@/composables/useShoppingLists";
import { useShoppingListItems } from "@/composables/useShoppingListItems";
import { useProductSearch } from "@/composables/useProductSearch";
import { useShoppingListModals } from "@/composables/useShoppingListModals";

const page = usePage();
const user = computed(() => page.props.auth?.user);

// Completion message state
const completionMessage = ref({
  show: false,
  listName: '',
  itemsCount: 0
});

const dismissCompletionMessage = () => {
  completionMessage.value.show = false;
  // Clean URL
  const url = new URL(window.location);
  url.searchParams.delete('completed');
  url.searchParams.delete('items');
  window.history.replaceState({}, '', url);
};

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

// Toast notifications
const { success, error } = useToast();

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
      success(trans('List updated successfully!'));
    } else {
      savedList = await createList(listForm);
      success(trans('List created successfully!'));
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
    error(trans('Failed to save list'));
  }
};

// Edit list
const editList = (list) => {
  openEditModal(list);
};

// Delete list with confirmation
const handleDeleteList = async (listId) => {
  if (!confirm(trans('Are you sure you want to delete this list?'))) return;
  try {
    await deleteList(listId);
    await refreshLists();
    success(trans('List deleted successfully!'));
  } catch (error) {
    console.error("Failed to delete list:", error);
    error(trans('Failed to delete list'));
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
    success(trans('Item added to list!'));
  } catch (error) {
    console.error("Failed to add product:", error);
    error(trans('Failed to add item'));
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
    success(trans('Quantity updated!'));
  } catch (error) {
    console.error("Failed to update item quantity:", error);
    error(trans('Failed to update quantity'));
  }
};

// Remove item from list
const handleRemoveItem = async (listId, itemId) => {
  try {
    await removeItem(listId, itemId);
    await refreshLists();
    success(trans('Item removed from list!'));
  } catch (error) {
    console.error("Failed to remove item:", error);
    error(trans('Failed to remove item'));
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
  
  // Check for completion message from URL params
  const urlParams = new URLSearchParams(window.location.search);
  const completedListId = urlParams.get('completed');
  const itemsCount = urlParams.get('items');
  
  if (completedListId && itemsCount) {
    // Wait for lists to load, then show completion message
    setTimeout(() => {
      const completedList = shoppingLists.value.find(list => list.id == completedListId);
      if (completedList) {
        completionMessage.value = {
          show: true,
          listName: completedList.name,
          itemsCount: parseInt(itemsCount)
        };
        
        // Auto-dismiss after 10 seconds
        setTimeout(() => {
          dismissCompletionMessage();
        }, 10000);
      }
    }, 500);
  }
});
</script>

<style scoped>
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
}

.slide-down-enter-from {
  transform: translateY(-20px);
  opacity: 0;
}

.slide-down-leave-to {
  transform: translateY(-20px);
  opacity: 0;
}
</style>
