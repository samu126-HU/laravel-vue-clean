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

  <div class="theme-background theme-text">
    <div class="max-w-6xl mx-auto px-4 py-12">
      <!-- Hero Section -->
      <div class="text-center mb-16">
        <h1 class="text-5xl font-bold mb-4 bg-linear-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">
          {{ $t('Welcome to FindMyAisle') }}
        </h1>
        <p class="text-xl opacity-80 max-w-2xl mx-auto">
          {{ $t('Navigate stores with ease, create smart shopping lists, and never lose track of products again.') }}
          {{ $t('Your intelligent shopping companion.') }}
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
            <h3 class="text-xl font-semibold">{{ $t('Browse Shops') }}</h3>
          </div>
          <p class="opacity-75">{{ $t('Explore available stores and their layouts') }}</p>
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
            <h3 class="text-xl font-semibold">{{ $t('Shopping Lists') }}</h3>
          </div>
          <p class="opacity-75">{{ $t('Create and manage your shopping lists') }}</p>
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
            <h3 class="text-xl font-semibold">{{ $t('Favourites') }}</h3>
          </div>
          <p class="opacity-75">{{ $t('Quick access to your favourite shops') }}</p>
        </Link>
      </div>

      <!-- Stats Section -->
      <div class="theme-surface rounded-xl p-8 shadow-lg">
        <h2 class="text-2xl font-bold mb-6 text-center">{{ $t('Your Statistics') }}</h2>

        <div v-if="loading" class="text-center py-8">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-current"></div>
        </div>

        <div v-else class="grid md:grid-cols-3 gap-8">
          <div class="text-center transform transition-all duration-500 hover:scale-105">
            <div class="text-5xl font-bold text-blue-500 mb-2 tabular-nums">{{ displayStats.totalShops }}</div>
            <div class="text-sm opacity-75 uppercase tracking-wide font-semibold">{{ $t('Available Shops') }}</div>
          </div>
          <div class="text-center transform transition-all duration-500 hover:scale-105">
            <div class="text-5xl font-bold text-green-500 mb-2 tabular-nums">{{ displayStats.userShoppingLists }}</div>
            <div class="text-sm opacity-75 uppercase tracking-wide font-semibold">{{ $t('Shopping Lists Created') }}</div>
          </div>
          <div class="text-center transform transition-all duration-500 hover:scale-105">
            <div class="text-5xl font-bold text-purple-500 mb-2 tabular-nums">{{ displayStats.userCheckedItems }}</div>
            <div class="text-sm opacity-75 uppercase tracking-wide font-semibold">{{ $t('Items Checked Off') }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>