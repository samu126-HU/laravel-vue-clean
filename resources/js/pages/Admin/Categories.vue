<template>
    <AdminLayout>
        <div>
            <div class="flex justify-between items-center mb-8">
                <h1 class="text-3xl font-bold theme-text">Categories</h1>
                <button @click="openCreateModal" class="theme-btn-primary px-4 py-2 rounded-lg flex items-center gap-2">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                    </svg>
                    Add Category
                </button>
            </div>

            <!-- Search Bar -->
            <div class="mb-6">
                <input v-model="searchQuery" @input="handleSearch" type="text" placeholder="Search categories..."
                    class="w-full theme-surface theme-text px-4 py-3 rounded-lg border border-gray-700 focus:outline-none focus:border-blue-500" />
            </div>

            <!-- Categories Table -->
            <div class="theme-surface rounded-lg border border-gray-700 overflow-hidden">
                <div v-if="loading" class="p-8 text-center theme-text-secondary">
                    Loading...
                </div>
                <div v-else-if="categories.length === 0" class="p-8 text-center theme-text-secondary">
                    No categories found
                </div>
                <table v-else class="w-full">
                    <thead class="border-b border-gray-700 theme-surface-elevated">
                        <tr>
                            <th class="text-left px-6 py-4 theme-text font-medium">Name</th>
                            <th class="text-left px-6 py-4 theme-text font-medium">Description</th>
                            <th class="text-right px-6 py-4 theme-text font-medium">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="category in categories" :key="category.id"
                            class="border-b border-gray-700/50 hover:bg-gray-800/30">
                            <td class="px-6 py-4 theme-text">{{ category.name }}</td>
                            <td class="px-6 py-4 theme-text-secondary">{{ category.description || '-' }}</td>
                            <td class="px-6 py-4">
                                <div class="flex justify-end gap-2">
                                    <button @click="openEditModal(category)"
                                        class="px-3 py-1 bg-blue-500/20 text-blue-400 rounded hover:bg-blue-500/30 transition-colors">
                                        Edit
                                    </button>
                                    <button @click="handleDelete(category)"
                                        class="px-3 py-1 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 transition-colors">
                                        Delete
                                    </button>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <!-- Pagination -->
            <div v-if="pagination.last_page > 1" class="flex justify-center gap-2 mt-6">
                <button v-for="page in paginationPages" :key="page" @click="changePage(page)"
                    class="px-4 py-2 rounded-lg transition-colors" :class="page === pagination.current_page
                        ? 'theme-btn-primary'
                        : 'theme-surface theme-text hover:bg-gray-700'">
                    {{ page }}
                </button>
            </div>

            <!-- Edit/Create Modal -->
            <div v-if="showModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
                @click.self="closeModal">
                <div class="theme-surface rounded-lg p-6 w-full max-w-md border border-gray-700">
                    <h2 class="text-2xl font-bold theme-text mb-4">
                        {{ editingCategory ? 'Edit Category' : 'Create Category' }}
                    </h2>

                    <form @submit.prevent="handleSubmit">
                        <div class="space-y-4">
                            <div>
                                <label class="block theme-text-secondary text-sm mb-2">Name</label>
                                <input v-model="formData.name" type="text" required
                                    class="w-full theme-surface theme-text px-4 py-2 rounded-lg border border-gray-700 focus:outline-none focus:border-blue-500" />
                            </div>

                            <div>
                                <label class="block theme-text-secondary text-sm mb-2">Description</label>
                                <textarea v-model="formData.description" rows="3"
                                    class="w-full theme-surface theme-text px-4 py-2 rounded-lg border border-gray-700 focus:outline-none focus:border-blue-500"></textarea>
                            </div>
                        </div>

                        <div class="flex gap-3 mt-6">
                            <button type="button" @click="closeModal"
                                class="flex-1 py-2 border border-current border-opacity-20 rounded-lg theme-text hover:opacity-70 transition">
                                Cancel
                            </button>
                            <button type="submit" class="flex-1 theme-btn-primary py-2 rounded-lg">
                                {{ editingCategory ? 'Update' : 'Create' }}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </AdminLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import AdminLayout from '@/layouts/AdminLayout.vue';
import { useAdminCategories } from '@/composables/useAdminCategories';

const { categories, loading, pagination, fetchCategories, createCategory, updateCategory, deleteCategory } = useAdminCategories();

const searchQuery = ref('');
const showModal = ref(false);
const editingCategory = ref(null);
const formData = ref({ name: '', description: '' });

let searchTimeout = null;

onMounted(() => {
    fetchCategories();
});

const handleSearch = () => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
        fetchCategories(1, searchQuery.value);
    }, 300);
};

const changePage = (page) => {
    fetchCategories(page, searchQuery.value);
};

const paginationPages = computed(() => {
    const pages = [];
    for (let i = 1; i <= pagination.value.last_page; i++) {
        pages.push(i);
    }
    return pages;
});

const openCreateModal = () => {
    editingCategory.value = null;
    formData.value = { name: '', description: '' };
    showModal.value = true;
};

const openEditModal = (category) => {
    editingCategory.value = category;
    formData.value = { name: category.name, description: category.description || '' };
    showModal.value = true;
};

const closeModal = () => {
    showModal.value = false;
    editingCategory.value = null;
    formData.value = { name: '', description: '' };
};

const handleSubmit = async () => {
    try {
        if (editingCategory.value) {
            await updateCategory(editingCategory.value.id, formData.value);
        } else {
            await createCategory(formData.value);
        }
        await fetchCategories(pagination.value.current_page, searchQuery.value);
        closeModal();
    } catch (error) {
        console.error('Failed to save category:', error);
    }
};

const handleDelete = async (category) => {
    if (confirm(`Are you sure you want to delete "${category.name}"?`)) {
        try {
            await deleteCategory(category.id);
            await fetchCategories(pagination.value.current_page, searchQuery.value);
        } catch (error) {
            console.error('Failed to delete category:', error);
        }
    }
};
</script>
