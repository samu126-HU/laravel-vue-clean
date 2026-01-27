<?php

use App\Http\Controllers\ShopController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\ShoppingListController;
use App\Http\Controllers\Admin\AdminDashboardController;
use App\Http\Controllers\Admin\AdminCategoryController;
use App\Http\Controllers\Admin\AdminShopController;
use App\Http\Controllers\Admin\AdminProductController;
use App\Http\Controllers\Admin\AdminUserController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use App\Models\User;

// API v1 routes
Route::prefix('v1')->group(function () {
    
    // API Authentication routes (for Flutter/mobile apps)
    Route::post('/auth/register', function (Request $request) {
        $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'lowercase', 'email', 'max:255', 'unique:users'],
            'password' => ['required', 'confirmed', 'min:8'],
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);

        $token = $user->createToken('mobile')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user' => $user,
        ], 201);
    });

    Route::post('/auth/login', function (Request $request) {
        $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required'],
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        $token = $user->createToken('mobile')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user' => $user,
        ]);
    });

    Route::middleware(['auth:sanctum'])->post('/auth/logout', function (Request $request) {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Logged out successfully',
        ]);
    });

    Route::middleware(['auth:sanctum'])->get('/user', function (Request $request) {
        return $request->user();
    });

    // Public read-only routes
    Route::get('/shops', [ShopController::class, 'index']);
    Route::get('/shops/latest', [ShopController::class, 'getLatest']);
    Route::get('/shops/{shop}', [ShopController::class, 'show']);
    Route::get('/categories', [CategoryController::class, 'index']);
    Route::get('/products', [ProductController::class, 'index']);
    
    // User statistics
    Route::get('/stats', [ShopController::class, 'stats']);

    // User favorite shops
    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/shops/{shop}/favorite', [ShopController::class, 'toggleFavorite']);
    });

    // Protected shop/category mutation routes (admin only) with rate limiting
    Route::middleware(['auth:sanctum', 'admin', 'throttle:60,1'])->group(function () {
        Route::post('/shops', [ShopController::class, 'store']);
        Route::put('/shops/{shop}', [ShopController::class, 'update']);
        Route::post('/categories', [CategoryController::class, 'store']);
        Route::put('/categories/{category}', [CategoryController::class, 'update']);
        Route::delete('/categories/{category}', [CategoryController::class, 'destroy']);
    });

    // Shopping List routes (requires authentication) with rate limiting
    Route::middleware(['auth:sanctum', 'throttle:60,1'])->group(function () {
        Route::get('/shopping-lists', [ShoppingListController::class, 'index']);
        Route::post('/shopping-lists', [ShoppingListController::class, 'store']);
        Route::get('/shopping-lists/{shoppingList}', [ShoppingListController::class, 'show']);
        Route::put('/shopping-lists/{shoppingList}', [ShoppingListController::class, 'update']);
        Route::delete('/shopping-lists/{shoppingList}', [ShoppingListController::class, 'destroy']);
        
        Route::post('/shopping-lists/{shoppingList}/items', [ShoppingListController::class, 'addItem']);
        Route::put('/shopping-lists/{shoppingList}/items/{item}', [ShoppingListController::class, 'updateItem']);
        Route::delete('/shopping-lists/{shoppingList}/items/{item}', [ShoppingListController::class, 'removeItem']);
        Route::post('/shopping-lists/{shoppingList}/items/complete', [ShoppingListController::class, 'completeItems']);
    });

    // Admin API routes (requires authentication and admin role) with rate limiting
    Route::middleware(['auth:sanctum', 'admin', 'throttle:60,1'])->prefix('admin')->group(function () {
        Route::get('/statistics', [AdminDashboardController::class, 'statistics']);
        
        Route::get('/categories', [AdminCategoryController::class, 'index']);
        Route::post('/categories', [AdminCategoryController::class, 'store']);
        Route::put('/categories/{category}', [AdminCategoryController::class, 'update']);
        Route::delete('/categories/{category}', [AdminCategoryController::class, 'destroy']);
        
        Route::get('/shops', [AdminShopController::class, 'index']);
        Route::post('/shops', [AdminShopController::class, 'store']);
        Route::put('/shops/{shop}', [AdminShopController::class, 'update']);
        Route::delete('/shops/{shop}', [AdminShopController::class, 'destroy']);
        Route::post('/shops/{shop}/upload-dxf', [AdminShopController::class, 'uploadDxf']);
        
        Route::get('/products', [AdminProductController::class, 'index']);
        Route::post('/products', [AdminProductController::class, 'store']);
        Route::put('/products/{product}', [AdminProductController::class, 'update']);
        Route::delete('/products/{product}', [AdminProductController::class, 'destroy']);
        
        Route::get('/users', [AdminUserController::class, 'index']);
        Route::put('/users/{user}/role', [AdminUserController::class, 'updateRole']);
    });

});
