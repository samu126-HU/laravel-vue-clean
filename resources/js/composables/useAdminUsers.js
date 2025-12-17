import { ref } from 'vue';
import axios from 'axios';

export function useAdminUsers() {
  const users = ref([]);
  const loading = ref(false);
  const pagination = ref({
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 0
  });

  const fetchUsers = async (page = 1, search = '') => {
    loading.value = true;
    try {
      const response = await axios.get('/api/admin/users', {
        params: { page, search }
      });
      users.value = response.data.data;
      pagination.value = {
        current_page: response.data.current_page,
        last_page: response.data.last_page,
        per_page: response.data.per_page,
        total: response.data.total
      };
    } catch (error) {
      console.error('Failed to fetch users:', error);
      throw error;
    } finally {
      loading.value = false;
    }
  };

  const updateUserRole = async (userId, isAdmin) => {
    try {
      await axios.put(`/api/admin/users/${userId}/role`, { is_admin: isAdmin });
    } catch (error) {
      console.error('Failed to update user role:', error);
      throw error;
    }
  };

  return {
    users,
    loading,
    pagination,
    fetchUsers,
    updateUserRole
  };
}
