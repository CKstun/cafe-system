<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Unified Login endpoint for Staff and Admins.
     * Route: POST /api/login
     */
    public function login(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|email',
        ]);

        $email = strtolower(trim($request->email));
        $user = User::where('email', $email)->first();

        if (!$user) {
            throw ValidationException::withMessages([
                'email' => ['No account found with this email address.'],
            ]);
        }

        // Login Interceptor: Verify if account has been deactivated
        if (!$user->is_active) {
            return response()->json([
                'message' => 'Your account has been deactivated. Please contact an administrator.',
            ], 403);
        }

        // Detect user role (supports both direct attribute and Spatie method)
        $userRole = $user->role ?? (method_exists($user, 'hasRole') && $user->hasRole('admin') ? 'admin' : 'staff');

        // Assign abilities based on role
        $abilities = $userRole === 'admin' ? ['role:admin', 'role:staff'] : ['role:staff'];

        // Optional: Revoke existing tokens for a clean session state
        $user->tokens()->delete();

        // Issue new Sanctum token with role abilities
        $token = $user->createToken('cafepita_auth_token', $abilities)->plainTextToken;

        return response()->json([
            'success' => true,
            'token' => $token,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $userRole,
                'is_active' => (bool) $user->is_active,
            ],
            'abilities' => $abilities,
        ]);
    }

    /**
     * Logout and revoke the current Sanctum token.
     * Route: POST /api/logout
     * Middleware: ['auth:sanctum']
     */
    public function logout(Request $request): JsonResponse
    {
        if ($request->user() && $request->user()->currentAccessToken()) {
            $request->user()->currentAccessToken()->delete();
        }

        return response()->json([
            'success' => true,
            'message' => 'Successfully logged out and Sanctum session revoked.',
        ]);
    }
}