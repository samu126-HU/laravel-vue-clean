import { ref } from 'vue';
import axios from 'axios';

export function useAdminCategories() {
  const categories = ref([]);
  const loading = ref(false);
  const pagination = ref({
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 0
  });

  const fetchCategories = async (page = 1, search = '') => {
    loading.value = true;
    try {
      const response = await axios.get('/api/v1/admin/categories', {
        params: { page, search }
      });
      categories.value = response.data.data;
      pagination.value = {
        current_page: response.data.current_page,
        last_page: response.data.last_page,
        per_page: response.data.per_page,
        total: response.data.total
      };
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      throw error;
    } finally {
      loading.value = false;
    }
  };

  const createCategory = async (categoryData) => {
    try {
      const response = await axios.post('/api/v1/admin/categories', categoryData);
      return response.data;
    } catch (error) {
      console.error('Failed to create category:', error);
      throw error;
    }
  };

  const updateCategory = async (categoryId, categoryData) => {
    try {
      const response = await axios.put(`/api/v1/admin/categories/${categoryId}`, categoryData);
      return response.data;
    } catch (error) {
      console.error('Failed to update category:', error);
      throw error;
    }
  };

  const deleteCategory = async (categoryId) => {
    try {
      await axios.delete(`/api/v1/admin/categories/${categoryId}`);
    } catch (error) {
      console.error('Failed to delete category:', error);
      throw error;
    }
  };

  return {
    categories,
    loading,
    pagination,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory
  };
}
