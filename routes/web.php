<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', fn () => Inertia::render('User/LandingPage'));

Route::get('/shops', fn () => Inertia::render('User/Shops'));

Route::get('/shopping-lists', fn () => Inertia::render('User/ShoppingLists'));

Route::get('/login', fn () => Inertia::render('Auth/Login'))
    ->middleware('guest')
    ->name('login');

Route::get('/register', fn () => Inertia::render('Auth/Register'))
    ->middleware('guest')
    ->name('register');

require __DIR__.'/auth.php';
