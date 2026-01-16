<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreProductRequest;
use App\Http\Requests\UpdateProductRequest;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminProductController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Product::with('category');

        if ($request->has('search') && $request->search !== '') {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%")
                  ->orWhereHas('category', function($q) use ($search) {
                      $q->where('name', 'like', "%{$search}%");
                  });
            });
        }

        $products = $query->orderBy('name')->paginate(10);

        return response()->json($products);
    }

    public function store(StoreProductRequest $request): JsonResponse
    {
        $product = Product::create($request->validated());

        \Illuminate\Support\Facades\Log::info('Admin: Product created', [
            'product_id' => $product->id,
            'product_name' => $product->name,
            'category_id' => $product->category_id,
            'admin_user_id' => auth()->id() ?? 'guest'
        ]);

        return response()->json([
            'message' => 'Product created successfully',
            'product' => $product->load('category')
        ], 201);
    }

    public function update(UpdateProductRequest $request, Product $product): JsonResponse
    {
        $product->update($request->validated());

        return response()->json([
            'message' => 'Product updated successfully',
            'product' => $product->load('category')
        ]);
    }

    public function destroy(Product $product): JsonResponse
    {
        $productId = $product->id;
        $productName = $product->name;
        
        $product->delete();

        \Illuminate\Support\Facades\Log::info('Admin: Product deleted', [
            'product_id' => $productId,
            'product_name' => $productName,
            'admin_user_id' => auth()->id() ?? 'guest'
        ]);

        return response()->json([
            'message' => 'Product deleted successfully'
        ]);
    }
}
