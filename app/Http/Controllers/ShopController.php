<?php

namespace App\Http\Controllers;

use App\Models\Shop;
use Illuminate\Http\Request;

class ShopController extends Controller
{
    /**
     * Get the latest shop map
     */
    public function getLatest()
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
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'address' => 'nullable|string',
            'map_data' => 'required|array',
            'aisle_names' => 'nullable|array',
            'aisle_categories' => 'nullable|array',
            'shelf_access_points' => 'nullable|array',
        ]);

        $shop = Shop::create($validated);

        return response()->json([
            'success' => true,
            'shop' => $shop,
            'message' => 'Shop saved successfully'
        ], 201);
    }

    /**
     * Get a specific shop
     */
    public function show(Shop $shop)
    {
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
     * Update a shop
     */
    public function update(Request $request, Shop $shop)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'address' => 'nullable|string',
            'map_data' => 'required|array',
            'aisle_names' => 'nullable|array',
            'aisle_categories' => 'nullable|array',
            'shelf_access_points' => 'nullable|array',
        ]);

        $shop->update($validated);

        return response()->json([
            'success' => true,
            'shop' => $shop,
            'message' => 'Shop updated successfully'
        ]);
    }
}
