<template>
  <div class="theme-background min-h-screen flex">
    <!-- Sidebar -->
    <aside class="theme-surface w-64 flex-shrink-0 border-r border-gray-700">
      <div class="p-6">
        <h1 class="text-2xl font-bold theme-text mb-8">Admin Panel</h1>
        <nav class="space-y-2">
          <Link
            :href="route('admin.dashboard')"
            class="nav-link flex items-center gap-3 px-4 py-3 rounded-lg transition-colors"
            :class="{ 'active': $page.url === '/admin' || $page.url === '/admin/' }"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <span>Dashboard</span>
          </Link>

          <Link
            :href="route('admin.categories')"
            class="nav-link flex items-center gap-3 px-4 py-3 rounded-lg transition-colors"
            :class="{ 'active': $page.url.startsWith('/admin/categories') }"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            <span>Categories</span>
          </Link>

          <Link
            :href="route('admin.shops')"
            class="nav-link flex items-center gap-3 px-4 py-3 rounded-lg transition-colors"
            :class="{ 'active': $page.url.startsWith('/admin/shops') }"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <span>Shops</span>
          </Link>

          <Link
            :href="route('admin.products')"
            class="nav-link flex items-center gap-3 px-4 py-3 rounded-lg transition-colors"
            :class="{ 'active': $page.url.startsWith('/admin/products') }"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <span>Products</span>
          </Link>

          <Link
            :href="route('admin.users')"
            class="nav-link flex items-center gap-3 px-4 py-3 rounded-lg transition-colors"
            :class="{ 'active': $page.url.startsWith('/admin/users') }"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <span>Users & Roles</span>
          </Link>

          <div class="pt-6 mt-6 border-t border-gray-700">
            <Link
              href="/"
              class="nav-link flex items-center gap-3 px-4 py-3 rounded-lg transition-colors"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span>Back to Site</span>
            </Link>
          </div>
        </nav>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="flex-1 overflow-auto">
      <div class="max-w-7xl mx-auto p-8">
        <slot />
      </div>
    </main>
  </div>
</template>

<script setup>
import { Link } from '@inertiajs/vue3';

const route = (name) => {
  const routes = {
    'admin.dashboard': '/admin',
    'admin.categories': '/admin/categories',
    'admin.shops': '/admin/shops',
    'admin.products': '/admin/products',
    'admin.users': '/admin/users'
  };
  return routes[name] || '/admin';
};
</script>

<style scoped>
.nav-link {
  color: var(--theme-text-secondary);
}

.nav-link:hover {
  background-color: rgba(255, 255, 255, 0.05);
  color: var(--theme-text);
}

.nav-link.active {
  background-color: var(--theme-btn-primary);
  color: white;
}
</style>
