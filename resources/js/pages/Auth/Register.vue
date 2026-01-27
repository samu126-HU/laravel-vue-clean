<template>
    <div class="theme-surface flex items-center justify-center px-4 py-12">
        <div class="max-w-md w-full">
            <div class="theme-background rounded-lg shadow-lg p-8">
                <div class="text-center mb-8">
                    <h1 class="text-3xl font-bold theme-text mb-2">{{ $t('Registration') }}</h1>
                    <p class="theme-text opacity-70">{{ $t('Create your account') }}</p>
                </div>

                <form @submit.prevent="submit">
                    <!-- Name -->
                    <div class="mb-4">
                        <label for="name" class="block theme-text font-medium mb-2">
                            {{ $t('Name') }}
                        </label>
                        <input id="name" v-model="form.name" type="text" required autofocus autocomplete="name"
                            class="w-full px-4 py-2 rounded-lg border theme-background theme-text focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                            :class="{ 'border-red-500': form.errors.name }" />
                        <p v-if="form.errors.name" class="mt-1 text-sm text-red-500">
                            {{ form.errors.name }}
                        </p>
                    </div>

                    <!-- Email -->
                    <div class="mb-4">
                        <label for="email" class="block theme-text font-medium mb-2">
                            {{ $t('Email Address') }}
                        </label>
                        <input id="email" v-model="form.email" type="email" required autocomplete="username"
                            class="w-full px-4 py-2 rounded-lg border theme-background theme-text focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                            :class="{ 'border-red-500': form.errors.email }" />
                        <p v-if="form.errors.email" class="mt-1 text-sm text-red-500">
                            {{ form.errors.email }}
                        </p>
                    </div>

                    <!-- Password -->
                    <div class="mb-4">
                        <label for="password" class="block theme-text font-medium mb-2">
                            {{ $t('Password') }}
                        </label>
                        <input id="password" v-model="form.password" type="password" required
                            autocomplete="new-password"
                            class="w-full px-4 py-2 rounded-lg border theme-background theme-text focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                            :class="{ 'border-red-500': form.errors.password }" />
                        <p v-if="form.errors.password" class="mt-1 text-sm text-red-500">
                            {{ form.errors.password }}
                        </p>
                        <p class="mt-1 text-xs theme-text opacity-60">
                            {{ $t('Minimum 8 characters') }}
                        </p>
                    </div>

                    <!-- Password Confirmation -->
                    <div class="mb-6">
                        <label for="password_confirmation" class="block theme-text font-medium mb-2">
                            {{ $t('Confirm Password') }}
                        </label>
                        <input id="password_confirmation" v-model="form.password_confirmation" type="password" required
                            autocomplete="new-password"
                            class="w-full px-4 py-2 rounded-lg border theme-background theme-text focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                            :class="{ 'border-red-500': form.errors.password_confirmation }" />
                        <p v-if="form.errors.password_confirmation" class="mt-1 text-sm text-red-500">
                            {{ form.errors.password_confirmation }}
                        </p>
                    </div>

                    <!-- Error Messages -->
                    <div v-if="Object.keys(form.errors).length > 0"
                        class="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                        <p class="text-sm font-semibold mb-1">{{ $t('Please correct the following errors:') }}</p>
                        <ul class="text-sm list-disc list-inside">
                            <li v-for="(error, field) in form.errors" :key="field">{{ error }}</li>
                        </ul>
                    </div>

                    <!-- Submit Button -->
                    <button type="submit" :disabled="form.processing"
                        class="w-full theme-btn-primary px-4 py-3 rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed">
                        <span v-if="!form.processing">{{ $t('Register') }}</span>
                        <span v-else class="flex items-center justify-center">
                            <svg class="animate-spin h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none"
                                viewBox="0 0 24 24">
                                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor"
                                    stroke-width="4"></circle>
                                <path class="opacity-75" fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                                </path>
                            </svg>
                            {{ $t('Registering...') }}
                        </span>
                    </button>

                    <!-- Login Link -->
                    <div class="mt-6 text-center">
                        <p class="theme-text opacity-70">
                            {{ $t('Already have an account?') }}
                            <Link href="/login" class="text-blue-500 hover:text-blue-600 font-semibold transition">
                                {{ $t('Login') }}
                            </Link>
                        </p>
                    </div>
                </form>
                </div>
            </div>
        </div>
</template>

<script setup>
import { reactive } from 'vue';
import { router, Link } from '@inertiajs/vue3';

const form = reactive({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    processing: false,
    errors: {}
});

const submit = () => {
    form.processing = true;
    form.errors = {};

    router.post('/register', {
        name: form.name,
        email: form.email,
        password: form.password,
        password_confirmation: form.password_confirmation
    }, {
        preserveScroll: true,
        onSuccess: () => {
            form.processing = false;
            // Redirect handled by backend
        },
        onError: (errors) => {
            form.processing = false;
            form.errors = errors;
        },
        onFinish: () => {
            form.processing = false;
        }
    });
};
</script>
