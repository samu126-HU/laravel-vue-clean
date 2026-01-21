<template>
    <AdminLayout>
        <div>
            <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <h1 class="text-2xl sm:text-3xl font-bold theme-text">Products</h1>
                <button @click="openCreateModal" class="theme-btn-primary px-4 py-2 rounded-lg flex items-center gap-2 w-full sm:w-auto justify-center">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                    </svg>
                    Add Product
                </button>
            </div>

            <!-- Search Bar -->
            <div class="mb-6">
                <input v-model="searchQuery" @input="handleSearch" type="text" placeholder="Search products..."
                    class="w-full theme-surface theme-text px-4 py-3 rounded-lg border border-gray-700 focus:outline-none focus:border-blue-500" />
            </div>

            <!-- Products Table -->
            <div class="theme-surface rounded-lg border border-gray-700 overflow-hidden">
                <div v-if="loading" class="p-8 text-center theme-text-secondary">
                    Loading...
                </div>
                <div v-else-if="products.length === 0" class="p-8 text-center theme-text-secondary">
                    No products found
                </div>
                
                <!-- Mobile View -->
                <div v-else class="md:hidden">
                    <div 
                        v-for="product in products" 
                        :key="product.id"
                        class="p-4 border-b border-gray-700/50 hover:bg-gray-800/30"
                    >
                        <h3 class="theme-text font-medium mb-1">{{ product.name }}</h3>
                        <p class="theme-text-secondary text-sm mb-1">
                            Category: {{ product.category ? product.category.name : 'None' }}
                        </p>
                        <p class="theme-text-secondary text-sm mb-3">{{ product.description || 'No description' }}</p>
                        <div class="flex gap-2">
                            <button @click="openEditModal(product)"
                                class="flex-1 px-3 py-2 bg-blue-500/20 text-blue-400 rounded hover:bg-blue-500/30 transition-colors text-sm">
                                Edit
                            </button>
                            <button @click="handleDelete(product)"
                                class="flex-1 px-3 py-2 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 transition-colors text-sm">
                                Delete
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Desktop View -->
                <table v-if="!loading && products.length > 0" class="hidden md:table w-full">
                    <thead class="border-b border-gray-700 theme-surface-elevated">
                        <tr>
                            <th class="text-left px-6 py-4 theme-text font-medium">Name</th>
                            <th class="text-left px-6 py-4 theme-text font-medium">Category</th>
                            <th class="text-left px-6 py-4 theme-text font-medium">Description</th>
                            <th class="text-right px-6 py-4 theme-text font-medium">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="product in products" :key="product.id"
                            class="border-b border-gray-700/50 hover:bg-gray-800/30">
                            <td class="px-6 py-4 theme-text">{{ product.name }}</td>
                            <td class="px-6 py-4 theme-text-secondary">
                                {{ product.category ? product.category.name : '-' }}
                            </td>
                            <td class="px-6 py-4 theme-text-secondary">{{ product.description || '-' }}</td>
                            <td class="px-6 py-4">
                                <div class="flex justify-end gap-2">
                                    <button @click="openEditModal(product)"
                                        class="px-3 py-1 bg-blue-500/20 text-blue-400 rounded hover:bg-blue-500/30 transition-colors">
                                        Edit
                                    </button>
                                    <button @click="handleDelete(product)"
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
            <div v-if="showModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                @click.self="closeModal">
                <div class="theme-surface rounded-lg p-4 sm:p-6 w-full max-w-2xl border border-gray-700">
                    <h2 class="text-2xl font-bold theme-text mb-4">
                        {{ editingProduct ? 'Edit Product' : 'Create Product' }}
                    </h2>

                    <form @submit.prevent="handleSubmit">
                        <div class="space-y-4">
                            <div>
                                <label class="block theme-text-secondary text-sm mb-2">Name</label>
                                <input v-model="formData.name" type="text" required
                                    class="w-full theme-surface theme-text px-4 py-2 rounded-lg border border-gray-700 focus:outline-none focus:border-blue-500" />
                            </div>

                            <div>
                                <label class="block theme-text-secondary text-sm mb-2">Category</label>
                                <select v-model="formData.category_id" required
                                    class="w-full theme-surface theme-text px-4 py-2 rounded-lg border border-gray-700 focus:outline-none focus:border-blue-500">
                                    <option value="">Select a category</option>
                                    <option v-for="category in allCategories" :key="category.id" :value="category.id">
                                        {{ category.name }}
                                    </option>
                                </select>
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
                                {{ editingProduct ? 'Update' : 'Create' }}
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
import { useAdminProducts } from '@/composables/useAdminProducts';
import axios from 'axios';

const { products, loading, pagination, fetchProducts, createProduct, updateProduct, deleteProduct } = useAdminProducts();

const searchQuery = ref('');
const showModal = ref(false);
const editingProduct = ref(null);
const formData = ref({ name: '', category_id: '', description: '' });
const allCategories = ref([]);

let searchTimeout = null;

onMounted(async () => {
    fetchProducts();
    await loadCategories();
});

const loadCategories = async () => {
    try {
        const response = await axios.get('/api/v1/categories');
        allCategories.value = response.data.categories || [];
    } catch (error) {
        console.error('Failed to load categories:', error);
    }
};

const handleSearch = () => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
        fetchProducts(1, searchQuery.value);
    }, 300);
};

const changePage = (page) => {
    fetchProducts(page, searchQuery.value);
};

const paginationPages = computed(() => {
    const pages = [];
    for (let i = 1; i <= pagination.value.last_page; i++) {
        pages.push(i);
    }
    return pages;
});

const openCreateModal = () => {
    editingProduct.value = null;
    formData.value = { name: '', category_id: '', description: '' };
    showModal.value = true;
};

const openEditModal = (product) => {
    editingProduct.value = product;
    formData.value = {
        name: product.name,
        category_id: product.category_id,
        description: product.description || ''
    };
    showModal.value = true;
};

const closeModal = () => {
    showModal.value = false;
    editingProduct.value = null;
    formData.value = { name: '', category_id: '', description: '' };
};

const handleSubmit = async () => {
    try {
        if (editingProduct.value) {
            await updateProduct(editingProduct.value.id, formData.value);
        } else {
            await createProduct(formData.value);
        }
        await fetchProducts(pagination.value.current_page, searchQuery.value);
        closeModal();
    } catch (error) {
        console.error('Failed to save product:', error);
    }
};

const handleDelete = async (product) => {
    if (confirm(`Are you sure you want to delete "${product.name}"?`)) {
        try {
            await deleteProduct(product.id);
            await fetchProducts(pagination.value.current_page, searchQuery.value);
        } catch (error) {
            console.error('Failed to delete product:', error);
        }
    }
};
</script>
