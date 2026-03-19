<script setup>
import { Link } from '@inertiajs/vue3';
import PageHead from '../../components/PageHead.vue';
</script>

<template>
  <PageHead :title="$t('Contact')" />

  <div class="theme-background theme-text">
    <div class="max-w-6xl mx-auto px-4 py-12">
      <div class="text-center mb-16">
        <h1 class="text-5xl font-bold mb-4 bg-linear-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">
          {{ $t('Get in Touch') }}
        </h1>
        <p class="text-xl opacity-80 max-w-2xl mx-auto">
          {{ $t('Have a question, idea, or partnership request? We are happy to help.') }}
        </p>
      </div>

      <div class="grid md:grid-cols-3 gap-6 mb-16">
        <div class="theme-surface rounded-xl p-6 shadow-lg">
          <div class="flex items-center mb-4">
            <div class="w-12 h-12 bg-blue-500 bg-opacity-20 rounded-lg flex items-center justify-center mr-4">
              <svg class="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <h3 class="text-xl font-semibold">{{ $t('General Support') }}</h3>
          </div>
          <p class="opacity-75">{{ $t('Questions about shops, lists, or navigation features') }}</p>
        </div>

        <div class="theme-surface rounded-xl p-6 shadow-lg">
          <div class="flex items-center mb-4">
            <div class="w-12 h-12 bg-green-500 bg-opacity-20 rounded-lg flex items-center justify-center mr-4">
              <svg class="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M17 8h2a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V10a2 2 0 012-2h2m10 0V6a5 5 0 00-10 0v2m10 0H7" />
              </svg>
            </div>
            <h3 class="text-xl font-semibold">{{ $t('Partnerships') }}</h3>
          </div>
          <p class="opacity-75">{{ $t('Interested in collaborating with FindMyAisle?') }}</p>
        </div>

        <div class="theme-surface rounded-xl p-6 shadow-lg">
          <div class="flex items-center mb-4">
            <div class="w-12 h-12 bg-orange-500 bg-opacity-20 rounded-lg flex items-center justify-center mr-4">
              <svg class="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M11 5h2m-1-1v2m0 12v2m-7-9H3m18 0h-2m-2.828-5.172l-1.414 1.414M8.242 15.758l-1.414 1.414m0-10L8.242 8.586m7.516 7.172l1.414 1.414M12 8a4 4 0 100 8 4 4 0 000-8z" />
              </svg>
            </div>
            <h3 class="text-xl font-semibold">{{ $t('Feedback') }}</h3>
          </div>
          <p class="opacity-75">{{ $t('Help us improve by sharing your ideas') }}</p>
        </div>
      </div>

      <div class="theme-surface rounded-xl p-8 shadow-lg mb-12">
        <h2 class="text-2xl font-bold mb-6 text-center">{{ $t('Contact') }}</h2>

        <div class="grid md:grid-cols-3 gap-6 text-center">
          <a href="mailto:support@findmyaisle.com"
            class="rounded-lg border border-current border-opacity-10 p-4 hover:bg-gray-500 hover:bg-opacity-10 transition-colors">
            <div class="text-sm opacity-70 mb-1">{{ $t('Email Us') }}</div>
            <div class="font-semibold">support@findmyaisle.com</div>
          </a>

          <a href="tel:+3611112222"
            class="rounded-lg border border-current border-opacity-10 p-4 hover:bg-gray-500 hover:bg-opacity-10 transition-colors">
            <div class="text-sm opacity-70 mb-1">{{ $t('Phone') }}</div>
            <div class="font-semibold">+36 1 111 2222</div>
          </a>

          <div class="rounded-lg border border-current border-opacity-10 p-4">
            <div class="text-sm opacity-70 mb-1">{{ $t('Office Hours') }}</div>
            <div class="font-semibold">{{ $t('Mon-Fri, 9:00-17:00') }}</div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>
