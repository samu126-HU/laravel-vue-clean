import { ref } from 'vue';
import axios from 'axios';

export function useAdminProducts() {
  const products = ref([]);
  const loading = ref(false);
  const pagination = ref({
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 0
  });

  const fetchProducts = async (page = 1, search = '') => {
    loading.value = true;
    try {
      const response = await axios.get('/api/admin/products', {
        params: { page, search }
      });
      products.value = response.data.data;
      pagination.value = {
        current_page: response.data.current_page,
        last_page: response.data.last_page,
        per_page: response.data.per_page,
        total: response.data.total
      };
    } catch (error) {
      console.error('Failed to fetch products:', error);
      throw error;
    } finally {
      loading.value = false;
    }
  };

  const createProduct = async (productData) => {
    try {
      const response = await axios.post('/api/admin/products', productData);
      return response.data;
    } catch (error) {
      console.error('Failed to create product:', error);
      throw error;
    }
  };

  const updateProduct = async (productId, productData) => {
    try {
      const response = await axios.put(`/api/admin/products/${productId}`, productData);
      return response.data;
    } catch (error) {
      console.error('Failed to update product:', error);
      throw error;
    }
  };

  const deleteProduct = async (productId) => {
    try {
      await axios.delete(`/api/admin/products/${productId}`);
    } catch (error) {
      console.error('Failed to delete product:', error);
      throw error;
    }
  };

  return {
    products,
    loading,
    pagination,
    fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct
  };
}
