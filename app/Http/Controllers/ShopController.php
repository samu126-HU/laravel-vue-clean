<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreShopRequest;
use App\Http\Requests\UpdateShopRequest;
use App\Models\Shop;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ShopController extends Controller
{
    /**
     * Get all shops
     */
    public function index(): JsonResponse
    {
        $shops = Shop::all();
        
        return response()->json($shops);
    }

    /**
     * Get the latest shop map
     */
    public function getLatest(): JsonResponse
    {
        $shop = Shop::latest()->first();
        
        if (!$shop) {
            return response()->json([
                'shop' => null,
                'map' => null
            ]);
        }

        return response()->json([
            'shop' => [
                'id' => $shop->id,
                'name' => $shop->name,
                'description' => $shop->description,
                'address' => $shop->address,
            ],
            'map' => $shop->map_data
        ]);
    }

    /**
     * Store a new shop map
     */
    public function store(StoreShopRequest $request): JsonResponse
    {
        $shop = Shop::create($request->validated());

        \Illuminate\Support\Facades\Log::info('Shop created', [
            'shop_id' => $shop->id,
            'shop_name' => $shop->name,
            'user_id' => auth()->id() ?? 'guest'
        ]);

        return response()->json([
            'success' => true,
            'shop' => $shop,
            'message' => 'Shop saved successfully'
        ], 201);
    }

    /**
     * Get a specific shop
     */
    public function show(Shop $shop): JsonResponse
    {
        return response()->json([
            'id' => $shop->id,
            'name' => $shop->name,
            'description' => $shop->description,
            'address' => $shop->address,
            'map_data' => $shop->map_data,
            'aisle_names' => $shop->aisle_names,
            'aisle_categories' => $shop->aisle_categories,
            'shelf_access_points' => $shop->shelf_access_points,
        ]);
    }

    /**
     * Update a shop
     */
    public function update(UpdateShopRequest $request, Shop $shop): JsonResponse
    {
        $shop->update($request->validated());

        \Illuminate\Support\Facades\Log::info('Shop updated', [
            'shop_id' => $shop->id,
            'shop_name' => $shop->name,
            'user_id' => auth()->id() ?? 'guest'
        ]);

        return response()->json([
            'success' => true,
            'shop' => $shop,
            'message' => 'Shop updated successfully'
        ]);
    }

    /**
     * Toggle favorite shop for authenticated user
     */
    public function toggleFavorite(Request $request, Shop $shop): JsonResponse
    {
        $user = $request->user();
        
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 401);
        }

        $favoriteShops = $user->favorite_shops ?? [];
        
        if (in_array($shop->id, $favoriteShops)) {
            // Remove from favorites
            $favoriteShops = array_values(array_filter($favoriteShops, fn($id) => $id !== $shop->id));
            $isFavorite = false;
        } else {
            // Add to favorites
            $favoriteShops[] = $shop->id;
            $isFavorite = true;
        }
        
        $user->favorite_shops = $favoriteShops;
        $user->save();

        return response()->json([
            'success' => true,
            'is_favorite' => $isFavorite,
            'favorite_shops' => $favoriteShops
        ]);
    }
}
