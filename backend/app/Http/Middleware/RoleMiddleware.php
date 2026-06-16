<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RoleMiddleware
{
    /**
     * Handle an incoming request.
     * Usage: ->middleware('role:admin,department')
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        if (! $request->user() || ! in_array($request->user()->role, $roles)) {
            if ($request->expectsJson() || $request->is('api/*')) {
                return response()->json(['error' => 'Unauthorized'], 403);
            }

            return match($request->user()?->role) {
                'admin'      => redirect()->route('admin.dashboard'),
                'department' => redirect()->route('department.dashboard'),
                'student'    => redirect()->route('student.dashboard'),
                default      => redirect()->route('login'),
            };
        }

        return $next($request);
    }
}
