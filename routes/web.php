<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', fn () => Inertia::render('User/LandingPage'));

Route::get('/shops', fn () => Inertia::render('User/Shops'));

Route::get('/shopping-lists', fn () => Inertia::render('User/ShoppingLists'));

require __DIR__.'/auth.php';
