import { ref } from 'vue';
import axios from 'axios';

export function useAdminStatistics() {
  const statistics = ref({
    total_users: 0,
    total_products: 0,
    total_categories: 0,
    total_shops: 0,
    total_shopping_lists: 0,
    recent_users: []
  });
  const loading = ref(false);

  const fetchStatistics = async () => {
    loading.value = true;
    try {
      const response = await axios.get('/api/v1/admin/statistics');
      statistics.value = response.data;
    } catch (error) {
      console.error('Failed to fetch statistics:', error);
      throw error;
    } finally {
      loading.value = false;
    }
  };

  return {
    statistics,
    loading,
    fetchStatistics
  };
}
