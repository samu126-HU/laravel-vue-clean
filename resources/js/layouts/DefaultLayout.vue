<script setup>
import { Link, usePage, router } from '@inertiajs/vue3';
import { computed } from 'vue';
import ThemeToggle from '../components/ThemeToggle.vue';
import LanguageSwitcher from '../components/LanguageSwitcher.vue';

const page = usePage();
const user = computed(() => page.props.auth?.user);

const closeMenu = (menuId, buttonId) => {
    const menu = document.getElementById(menuId);
    const button = document.getElementById(buttonId);

    menu?.classList.add('hidden');
    button?.setAttribute('aria-expanded', 'false');
};

const closeAllMenus = () => {
    closeMenu('mobile-nav-menu-1', 'mobile-nav-btn-1');
    closeMenu('mobile-nav-menu-2', 'mobile-nav-btn-2');
    closeMenu('desktop-profile-menu', 'desktop-profile-btn');
};

const logout = () => {
    closeAllMenus();
    router.post('/logout');
};
</script>

<template>
    <div class="w-full h-screen flex flex-col theme-surface theme-text">
        <!-- Header/Navigation -->
        <header class="theme-background p-4 shadow-background-bottom">
            <nav class="flex justify-between items-center">
                <Link href="/" class="text-2xl font-bold">
                    FindMyAisle
                </Link>

                <div class="flex items-center space-x-2">
                    <div class="md:hidden flex space-x-2">
                        <!-- Menu -->
                        <div class="relative">
                            <button id="mobile-nav-btn-1" aria-expanded="false" aria-controls="mobile-nav-menu-1"
                                class="p-2 rounded-lg theme-surface flex items-center focus:outline-none hover:opacity-80 transition-opacity"
                                onclick="(function(btn){ const menu = document.getElementById('mobile-nav-menu-1'); const otherMenu = document.getElementById('mobile-nav-menu-2'); const expanded = btn.getAttribute('aria-expanded') === 'true'; btn.setAttribute('aria-expanded', expanded ? 'false' : 'true'); menu.classList.toggle('hidden'); if (!expanded) { otherMenu?.classList.add('hidden'); document.getElementById('mobile-nav-btn-2')?.setAttribute('aria-expanded', 'false'); } })(this)"
                                aria-label="Open navigation">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            </button>

                            <div id="mobile-nav-menu-1" @click="closeAllMenus"
                                class="hidden absolute right-0 top-full mt-2 w-44 theme-background theme-text rounded-lg shadow-lg z-50 ring-1 ring-gray-700 ring-opacity-5 text-lg"
                                role="menu" aria-labelledby="mobile-nav-btn-1">
                                <ul>
                                    <li>
                                        <Link href="/" class="block px-4 py-2 hover:opacity-80">{{ $t('Home') }}</Link>
                                    </li>
                                    <li>
                                        <Link href="/shops" class="block px-4 py-2 hover:opacity-80">{{ $t('Shops') }}
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href="/shopping-lists" class="block px-4 py-2 hover:opacity-80">{{
                                            $t('Shopping Lists') }}</Link>
                                    </li>
                                    <li>
                                        <Link href="/contact" class="block px-4 py-2 hover:opacity-80">{{ $t('Contact')
                                        }}</Link>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        <!-- Login -->
                        <div class="relative">
                            <button id="mobile-nav-btn-2" aria-expanded="false" aria-controls="mobile-nav-menu-2"
                                class="p-2 rounded-lg theme-surface flex items-center focus:outline-none hover:opacity-80 transition-opacity"
                                onclick="(function(btn){ const menu = document.getElementById('mobile-nav-menu-2'); const otherMenu = document.getElementById('mobile-nav-menu-1'); const expanded = btn.getAttribute('aria-expanded') === 'true'; btn.setAttribute('aria-expanded', expanded ? 'false' : 'true'); menu.classList.toggle('hidden'); if (!expanded) { otherMenu?.classList.add('hidden'); document.getElementById('mobile-nav-btn-1')?.setAttribute('aria-expanded', 'false'); } })(this)"
                                aria-label="Open navigation">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </button>

                            <div id="mobile-nav-menu-2" @click="closeAllMenus"
                                class="hidden absolute right-0 top-full mt-2 w-44 theme-background theme-text rounded-lg shadow-lg z-50 ring-1 ring-gray-700 ring-opacity-5 text-lg"
                                role="menu" aria-labelledby="mobile-nav-btn-2">
                                <ul>
                                    <li v-if="!user">
                                        <Link href="/login" class="block px-4 py-2">{{ $t('Login') }}
                                        </Link>
                                    </li>
                                    <li v-if="!user">
                                        <Link href="/register" class="block px-4 py-2">{{
                                            $t('Register') }}</Link>
                                    </li>
                                    <li v-if="user" class="border-b border-gray-700">
                                        <span class="block px-4 py-2">{{ user.name }}</span>
                                    </li>
                                    <Link v-if="user && user.is_admin" href="/admin"
                                        onclick="document.getElementById('desktop-profile-menu')?.classList.add('hidden'); document.getElementById('desktop-profile-btn')?.setAttribute('aria-expanded', 'false')"
                                        class="h-full flex items-center gap-3 px-2 py-2 text-blue-400 hover:bg-blue-500 hover:bg-opacity-10 transition-colors">
                                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        <span>{{ $t('Admin Panel') }}</span>
                                    </Link>
                                    <li class="px-2 py-2">
                                        <ThemeToggle variant="menu" />
                                    </li>
                                    <li class="px-2 py-2 border-b border-gray-700">
                                        <LanguageSwitcher />
                                    </li>
                                    <li v-if="user">
                                        <button @click="logout" class="w-full text-left block px-4 py-2 ">{{
                                            $t('Logout')
                                        }}
                                        </button>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                    <ul class="hidden md:flex items-center space-x-4">
                        <li>
                            <Link href="/" class="px-3 py-2 rounded hover:underline transition-all">{{ $t('Home') }}
                            </Link>
                        </li>
                        <li>
                            <Link href="/shops" class="px-3 py-2 rounded hover:underline transition-all">{{ $t('Shops')
                            }}</Link>
                        </li>
                        <li>
                            <Link href="/shopping-lists" class="px-3 py-2 rounded hover:underline transition-all">
                                {{ $t('My Shopping Lists') }}</Link>
                        </li>
                        <li>
                            <Link href="/contact" class="px-3 py-2 rounded hover:underline transition-all">{{
                                $t('Contact') }}</Link>
                        </li>
                        <li class="relative">
                            <button id="desktop-profile-btn" aria-expanded="false" aria-controls="desktop-profile-menu"
                                class="p-2 rounded-lg theme-surface flex items-center focus:outline-none hover:opacity-80 transition-opacity"
                                onclick="(function(btn){ const menu = document.getElementById('desktop-profile-menu'); const expanded = btn.getAttribute('aria-expanded') === 'true'; btn.setAttribute('aria-expanded', expanded ? 'false' : 'true'); menu.classList.toggle('hidden'); })(this)"
                                :aria-label="user ? user.name : $t('Account')">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </button>

                            <div id="desktop-profile-menu" @click="closeAllMenus"
                                class="hidden absolute right-0 top-full w-56 theme-background theme-text rounded-lg shadow-xl z-50 border border-gray-700 border-opacity-10 overflow-hidden"
                                role="menu" aria-labelledby="desktop-profile-btn">
                                <div class="">
                                    <!-- User Info Section -->
                                    <div v-if="user" class="px-4 py-2 border-b border-opacity-10 border-gray-700">
                                        <p class="text-sm font-semibold truncate">{{ user.name }}</p>
                                        <p v-if="user.email" class="text-xs opacity-60 truncate mt-0.5">{{ user.email }}
                                        </p>
                                    </div>

                                    <!-- Guest Actions -->
                                    <template v-if="!user">
                                        <Link href="/login"
                                            class="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-400 dark:hover:bg-gray-700 hover:bg-opacity-5 transition-colors">
                                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                    d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                                            </svg>
                                            <span>{{ $t('Login') }}</span>
                                        </Link>
                                        <Link href="/register"
                                            class="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-400 dark:hover:bg-gray-700 hover:bg-opacity-5 transition-colors">
                                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                    d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                                            </svg>
                                            <span>{{ $t('Register') }}</span>
                                        </Link>
                                    </template>

                                    <!-- Admin Panel -->
                                    <Link v-if="user && user.is_admin" href="/admin"
                                        onclick="document.getElementById('desktop-profile-menu')?.classList.add('hidden'); document.getElementById('desktop-profile-btn')?.setAttribute('aria-expanded', 'false')"
                                        class="h-full flex items-center gap-3 px-4 py-2.5 text-blue-400 hover:bg-blue-500 hover:bg-opacity-10 transition-colors">
                                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        <span>{{ $t('Admin Panel') }}</span>
                                    </Link>

                                    <!-- Settings Section -->
                                    <div class="border-t border-opacity-10 border-gray-700"></div>

                                    <div
                                        class="px-4 py-2.5 flex items-center justify-between hover:bg-gray-400 dark:hover:bg-gray-700 hover:bg-opacity-5 transition-colors">

                                        <LanguageSwitcher />
                                    </div>

                                    <div
                                        class="px-4 py-2.5 hover:bg-gray-400 dark:hover:bg-gray-700 hover:bg-opacity-5 transition-colors">
                                        <ThemeToggle variant="menu" />
                                    </div>

                                    <!-- Logout -->
                                    <template v-if="user">
                                        <div class="border-t border-opacity-10 border-gray-700"></div>
                                        <button @click="logout"
                                            class="w-full flex items-center gap-3 px-4 py-2.5 text-red-400 hover:bg-red-500 hover:bg-opacity-10 transition-colors">
                                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                            </svg>
                                            <span>{{ $t('Logout') }}</span>
                                        </button>
                                    </template>
                                </div>
                            </div>
                        </li>
                    </ul>
                </div>
            </nav>
        </header>

        <hr class="text-gray-500">

        <!-- Main Content Area -->
        <main class="flex-1 overflow-auto theme-background">
            <slot />
        </main>

        <!-- Footer -->
        <footer>
            <div class="text-center p-4 theme-background theme-text shadow-background-top">
                <p>
                    &copy; {{ new Date().getFullYear() }} FindMyAisle. All rights reserved.
                </p>
            </div>
        </footer>
    </div>
</template>
