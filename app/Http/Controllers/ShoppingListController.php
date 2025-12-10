<?php

namespace App\Http\Controllers;

use App\Models\ShoppingList;
use App\Models\ShoppingListItem;
use Illuminate\Http\Request;

class ShoppingListController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $lists = $request->user()->shoppingLists()->with('items.product.category')->get();
        return response()->json($lists);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
        ]);

        $list = $request->user()->shoppingLists()->create($validated);
        return response()->json($list, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Request $request, ShoppingList $shoppingList)
    {
        // Ensure user owns this list
        if ($shoppingList->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $shoppingList->load('items.product.category');
        return response()->json($shoppingList);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, ShoppingList $shoppingList)
    {
        // Ensure user owns this list
        if ($shoppingList->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
        ]);

        $shoppingList->update($validated);
        return response()->json($shoppingList);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, ShoppingList $shoppingList)
    {
        // Ensure user owns this list
        if ($shoppingList->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $shoppingList->delete();
        return response()->json(['message' => 'Shopping list deleted successfully']);
    }

    /**
     * Add item to shopping list
     */
    public function addItem(Request $request, ShoppingList $shoppingList)
    {
        // Ensure user owns this list
        if ($shoppingList->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'product_id' => 'nullable|exists:products,id',
            'name' => 'required|string|max:255',
            'quantity' => 'integer|min:1',
        ]);

        $item = $shoppingList->items()->create($validated);
        $item->load('product.category');
        return response()->json($item, 201);
    }

    /**
     * Update shopping list item
     */
    public function updateItem(Request $request, ShoppingList $shoppingList, ShoppingListItem $item)
    {
        // Ensure user owns this list
        if ($shoppingList->user_id !== $request->user()->id || $item->shopping_list_id !== $shoppingList->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'name' => 'string|max:255',
            'quantity' => 'integer|min:1',
            'checked' => 'boolean',
        ]);

        $item->update($validated);
        $item->load('product.category');
        return response()->json($item);
    }

    /**
     * Remove item from shopping list
     */
    public function removeItem(Request $request, ShoppingList $shoppingList, ShoppingListItem $item)
    {
        // Ensure user owns this list
        if ($shoppingList->user_id !== $request->user()->id || $item->shopping_list_id !== $shoppingList->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $item->delete();
        return response()->json(['message' => 'Item removed successfully']);
    }
}
