import { ref } from 'vue';
import axios from 'axios';

export function useProductSearch() {
  const productSearch = ref('');
  const searchResults = ref([]);
  const searchingProducts = ref(false);
  const searchInputFocused = ref(false);
  const showSearchResults = ref(false);
  let searchTimeout = null;

  const searchProducts = async () => {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    if (!productSearch.value || productSearch.value.trim().length < 2) {
      searchResults.value = [];
      showSearchResults.value = false;
      return;
    }
    
    showSearchResults.value = true;

    searchTimeout = setTimeout(async () => {
      searchingProducts.value = true;
      try {
        const response = await axios.get('/api/products', {
          params: {
            search: productSearch.value
          }
        });
        searchResults.value = response.data;
      } catch (error) {
        console.error('Failed to search products:', error);
      } finally {
        searchingProducts.value = false;
      }
    }, 300);
  };

  const clearSearch = () => {
    productSearch.value = '';
    searchResults.value = [];
    searchInputFocused.value = false;
    showSearchResults.value = false;
  };

  const handleSearchBlur = () => {
    // Don't hide search results on blur - let explicit actions control the view
    searchInputFocused.value = false;
  };

  const handleSearchFocus = () => {
    searchInputFocused.value = true;
    showSearchResults.value = productSearch.value.trim().length >= 2;
  };

  return {
    productSearch,
    searchResults,
    searchingProducts,
    searchInputFocused,
    showSearchResults,
    searchProducts,
    clearSearch,
    handleSearchBlur,
    handleSearchFocus
  };
}
