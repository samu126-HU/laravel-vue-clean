<script setup>
import { ref, watch, nextTick, onMounted } from 'vue';
import axios from 'axios';

const props = defineProps({
  visible: {
    type: Boolean,
    required: true
  },
  x: {
    type: Number,
    default: 0
  },
  y: {
    type: Number,
    default: 0
  },
  item: {
    type: Object,
    default: null
  }
});

const emit = defineEmits(['close', 'rename', 'delete', 'set-category', 'set-access-point']);

const inputRef = ref(null);
const nameInput = ref('');
const isEditing = ref(false);
const isSelectingCategory = ref(false);
const isSettingAccessPoint = ref(false);
const categories = ref([]);
const selectedCategories = ref([]);

onMounted(async () => {
  // Load categories from API
  try {
    const response = await axios.get('/api/categories');
    categories.value = response.data.categories;
  } catch (error) {
    console.error('Error loading categories:', error);
  }
});

watch(() => props.visible, (visible) => {
  if (visible) {
    nameInput.value = props.item?.name || '';
    selectedCategories.value = props.item?.categories || [];
    isEditing.value = false;
    isSelectingCategory.value = false;
    isSettingAccessPoint.value = false;
  }
});

function startRename() {
  isEditing.value = true;
  isSelectingCategory.value = false;
  isSettingAccessPoint.value = false;
  nextTick(() => {
    inputRef.value?.focus();
    inputRef.value?.select();
  });
}

function startCategorySelection() {
  isSelectingCategory.value = true;
  isEditing.value = false;
  isSettingAccessPoint.value = false;
}

function startAccessPointSetting() {
  isSettingAccessPoint.value = true;
  isEditing.value = false;
  isSelectingCategory.value = false;
  emit('close');
  // The actual click handling will be done in MapViewer
  emit('set-access-point', 'start');
}

function toggleCategory(categoryId) {
  const index = selectedCategories.value.indexOf(categoryId);
  if (index > -1) {
    selectedCategories.value.splice(index, 1);
  } else {
    selectedCategories.value.push(categoryId);
  }
}

function confirmCategories() {
  emit('set-category', selectedCategories.value);
  emit('close');
}

function confirmRename() {
  if (nameInput.value.trim()) {
    emit('rename', nameInput.value.trim());
    emit('close');
  }
}

function handleDelete() {
  emit('delete');
  emit('close');
}



function handleKeydown(event) {
  if (event.key === 'Enter') {
    confirmRename();
  } else if (event.key === 'Escape') {
    emit('close');
  }
}

function getCategoryById(id) {
  return categories.value.find(c => c.id === id);
}
</script>

<template>
  <teleport to="body">
    <div
      v-if="visible"
      class="fixed inset-0 z-50"
      @click="emit('close')"
      @contextmenu.prevent="emit('close')"
    >
      <div
        class="absolute theme-surface rounded-lg shadow-2xl overflow-hidden min-w-[250px] max-w-[350px]"
        :style="{ left: `${x}px`, top: `${y}px` }"
        @click.stop
      >
        <!-- Category Selection Mode -->
        <div v-if="isSelectingCategory" class="p-3 max-h-[400px] overflow-y-auto">
          <div class="text-sm font-semibold theme-text mb-3">Select Categories</div>
          <div class="space-y-1">
            <button
              v-for="category in categories"
              :key="category.id"
              @click="toggleCategory(category.id)"
              class="w-full px-3 py-2 text-left rounded-md theme-text text-sm flex items-center justify-between transition-colors"
              :class="selectedCategories.includes(category.id) ? 'bg-blue-100 dark:bg-blue-900' : 'hover:bg-gray-100 dark:hover:bg-gray-700'"
            >
              <span class="flex items-center gap-2">
                <span class="text-lg">{{ category.icon }}</span>
                <span>{{ category.name }}</span>
              </span>
              <span v-if="selectedCategories.includes(category.id)" class="text-blue-600 dark:text-blue-400">✓</span>
            </button>
          </div>
          <div class="flex gap-2 mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
            <button
              @click="confirmCategories"
              class="flex-1 px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-md text-sm font-medium transition-colors"
            >
              Save
            </button>
            <button
              @click="isSelectingCategory = false"
              class="px-3 py-1.5 theme-surface-hover theme-text rounded-md text-sm font-medium transition-colors"
            >
              Back
            </button>
          </div>
        </div>

        <!-- Editing Mode -->
        <div v-else-if="isEditing" class="p-3">
          <input
            ref="inputRef"
            v-model="nameInput"
            type="text"
            placeholder="Enter aisle name..."
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md theme-input theme-text text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            @keydown="handleKeydown"
          />
          <div class="flex gap-2 mt-2">
            <button
              @click="confirmRename"
              class="flex-1 px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-md text-sm font-medium transition-colors"
            >
              Save
            </button>
            <button
              @click="emit('close')"
              class="px-3 py-1.5 theme-surface-hover theme-text rounded-md text-sm font-medium transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>

        <!-- Menu Mode -->
        <div v-else class="py-1">
          <div class="px-4 py-2 text-xs font-semibold theme-text opacity-60 uppercase">
            {{ item?.name || 'Unnamed Aisle' }}
          </div>
          
          <!-- Show selected categories -->
          <div v-if="selectedCategories.length > 0" class="px-4 py-2 flex flex-wrap gap-1">
            <span
              v-for="catId in selectedCategories"
              :key="catId"
              class="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs theme-surface-hover"
              :style="{ backgroundColor: getCategoryById(catId)?.color + '20' }"
            >
              <span>{{ getCategoryById(catId)?.icon }}</span>
              <span class="theme-text">{{ getCategoryById(catId)?.name }}</span>
            </span>
          </div>
          
          <!-- Admin-only options -->
          <template v-if="item?.isAdmin">
            <div class="border-t border-gray-200 dark:border-gray-700"></div>
            
            <button
              @click="startRename"
              class="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 theme-text text-sm flex items-center gap-3 transition-colors"
            >
              <span class="text-lg">✏️</span>
              <span>Rename Aisle</span>
            </button>
            
            <button
              @click="startCategorySelection"
              class="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 theme-text text-sm flex items-center gap-3 transition-colors"
            >
              <span class="text-lg">🏷️</span>
              <span>Set Categories</span>
            </button>

            <button
              @click="startAccessPointSetting"
              class="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 theme-text text-sm flex items-center gap-3 transition-colors"
            >
              <span class="text-lg">📍</span>
              <span>Set Access Point</span>
            </button>

            <div class="border-t border-gray-200 dark:border-gray-700"></div>
            
            <button
              v-if="item?.name"
              @click="handleDelete"
              class="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 text-red-600 dark:text-red-400 text-sm flex items-center gap-3 transition-colors"
            >
              <span class="text-lg">🗑️</span>
              <span>Remove Name</span>
            </button>
          </template>
          
          <!-- Non-admin message -->
          <div v-else class="px-4 py-3 text-sm theme-text-secondary text-center">
            View only. Admin access required to edit.
          </div>
        </div>
      </div>
    </div>
  </teleport>
</template>
