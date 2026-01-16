import { ref, reactive } from 'vue';
import axios from 'axios';

export function useShoppingListItems() {
  const productQuantities = reactive({});

  const addItem = async (listId, itemData) => {
    try {
      await axios.post(`/api/v1/shopping-lists/${listId}/items`, itemData);
    } catch (error) {
      console.error('Failed to add item:', error);
      throw error;
    }
  };

  const updateItem = async (listId, itemId, itemData) => {
    try {
      await axios.put(`/api/v1/shopping-lists/${listId}/items/${itemId}`, itemData);
    } catch (error) {
      console.error('Failed to update item:', error);
      throw error;
    }
  };

  const removeItem = async (listId, itemId) => {
    try {
      await axios.delete(`/api/v1/shopping-lists/${listId}/items/${itemId}`);
    } catch (error) {
      console.error('Failed to remove item:', error);
      throw error;
    }
  };

  const toggleItemChecked = async (listId, item) => {
    try {
      await axios.put(`/api/v1/shopping-lists/${listId}/items/${item.id}`, {
        checked: !item.checked
      });
      item.checked = !item.checked;
    } catch (error) {
      console.error('Failed to update item:', error);
      throw error;
    }
  };

  const incrementQuantity = (productId) => {
    if (!productQuantities[productId]) {
      productQuantities[productId] = 1;
    }
    productQuantities[productId]++;
  };

  const decrementQuantity = (productId) => {
    if (!productQuantities[productId]) {
      productQuantities[productId] = 1;
    }
    if (productQuantities[productId] > 1) {
      productQuantities[productId]--;
    }
  };

  const initializeQuantity = (productId) => {
    if (!productQuantities[productId]) {
      productQuantities[productId] = 1;
    }
  };

  const resetQuantity = (productId) => {
    productQuantities[productId] = 1;
  };

  return {
    productQuantities,
    addItem,
    updateItem,
    removeItem,
    toggleItemChecked,
    incrementQuantity,
    decrementQuantity,
    initializeQuantity,
    resetQuantity
  };
}
