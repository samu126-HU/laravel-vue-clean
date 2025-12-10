<?php

use App\Http\Controllers\ShopController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\ShoppingListController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth:sanctum'])->get('/user', function (Request $request) {
    return $request->user();
});

// Shop routes
Route::get('/shops/latest', [ShopController::class, 'getLatest']);
Route::post('/shops', [ShopController::class, 'store']);
Route::get('/shops/{shop}', [ShopController::class, 'show']);
Route::put('/shops/{shop}', [ShopController::class, 'update']);

// Category routes
Route::get('/categories', [CategoryController::class, 'index']);
Route::post('/categories', [CategoryController::class, 'store']);
Route::put('/categories/{category}', [CategoryController::class, 'update']);
Route::delete('/categories/{category}', [CategoryController::class, 'destroy']);

// Product routes
Route::get('/products', [ProductController::class, 'index']);

// Shopping List routes (requires authentication)
Route::middleware(['auth:sanctum'])->group(function () {
    Route::get('/shopping-lists', [ShoppingListController::class, 'index']);
    Route::post('/shopping-lists', [ShoppingListController::class, 'store']);
    Route::get('/shopping-lists/{shoppingList}', [ShoppingListController::class, 'show']);
    Route::put('/shopping-lists/{shoppingList}', [ShoppingListController::class, 'update']);
    Route::delete('/shopping-lists/{shoppingList}', [ShoppingListController::class, 'destroy']);
    
    Route::post('/shopping-lists/{shoppingList}/items', [ShoppingListController::class, 'addItem']);
    Route::put('/shopping-lists/{shoppingList}/items/{item}', [ShoppingListController::class, 'updateItem']);
    Route::delete('/shopping-lists/{shoppingList}/items/{item}', [ShoppingListController::class, 'removeItem']);
});

