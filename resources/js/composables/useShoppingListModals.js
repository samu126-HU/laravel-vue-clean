import { ref, reactive } from 'vue';

export function useShoppingListModals() {
  const showCreateModal = ref(false);
  const showAddItemsModal = ref(false);
  const editingList = ref(null);
  const selectedListForItems = ref(null);
  const listForm = reactive({
    name: ''
  });

  const openCreateModal = () => {
    showCreateModal.value = true;
  };

  const openEditModal = (list) => {
    editingList.value = list;
    listForm.name = list.name;
    showCreateModal.value = true;
  };

  const closeCreateModal = () => {
    showCreateModal.value = false;
    editingList.value = null;
    listForm.name = '';
  };

  const openAddItemsModal = (list) => {
    selectedListForItems.value = list;
    showAddItemsModal.value = true;
  };

  const closeAddItemsModal = () => {
    showAddItemsModal.value = false;
    selectedListForItems.value = null;
  };

  return {
    showCreateModal,
    showAddItemsModal,
    editingList,
    selectedListForItems,
    listForm,
    openCreateModal,
    openEditModal,
    closeCreateModal,
    openAddItemsModal,
    closeAddItemsModal
  };
}
