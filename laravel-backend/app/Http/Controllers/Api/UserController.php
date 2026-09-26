<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    /**
     * Display a listing of registered staff and admin accounts.
     * Route: GET /api/admin/users
     * Middleware: ['auth:sanctum', 'role:admin']
     */
    public function index(Request $request): JsonResponse
    {
        $users = User::select(['id', 'name', 'email', 'role', 'is_active', 'created_at', 'updated_at'])
            ->orderBy('id', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $users,
        ]);
    }

    /**
     * Store a newly created user account.
     * Route: POST /api/admin/users
     * Middleware: ['auth:sanctum', 'role:admin']
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email',
            'role' => ['required', Rule::in(['admin', 'staff'])],
            'password' => 'required|string|min:8',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => strtolower($validated['email']),
            'role' => $validated['role'],
            'password' => Hash::make($validated['password']),
            'is_active' => true,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Staff user account created successfully.',
            'data' => $user->only(['id', 'name', 'email', 'role', 'is_active', 'created_at']),
        ], 201);
    }

    /**
     * Update user profile details and optionally reset/overwrite password.
     * Route: PUT /api/admin/users/{id}
     * Middleware: ['auth:sanctum', 'role:admin']
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $user = User::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'email' => ['sometimes', 'required', 'string', 'email', 'max:255', Rule::unique('users', 'email')->ignore($user->id)],
            'role' => ['sometimes', 'required', Rule::in(['admin', 'staff'])],
            'password' => 'nullable|string|min:8',
        ]);

        if (isset($validated['name'])) {
            $user->name = $validated['name'];
        }
        if (isset($validated['email'])) {
            $user->email = strtolower($validated['email']);
        }
        if (isset($validated['role'])) {
            $user->role = $validated['role'];
        }

        $passwordReset = false;
        if (!empty($validated['password'])) {
            $user->password = Hash::make($validated['password']);
            // Invalidate active Sanctum access tokens to force relogin
            $user->tokens()->delete();
            $passwordReset = true;
        }

        $user->save();

        return response()->json([
            'success' => true,
            'message' => $passwordReset
                ? "Account updated and password reset successfully. Active sessions revoked."
                : "Account profile details updated successfully.",
            'data' => $user->only(['id', 'name', 'email', 'role', 'is_active', 'updated_at']),
            'tokens_revoked' => $passwordReset,
        ]);
    }

    /**
     * Toggle active/disabled status for a user account.
     * Route: PATCH /api/admin/users/{id}/toggle-status
     * Middleware: ['auth:sanctum', 'role:admin']
     */
    public function toggleStatus(Request $request, int $id): JsonResponse
    {
        // Protection & Self-Guard: Prevent Admins from deactivating their own account
        if ($request->user()->id === (int) $id) {
            return response()->json([
                'success' => false,
                'message' => 'Security Guard: You cannot deactivate your own currently active administrator account.',
            ], 403);
        }

        $user = User::findOrFail($id);
        $user->is_active = !$user->is_active;
        $user->save();

        // If deactivated, revoke all active Sanctum tokens immediately
        if (!$user->is_active) {
            $user->tokens()->delete();
        }

        return response()->json([
            'success' => true,
            'message' => $user->is_active
                ? "Account for {$user->name} has been reactivated."
                : "Account for {$user->name} has been deactivated and active Sanctum tokens revoked.",
            'is_active' => $user->is_active,
        ]);
    }

    /**
     * Permanently delete a user account.
     * Route: DELETE /api/admin/users/{id}
     * Middleware: ['auth:sanctum', 'role:admin']
     */
    public function destroy(Request $request, int $id): JsonResponse
    {
        // Protection & Self-Deletion Guard: Prevent Admins from deleting their own account
        if ($request->user()->id === (int) $id) {
            return response()->json([
                'success' => false,
                'message' => 'Security Guard: You cannot delete your own currently active administrator account.',
            ], 403);
        }

        $user = User::findOrFail($id);
        $name = $user->name;

        // Revoke tokens and delete user record
        $user->tokens()->delete();
        $user->delete();

        return response()->json([
            'success' => true,
            'message' => "Account for {$name} has been permanently deleted.",
            'deleted_id' => $id,
        ]);
    }
}
