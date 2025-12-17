<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Product;
use App\Models\Category;
use App\Models\Shop;
use App\Models\ShoppingList;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;

class AdminDashboardController extends Controller
{
    public function statistics(): JsonResponse
    {
        // Cache statistics for 5 minutes to reduce database load
        $statistics = Cache::remember('admin_statistics', 300, function () {
            return [
                'total_users' => User::count(),
                'total_products' => Product::count(),
                'total_categories' => Category::count(),
                'total_shops' => Shop::count(),
                'total_shopping_lists' => ShoppingList::count(),
            ];
        });

        // Recent users are not cached as they change frequently
        $statistics['recent_users'] = User::orderBy('created_at', 'desc')
            ->take(5)
            ->get(['id', 'name', 'email', 'created_at', 'is_admin']);

        return response()->json($statistics);
    }
}
