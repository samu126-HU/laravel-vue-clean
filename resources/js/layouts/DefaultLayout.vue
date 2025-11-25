<script setup>
import { Link } from '@inertiajs/vue3';
import ThemeToggle from '../components/ThemeToggle.vue';
</script>

<template>
    <div class="w-full h-screen flex flex-col theme-surface theme-text">
        <!-- Header/Navigation -->
        <header class="theme-background p-4 shadow-background-bottom">
            <nav class="flex justify-between items-center">
                <Link href="/" class="text-xl font-bold">
                FindMyAisle
                </Link>

                <div class="flex items-center space-x-2">
                    <div class="md:hidden relative">
                        <button id="mobile-nav-btn" aria-expanded="false" aria-controls="mobile-nav-menu"
                            class="p-2 rounded-lg theme-surface flex items-center focus:outline-none hover:opacity-80 transition-opacity"
                            onclick="(function(btn){ const menu = document.getElementById('mobile-nav-menu'); const expanded = btn.getAttribute('aria-expanded') === 'true'; btn.setAttribute('aria-expanded', expanded ? 'false' : 'true'); menu.classList.toggle('hidden'); })(this)"
                            aria-label="Open navigation">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>

                        <div id="mobile-nav-menu"
                            class="hidden absolute right-0 mt-2 w-44 theme-background theme-text rounded-lg shadow-lg z-50 ring-1 ring-black ring-opacity-5"
                            role="menu" aria-labelledby="mobile-nav-btn">
                            <ul class="py-1">
                                <li>
                                    <Link href="/" class="block px-4 py-2 hover:opacity-80">Home</Link>
                                </li>
                                <li>
                                    <Link href="/products" class="block px-4 py-2 hover:opacity-80">Products</Link>
                                </li>
                                <li>
                                    <Link href="/about" class="block px-4 py-2 hover:opacity-80">About</Link>
                                </li>
                                <li>
                                    <Link href="/contact" class="block px-4 py-2 hover:opacity-80">Contact</Link>
                                </li>
                                <li class="border-t border-opacity-20 border-current">
                                    <ThemeToggle variant="menu" />
                                </li>
                            </ul>
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
                            <Link href="/shopping-lists" class="px-3 py-2 rounded hover:underline transition-all">Bevásárlólistáim</Link>
                        </li>
                        <li>
                            <Link href="/contact" class="px-3 py-2 rounded hover:underline transition-all">Kapcsolat</Link>
                        </li>
                        <li>
                            <ThemeToggle variant="icon" />
                        </li>
                    </ul>
                </div>

            </nav>
        </header>

        <!-- Main Content Area -->
        <main class="flex-1 overflow-auto">
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
