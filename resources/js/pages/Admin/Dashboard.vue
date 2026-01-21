<template>
  <AdminLayout>
    <div>
      <h1 class="text-3xl font-bold theme-text mb-8">Dashboard</h1>

      <!-- Statistics Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div class="theme-surface p-6 rounded-lg border border-gray-700">
          <div class="flex items-center justify-between">
            <div>
              <p class="theme-text-secondary text-sm">Total Users</p>
              <p class="text-3xl font-bold theme-text mt-2">{{ statistics.total_users }}</p>
            </div>
            <div class="bg-blue-500/20 p-3 rounded-lg">
              <svg class="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div class="theme-surface p-6 rounded-lg border border-gray-700">
          <div class="flex items-center justify-between">
            <div>
              <p class="theme-text-secondary text-sm">Total Products</p>
              <p class="text-3xl font-bold theme-text mt-2">{{ statistics.total_products }}</p>
            </div>
            <div class="bg-green-500/20 p-3 rounded-lg">
              <svg class="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
          </div>
        </div>

        <div class="theme-surface p-6 rounded-lg border border-gray-700">
          <div class="flex items-center justify-between">
            <div>
              <p class="theme-text-secondary text-sm">Total Categories</p>
              <p class="text-3xl font-bold theme-text mt-2">{{ statistics.total_categories }}</p>
            </div>
            <div class="bg-purple-500/20 p-3 rounded-lg">
              <svg class="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
            </div>
          </div>
        </div>

        <div class="theme-surface p-6 rounded-lg border border-gray-700">
          <div class="flex items-center justify-between">
            <div>
              <p class="theme-text-secondary text-sm">Total Shops</p>
              <p class="text-3xl font-bold theme-text mt-2">{{ statistics.total_shops }}</p>
            </div>
            <div class="bg-orange-500/20 p-3 rounded-lg">
              <svg class="w-8 h-8 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
          </div>
        </div>

        <div class="theme-surface p-6 rounded-lg border border-gray-700">
          <div class="flex items-center justify-between">
            <div>
              <p class="theme-text-secondary text-sm">Shopping Lists</p>
              <p class="text-3xl font-bold theme-text mt-2">{{ statistics.total_shopping_lists }}</p>
            </div>
            <div class="bg-pink-500/20 p-3 rounded-lg">
              <svg class="w-8 h-8 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Users -->
      <div class="theme-surface p-4 md:p-6 rounded-lg border border-gray-700">
        <h2 class="text-xl font-bold theme-text mb-4">Recent Users</h2>
        
        <!-- Mobile View -->
        <div class="md:hidden space-y-3">
          <div 
            v-for="user in statistics.recent_users" 
            :key="user.id"
            class="theme-surface-elevated p-4 rounded-lg border border-gray-700"
          >
            <div class="flex justify-between items-start mb-2">
              <h3 class="theme-text font-medium">{{ user.name }}</h3>
              <span 
                class="px-2 py-1 rounded text-xs font-medium"
                :class="user.is_admin ? 'bg-blue-500/20 text-blue-400' : 'bg-gray-500/20 text-gray-400'"
              >
                {{ user.is_admin ? 'Admin' : 'User' }}
              </span>
            </div>
            <p class="theme-text-secondary text-sm mb-1">{{ user.email }}</p>
            <p class="theme-text-secondary text-xs">Joined: {{ formatDate(user.created_at) }}</p>
          </div>
        </div>

        <!-- Desktop View -->
        <div class="hidden md:block overflow-x-auto">
          <table class="w-full">
            <thead class="border-b border-gray-700">
              <tr>
                <th class="text-left py-3 theme-text-secondary text-sm font-medium">Name</th>
                <th class="text-left py-3 theme-text-secondary text-sm font-medium">Email</th>
                <th class="text-left py-3 theme-text-secondary text-sm font-medium">Role</th>
                <th class="text-left py-3 theme-text-secondary text-sm font-medium">Joined</th>
              </tr>
            </thead>
            <tbody>
              <tr 
                v-for="user in statistics.recent_users" 
                :key="user.id"
                class="border-b border-gray-700/50"
              >
                <td class="py-3 theme-text">{{ user.name }}</td>
                <td class="py-3 theme-text-secondary">{{ user.email }}</td>
                <td class="py-3">
                  <span 
                    class="px-2 py-1 rounded text-xs font-medium"
                    :class="user.is_admin ? 'bg-blue-500/20 text-blue-400' : 'bg-gray-500/20 text-gray-400'"
                  >
                    {{ user.is_admin ? 'Admin' : 'User' }}
                  </span>
                </td>
                <td class="py-3 theme-text-secondary">{{ formatDate(user.created_at) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup>
import { onMounted } from 'vue';
import AdminLayout from '@/layouts/AdminLayout.vue';
import { useAdminStatistics } from '@/composables/useAdminStatistics';

const { statistics, loading, fetchStatistics } = useAdminStatistics();

onMounted(() => {
  fetchStatistics();
});

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};
</script>
