<template>
  <AdminLayout>
    <div>
      <div class="flex justify-between items-center mb-8">
        <h1 class="text-3xl font-bold theme-text">Users & Roles</h1>
      </div>

      <!-- Search Bar -->
      <div class="mb-6">
        <input
          v-model="searchQuery"
          @input="handleSearch"
          type="text"
          placeholder="Search users..."
          class="w-full theme-surface theme-text px-4 py-3 rounded-lg border border-gray-700 focus:outline-none focus:border-blue-500"
        />
      </div>

      <!-- Users Table -->
      <div class="theme-surface rounded-lg border border-gray-700 overflow-hidden">
        <div v-if="loading" class="p-8 text-center theme-text-secondary">
          Loading...
        </div>
        <div v-else-if="users.length === 0" class="p-8 text-center theme-text-secondary">
          No users found
        </div>
        
        <!-- Mobile View -->
        <div v-else class="md:hidden">
          <div 
            v-for="user in users" 
            :key="user.id"
            class="p-4 border-b border-gray-700/50 hover:bg-gray-800/30"
          >
            <div class="flex justify-between items-start mb-2">
              <div class="flex-1 min-w-0">
                <h3 class="theme-text font-medium truncate">{{ user.name }}</h3>
                <p class="theme-text-secondary text-sm truncate">{{ user.email }}</p>
              </div>
              <span 
                class="px-3 py-1 rounded-full text-xs font-medium ml-2 flex-shrink-0"
                :class="user.is_admin ? 'bg-blue-500/20 text-blue-400' : 'bg-gray-500/20 text-gray-400'"
              >
                {{ user.is_admin ? 'Admin' : 'User' }}
              </span>
            </div>
            <p class="theme-text-secondary text-xs mb-3">Joined: {{ formatDate(user.created_at) }}</p>
            <button
              v-if="user.is_admin"
              @click="toggleRole(user, false)"
              class="w-full px-3 py-2 bg-orange-500/20 text-orange-400 rounded hover:bg-orange-500/30 transition-colors text-sm"
            >
              Revoke Admin
            </button>
            <button
              v-else
              @click="toggleRole(user, true)"
              class="w-full px-3 py-2 bg-green-500/20 text-green-400 rounded hover:bg-green-500/30 transition-colors text-sm"
            >
              Make Admin
            </button>
          </div>
        </div>

        <!-- Desktop View -->
        <table v-if="!loading && users.length > 0" class="hidden md:table w-full">
          <thead class="border-b border-gray-700 theme-surface-elevated">
            <tr>
              <th class="text-left px-6 py-4 theme-text font-medium">Name</th>
              <th class="text-left px-6 py-4 theme-text font-medium">Email</th>
              <th class="text-left px-6 py-4 theme-text font-medium">Role</th>
              <th class="text-left px-6 py-4 theme-text font-medium">Joined</th>
              <th class="text-right px-6 py-4 theme-text font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr 
              v-for="user in users" 
              :key="user.id"
              class="border-b border-gray-700/50 hover:bg-gray-800/30"
            >
              <td class="px-6 py-4 theme-text">{{ user.name }}</td>
              <td class="px-6 py-4 theme-text-secondary">{{ user.email }}</td>
              <td class="px-6 py-4">
                <span 
                  class="px-3 py-1 rounded-full text-xs font-medium"
                  :class="user.is_admin ? 'bg-blue-500/20 text-blue-400' : 'bg-gray-500/20 text-gray-400'"
                >
                  {{ user.is_admin ? 'Admin' : 'User' }}
                </span>
              </td>
              <td class="px-6 py-4 theme-text-secondary">{{ formatDate(user.created_at) }}</td>
              <td class="px-6 py-4">
                <div class="flex justify-end gap-2">
                  <button
                    v-if="user.is_admin"
                    @click="toggleRole(user, false)"
                    class="px-3 py-1 bg-orange-500/20 text-orange-400 rounded hover:bg-orange-500/30 transition-colors"
                  >
                    Revoke Admin
                  </button>
                  <button
                    v-else
                    @click="toggleRole(user, true)"
                    class="px-3 py-1 bg-green-500/20 text-green-400 rounded hover:bg-green-500/30 transition-colors"
                  >
                    Make Admin
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="pagination.last_page > 1" class="flex justify-center gap-2 mt-6">
        <button
          v-for="page in paginationPages"
          :key="page"
          @click="changePage(page)"
          class="px-4 py-2 rounded-lg transition-colors"
          :class="page === pagination.current_page 
            ? 'theme-btn-primary' 
            : 'theme-surface theme-text hover:bg-gray-700'"
        >
          {{ page }}
        </button>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import AdminLayout from '@/layouts/AdminLayout.vue';
import { useAdminUsers } from '@/composables/useAdminUsers';

const { users, loading, pagination, fetchUsers, updateUserRole } = useAdminUsers();

const searchQuery = ref('');
let searchTimeout = null;

onMounted(() => {
  fetchUsers();
});

const handleSearch = () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    fetchUsers(1, searchQuery.value);
  }, 300);
};

const changePage = (page) => {
  fetchUsers(page, searchQuery.value);
};

const paginationPages = computed(() => {
  const pages = [];
  for (let i = 1; i <= pagination.value.last_page; i++) {
    pages.push(i);
  }
  return pages;
});

const toggleRole = async (user, isAdmin) => {
  const action = isAdmin ? 'grant admin privileges to' : 'revoke admin privileges from';
  if (confirm(`Are you sure you want to ${action} "${user.name}"?`)) {
    try {
      await updateUserRole(user.id, isAdmin);
      await fetchUsers(pagination.value.current_page, searchQuery.value);
    } catch (error) {
      console.error('Failed to update user role:', error);
    }
  }
};

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};
</script>
