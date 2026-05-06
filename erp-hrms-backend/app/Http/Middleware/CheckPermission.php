<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckPermission
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, string ...$permissions): Response
    {
        $user = $request->user();

        if (! $user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthenticated.',
            ], 401);
        }

        // Admin users have all permissions
        if ($user->hasAnyRole(['admin', 'administrator'])) {
            return $next($request);
        }

        // Log for debugging
        \Illuminate\Support\Facades\Log::debug('Permission Check', [
            'user_id' => $user->id,
            'user_roles' => $user->roles->pluck('name')->toArray(),
            'required_permissions' => $permissions
        ]);

        // Staff users (user role) should have basic CRM access
        $userRoles = $user->roles->pluck('name')->toArray();
        if (in_array('user', $userRoles) || in_array('Staff', $userRoles)) {
            $allowedForUser = [
                'view_crm_dashboard', 
                'view_sales_tasks',
                'create_sales_tasks',
                'edit_sales_tasks',
                'delete_sales_tasks'
            ];
            foreach ($permissions as $permission) {
                if (in_array($permission, $allowedForUser)) {
                    return $next($request);
                }
            }
        }

        // Check if user has any of the required permissions via Spatie
        foreach ($permissions as $permission) {
            try {
                if ($user->hasPermissionTo($permission)) {
                    return $next($request);
                }
            } catch (\Exception $e) {
                // Ignore guard mismatch errors for now
            }
        }

        return response()->json([
            'success' => false,
            'message' => 'You do not have permission to perform this action.',
        ], 403);
    }
}
