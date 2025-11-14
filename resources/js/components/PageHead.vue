<template>
  <Head>
    <title>{{ title }}</title>
  </Head>
</template>

<script setup>
import { Head } from '@inertiajs/vue3';

defineProps({
  title: {
    type: String,
    required: true
  }
});
</script>
