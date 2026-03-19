<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', fn () => Inertia::render('User/LandingPage'));

Route::get('/shops', fn () => Inertia::render('User/Shops'));

Route::get('/shopping-lists', fn () => Inertia::render('User/ShoppingLists'));

Route::get('/contact', fn () => Inertia::render('User/Contact'));

Route::get('/login', fn () => Inertia::render('Auth/Login'))
    ->middleware('guest')
    ->name('login');

Route::get('/register', fn () => Inertia::render('Auth/Register'))
    ->middleware('guest')
    ->name('register');

// Admin routes - protected by admin middleware
Route::middleware(['auth', 'admin'])->prefix('admin')->group(function () {
    Route::get('/', fn () => Inertia::render('Admin/Dashboard'));
    Route::get('/categories', fn () => Inertia::render('Admin/Categories'));
    Route::get('/shops', fn () => Inertia::render('Admin/Shops'));
    Route::get('/shops/{shop}/layout', function ($shop) {
        return Inertia::render('Admin/ShopLayout', ['shopId' => (int) $shop]);
    });
    Route::get('/products', fn () => Inertia::render('Admin/Products'));
    Route::get('/users', fn () => Inertia::render('Admin/Users'));
});

require __DIR__.'/auth.php';
