<template>
    <div class="theme-surface flex items-center justify-center px-4 py-12">
        <div class="max-w-md w-full">
            <div class="theme-background rounded-lg shadow-lg p-8">
                <div class="text-center mb-8">
                    <h1 class="text-3xl font-bold theme-text mb-2">{{ $t('Sign in') }}</h1>
                    <p class="theme-text opacity-70">{{ $t('Welcome back!') }}</p>
                </div>

                <form @submit.prevent="submit">
                    <!-- Email -->
                    <div class="mb-4">
                        <label for="email" class="block theme-text font-medium mb-2">
                            {{ $t('Email Address') }}
                        </label>
                        <input id="email" v-model="form.email" type="email" required autofocus autocomplete="username"
                            class="w-full px-4 py-2 rounded-lg border theme-background theme-text focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                            :class="{ 'border-red-500': form.errors.email }" />
                        <p v-if="form.errors.email" class="mt-1 text-sm text-red-500">
                            {{ form.errors.email }}
                        </p>
                    </div>

                    <!-- Password -->
                    <div class="mb-6">
                        <label for="password" class="block theme-text font-medium mb-2">
                            {{ $t('Password') }}
                        </label>
                        <input id="password" v-model="form.password" type="password" required
                            autocomplete="current-password"
                            class="w-full px-4 py-2 rounded-lg border theme-background theme-text focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                            :class="{ 'border-red-500': form.errors.password }" />
                        <p v-if="form.errors.password" class="mt-1 text-sm text-red-500">
                            {{ form.errors.password }}
                        </p>
                    </div>

                    <!-- Remember Me -->
                    <div class="flex items-center justify-between mb-6">
                        <label class="flex items-center">
                            <input v-model="form.remember" type="checkbox"
                                class="rounded border-gray-300 text-blue-500 focus:ring-blue-500" />
                            <span class="ml-2 text-sm theme-text">{{ $t('Remember Me') }}</span>
                        </label>
                    </div>

                    <!-- Error Messages -->
                    <div v-if="form.errors.email || form.errors.password || errorMessage"
                        class="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                        <p class="text-sm">{{ errorMessage || $t('Invalid email or password.') }}</p>
                    </div>

                    <!-- Submit Button -->
                    <button type="submit" :disabled="form.processing"
                        class="w-full theme-btn-primary px-4 py-3 rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed">
                        <span v-if="!form.processing">{{ $t('Login') }}</span>
                        <span v-else class="flex items-center justify-center">
                            <svg class="animate-spin h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none"
                                viewBox="0 0 24 24">
                                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor"
                                    stroke-width="4"></circle>
                                <path class="opacity-75" fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                                </path>
                            </svg>
                            {{ $t('Logging in...') }}
                        </span>
                    </button>

                    <!-- Register Link -->
                    <div class="mt-6 text-center">
                        <p class="theme-text opacity-70">
                            {{ $t("Don't have an account yet?") }}
                            <Link href="/register" class="text-blue-500 hover:text-blue-600 font-semibold transition">
                                {{ $t('Register') }}
                            </Link>
                        </p>
                    </div>
                </form>
                </div>
            </div>
        </div>
</template>

<script setup>
import { reactive, ref } from 'vue';
import { router, Link } from '@inertiajs/vue3';
import { trans } from 'laravel-vue-i18n';

const form = reactive({
    email: '',
    password: '',
    remember: false,
    processing: false,
    errors: {}
});

const errorMessage = ref('');

const submit = () => {
    form.processing = true;
    form.errors = {};
    errorMessage.value = '';

    router.post('/login', {
        email: form.email,
        password: form.password,
        remember: form.remember
    }, {
        preserveScroll: true,
        onSuccess: () => {
            form.processing = false;
            // Redirect handled by backend
        },
        onError: (errors) => {
            form.processing = false;
            form.errors = errors;
            if (errors.email || errors.password) {
                errorMessage.value = trans('Invalid email or password.');
            }
        },
        onFinish: () => {
            form.processing = false;
        }
    });
};
</script>
