import { ref } from 'vue';
import axios from 'axios';

export function useShoppingLists() {
  const loading = ref(false);
  const shoppingLists = ref([]);

  const fetchShoppingLists = async (userId) => {
    if (!userId) return;

    loading.value = true;
    try {
      const response = await axios.get('/api/shopping-lists');
      // Sort by created_at descending (newest first)
      shoppingLists.value = response.data.sort((a, b) => 
        new Date(b.created_at) - new Date(a.created_at)
      );
      return shoppingLists.value;
    } catch (error) {
      console.error('Failed to fetch shopping lists:', error);
      throw error;
    } finally {
      loading.value = false;
    }
  };

  const createList = async (listData) => {
    try {
      const response = await axios.post('/api/shopping-lists', listData);
      return response.data;
    } catch (error) {
      console.error('Failed to create list:', error);
      throw error;
    }
  };

  const updateList = async (listId, listData) => {
    try {
      const response = await axios.put(`/api/shopping-lists/${listId}`, listData);
      return response.data;
    } catch (error) {
      console.error('Failed to update list:', error);
      throw error;
    }
  };

  const deleteList = async (listId) => {
    try {
      await axios.delete(`/api/shopping-lists/${listId}`);
    } catch (error) {
      console.error('Failed to delete list:', error);
      throw error;
    }
  };

  const checkedItemsCount = (list) => {
    return list.items.filter(item => item.checked).length;
  };

  return {
    loading,
    shoppingLists,
    fetchShoppingLists,
    createList,
    updateList,
    deleteList,
    checkedItemsCount
  };
}
