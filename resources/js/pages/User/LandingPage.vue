<script setup>
import { ref, onMounted, computed } from 'vue';
import { usePage, Link } from '@inertiajs/vue3';
import PageHead from '../../components/PageHead.vue';
import axios from 'axios';

const page = usePage();
const isAdmin = computed(() => {
  const user = page.props.auth?.user;
  return user?.is_admin === true || user?.is_admin === 1 || user?.is_admin === '1';
});

const stats = ref({
  totalShops: 0,
  userShoppingLists: 0,
  userCheckedItems: 0
});

const displayStats = ref({
  totalShops: 0,
  userShoppingLists: 0,
  userCheckedItems: 0
});

const loading = ref(true);

// Easing function for smooth animation (easeOutCubic)
const easeOutCubic = (t) => {
  return 1 - Math.pow(1 - t, 3);
};

const animateValue = (key, start, end, duration) => {
  if (start === end) {
    displayStats.value[key] = end;
    return;
  }
  
  const startTime = performance.now();
  
  const animate = (currentTime) => {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    
    // Apply easing function
    const easedProgress = easeOutCubic(progress);
    
    const current = start + (end - start) * easedProgress;
    displayStats.value[key] = Math.round(current);
    
    if (progress < 1) {
      requestAnimationFrame(animate);
    }
  };
  
  requestAnimationFrame(animate);
};

onMounted(async () => {
  try {
    const response = await axios.get('/api/v1/stats');
    stats.value = response.data;
    loading.value = false;
    
    // Animate the stats with staggered delay for visual interest
    setTimeout(() => {
      animateValue('totalShops', 0, stats.value.totalShops, 2000);
    }, 200);
    setTimeout(() => {
      animateValue('userShoppingLists', 0, stats.value.userShoppingLists, 2000);
    }, 400);
    setTimeout(() => {
      animateValue('userCheckedItems', 0, stats.value.userCheckedItems, 2000);
    }, 600);
  } catch (error) {
    console.error('Error loading stats:', error);
    loading.value = false;
    // Show stats as 0 if there's an error
    displayStats.value = {
      totalShops: 0,
      userShoppingLists: 0,
      userCheckedItems: 0
    };
  }
});
</script>

<template>
  <PageHead title="Welcome" />

  <div class="min-h-screen theme-background theme-text">
    <div class="max-w-6xl mx-auto px-4 py-12">
      <!-- Hero Section -->
      <div class="text-center mb-16">
        <h1 class="text-5xl font-bold mb-4 bg-linear-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">
          Welcome to FindMyAisle
        </h1>
        <p class="text-xl opacity-80 max-w-2xl mx-auto">
          Navigate stores with ease, create smart shopping lists, and never lose track of products again.
          Your intelligent shopping companion.
        </p>
      </div>

      <!-- Quick Actions -->
      <div class="grid md:grid-cols-3 gap-6 mb-16">
        <Link href="/shops"
          class="theme-surface rounded-xl p-6 hover:scale-105 active:scale-95 transition-transform cursor-pointer shadow-lg active:shadow-xl">
          <div class="flex items-center mb-4">
            <div class="w-12 h-12 bg-blue-500 bg-opacity-20 rounded-lg flex items-center justify-center mr-4">
              <svg class="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h3 class="text-xl font-semibold">Browse Shops</h3>
          </div>
          <p class="opacity-75">Explore available stores and their layouts</p>
        </Link>

        <Link href="/shopping-lists"
          class="theme-surface rounded-xl p-6 hover:scale-105 active:scale-95 transition-transform cursor-pointer shadow-lg active:shadow-xl">
          <div class="flex items-center mb-4">
            <div class="w-12 h-12 bg-green-500 bg-opacity-20 rounded-lg flex items-center justify-center mr-4">
              <svg class="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <h3 class="text-xl font-semibold">Shopping Lists</h3>
          </div>
          <p class="opacity-75">Create and manage your shopping lists</p>
        </Link>

        <Link href="/shops?fav=1"
          class="theme-surface rounded-xl p-6 hover:scale-105 active:scale-95 transition-transform cursor-pointer shadow-lg active:shadow-xl">
          <div class="flex items-center mb-4">
            <div class="w-12 h-12 bg-purple-500 bg-opacity-20 rounded-lg flex items-center justify-center mr-4">
              <svg class="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h3 class="text-xl font-semibold">Favourites</h3>
          </div>
          <p class="opacity-75">Quick access to your favourite shops</p>
        </Link>
      </div>

      <!-- Stats Section -->
      <div class="theme-surface rounded-xl p-8 shadow-lg">
        <h2 class="text-2xl font-bold mb-6 text-center">Your Statistics</h2>

        <div v-if="loading" class="text-center py-8">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-current"></div>
        </div>

        <div v-else class="grid md:grid-cols-3 gap-8">
          <div class="text-center transform transition-all duration-500 hover:scale-105">
            <div class="text-5xl font-bold text-blue-500 mb-2 tabular-nums">{{ displayStats.totalShops }}</div>
            <div class="text-sm opacity-75 uppercase tracking-wide font-semibold">Available Shops</div>
          </div>
          <div class="text-center transform transition-all duration-500 hover:scale-105">
            <div class="text-5xl font-bold text-green-500 mb-2 tabular-nums">{{ displayStats.userShoppingLists }}</div>
            <div class="text-sm opacity-75 uppercase tracking-wide font-semibold">Shopping Lists Created</div>
          </div>
          <div class="text-center transform transition-all duration-500 hover:scale-105">
            <div class="text-5xl font-bold text-purple-500 mb-2 tabular-nums">{{ displayStats.userCheckedItems }}</div>
            <div class="text-sm opacity-75 uppercase tracking-wide font-semibold">Items Checked Off</div>
          </div>
        </div>
      </div>

      <!-- Features Section -->
      <div class="mt-16 grid md:grid-cols-2 gap-8">
        <div class="theme-surface rounded-xl p-6 shadow-lg">
          <h3 class="text-xl font-semibold mb-3 flex items-center">
            <svg class="w-6 h-6 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
            Interactive Store Maps
          </h3>
          <p class="opacity-75">View detailed store layouts with aisle organization and product locations</p>
        </div>

        <div class="theme-surface rounded-xl p-6 shadow-lg">
          <h3 class="text-xl font-semibold mb-3 flex items-center">
            <svg class="w-6 h-6 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Smart Organization
          </h3>
          <p class="opacity-75">Automatically organize items by aisle and category for efficient shopping</p>
        </div>

        <div class="theme-surface rounded-xl p-6 shadow-lg">
          <h3 class="text-xl font-semibold mb-3 flex items-center">
            <svg class="w-6 h-6 mr-2 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Quick Search
          </h3>
          <p class="opacity-75">Find products instantly and see their exact location in the store</p>
        </div>

        <div class="theme-surface rounded-xl p-6 shadow-lg">
          <h3 class="text-xl font-semibold mb-3 flex items-center">
            <svg class="w-6 h-6 mr-2 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Save Time
          </h3>
          <p class="opacity-75">Spend less time wandering and more time on what matters</p>
        </div>
      </div>

      <!-- Admin Section -->
      <div v-if="isAdmin" class="mt-12 theme-surface rounded-xl p-6 shadow-lg border-l-4 border-blue-500">
        <h3 class="text-xl font-semibold mb-3">Admin Quick Access</h3>
        <div class="flex flex-wrap gap-4">
          <Link href="/admin"
            class="px-4 py-2 bg-blue-500 hover:bg-blue-600 active:bg-blue-700 rounded-lg transition-colors active:scale-95 transform">
            Admin Panel
          </Link>
          <Link href="/admin/shops"
            class="px-4 py-2 bg-purple-500 hover:bg-purple-600 active:bg-purple-700 rounded-lg transition-colors active:scale-95 transform">
            Manage Shops
          </Link>
          <Link href="/admin/products"
            class="px-4 py-2 bg-green-500 hover:bg-green-600 active:bg-green-700 rounded-lg transition-colors active:scale-95 transform">
            Manage Products
          </Link>
        </div>
      </div>
    </div>
  </div>
</template>