<script setup>
import { Link, usePage, router } from '@inertiajs/vue3';
import { computed } from 'vue';
import ThemeToggle from '../components/ThemeToggle.vue';

const page = usePage();
const user = computed(() => page.props.auth?.user);

const logout = () => {
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

                            <div id="mobile-nav-menu-1"
                                class="hidden absolute right-0 top-full mt-2 w-44 theme-background theme-text rounded-lg shadow-lg z-50 ring-1 ring-black ring-opacity-5"
                                role="menu" aria-labelledby="mobile-nav-btn-1">
                                <ul class="py-1">
                                    <li>
                                        <Link href="/" class="block px-4 py-2 hover:opacity-80">Home</Link>
                                    </li>
                                    <li>
                                        <Link href="/shops" class="block px-4 py-2 hover:opacity-80">Shops</Link>
                                    </li>
                                    <li>
                                        <Link href="/shopping-lists" class="block px-4 py-2 hover:opacity-80">Shopping
                                            Lists</Link>
                                    </li>
                                    <li>
                                        <Link href="/contact" class="block px-4 py-2 hover:opacity-80">Contact</Link>
                                    </li>
                                    <li v-if="user && user.is_admin" class="border-t border-opacity-20 border-current">
                                        <Link href="/admin" class="block px-4 py-2 text-blue-400 hover:opacity-80">Admin
                                            Panel</Link>
                                    </li>
                                    <li class="border-t border-opacity-20 border-current">
                                        <ThemeToggle variant="menu" />
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

                            <div id="mobile-nav-menu-2"
                                class="hidden absolute right-0 top-full mt-2 w-44 theme-background theme-text rounded-lg shadow-lg z-50 ring-1 ring-black ring-opacity-5"
                                role="menu" aria-labelledby="mobile-nav-btn-2">
                                <ul class="py-1">
                                    <li v-if="!user">
                                        <Link href="/login" class="block px-4 py-2 hover:opacity-80">Bejelentkezés
                                        </Link>
                                    </li>
                                    <li v-if="!user">
                                        <Link href="/register" class="block px-4 py-2 hover:opacity-80">Regisztráció
                                        </Link>
                                    </li>
                                    <li v-if="user" class="border-t border-opacity-20 border-current">
                                        <span class="block px-4 py-2 opacity-70">{{ user.name }}</span>
                                    </li>
                                    <li v-if="user">
                                        <button @click="logout"
                                            class="w-full text-left block px-4 py-2 hover:opacity-80">Kilépés</button>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                    <ul class="hidden md:flex items-center space-x-4">
                        <li>
                            <Link href="/" class="px-3 py-2 rounded hover:underline transition-all">Kezdőlap</Link>
                        </li>
                        <li>
                            <Link href="/shops" class="px-3 py-2 rounded hover:underline transition-all">Boltok</Link>
                        </li>
                        <li>
                            <Link href="/shopping-lists" class="px-3 py-2 rounded hover:underline transition-all">
                                Bevásárlólistáim</Link>
                        </li>
                        <li>
                            <Link href="/contact" class="px-3 py-2 rounded hover:underline transition-all">Kapcsolat
                            </Link>
                        </li>
                        <li v-if="user && user.is_admin">
                            <Link href="/admin"
                                class="px-3 py-2 rounded bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-all">
                                Admin Panel</Link>
                        </li>
                        <li>
                            <ThemeToggle variant="icon" />
                        </li>
                        <li v-if="!user">
                            <Link href="/login" class="px-3 py-2 rounded hover:underline transition-all">Bejelentkezés
                            </Link>
                        </li>
                        <li v-if="!user">
                            <Link href="/register" class="theme-btn-primary px-4 py-2 rounded-lg transition-all">
                                Regisztráció</Link>
                        </li>
                        <li v-if="user" class="flex items-center gap-2">
                            <span class="theme-text opacity-70">{{ user.name }}</span>
                            <button @click="logout"
                                class="px-4 py-2 rounded-lg border border-current hover:opacity-70 transition-all">Kilépés</button>
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
