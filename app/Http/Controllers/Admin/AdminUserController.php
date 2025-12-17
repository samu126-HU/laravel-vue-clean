<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminUserController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = User::query();

        if ($request->has('search') && $request->search !== '') {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $users = $query->orderBy('created_at', 'desc')->paginate(10);

        return response()->json($users);
    }

    public function updateRole(Request $request, User $user): JsonResponse
    {
        $request->validate([
            'is_admin' => 'required|boolean'
        ]);

        // Prevent self-demotion
        if ($user->id === auth()->id() && !$request->is_admin) {
            return response()->json([
                'message' => 'You cannot demote yourself'
            ], 403);
        }

        // Prevent removing the last admin
        if (!$request->is_admin && User::where('is_admin', true)->count() <= 1 && $user->is_admin) {
            return response()->json([
                'message' => 'Cannot remove the last admin'
            ], 403);
        }

        $user->is_admin = $request->is_admin;
        $user->save();

        return response()->json([
            'message' => 'User role updated successfully',
            'user' => $user
        ]);
    }
}
