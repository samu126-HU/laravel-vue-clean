<script setup>
import { ref, onMounted } from 'vue';
import { loadLanguageAsync } from 'laravel-vue-i18n';

const currentLocale = ref('en');

onMounted(() => {
    // Get locale from localStorage or default to 'en'
    const savedLocale = localStorage.getItem('locale') || 'en';
    currentLocale.value = savedLocale;
    loadLanguageAsync(savedLocale);
});

const switchLanguage = async (locale) => {
    currentLocale.value = locale;
    localStorage.setItem('locale', locale);
    await loadLanguageAsync(locale);
};
</script>

<template>
    <button @click="switchLanguage(currentLocale === 'en' ? 'hu' : 'en')"
        class="w-full text-left hover:opacity-80 flex items-center gap-3"
        :title="currentLocale === 'en' ? 'Switch to Hungarian' : 'Switch to English'">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
        </svg>
        <span class="font-medium theme-text uppercase text-sm">{{ currentLocale }}</span>
    </button>
</template>
