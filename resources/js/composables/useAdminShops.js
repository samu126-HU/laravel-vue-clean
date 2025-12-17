import { ref } from 'vue';
import axios from 'axios';

export function useAdminShops() {
  const shops = ref([]);
  const loading = ref(false);
  const pagination = ref({
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 0
  });

  const fetchShops = async (page = 1, search = '') => {
    loading.value = true;
    try {
      const response = await axios.get('/api/admin/shops', {
        params: { page, search }
      });
      shops.value = response.data.data;
      pagination.value = {
        current_page: response.data.current_page,
        last_page: response.data.last_page,
        per_page: response.data.per_page,
        total: response.data.total
      };
    } catch (error) {
      console.error('Failed to fetch shops:', error);
      throw error;
    } finally {
      loading.value = false;
    }
  };

  const createShop = async (shopData) => {
    try {
      const response = await axios.post('/api/admin/shops', shopData);
      return response.data;
    } catch (error) {
      console.error('Failed to create shop:', error);
      throw error;
    }
  };

  const updateShop = async (shopId, shopData) => {
    try {
      const response = await axios.put(`/api/admin/shops/${shopId}`, shopData);
      return response.data;
    } catch (error) {
      console.error('Failed to update shop:', error);
      throw error;
    }
  };

  const deleteShop = async (shopId) => {
    try {
      await axios.delete(`/api/admin/shops/${shopId}`);
    } catch (error) {
      console.error('Failed to delete shop:', error);
      throw error;
    }
  };

  return {
    shops,
    loading,
    pagination,
    fetchShops,
    createShop,
    updateShop,
    deleteShop
  };
}
