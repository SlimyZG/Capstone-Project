<?php

use App\Http\Controllers\Admin;
use App\Http\Controllers\Department;
use App\Http\Controllers\Student;
use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Auth\RegisteredUserController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// ─── Guest API Routes ────────────────────────────────────────────────────────
Route::post('/register', [RegisteredUserController::class, 'store']);
Route::post('/login', [AuthenticatedSessionController::class, 'store']);
Route::get('/departments', function () {
    return \App\Models\Department::all();
});

// ─── Authenticated API Routes ────────────────────────────────────────────────
Route::middleware('auth:sanctum')->group(function () {

    Route::post('/logout', [AuthenticatedSessionController::class, 'destroy']);
    
    Route::get('/user', function (Request $request) {
        $user = $request->user();
        if ($user->role === 'department') {
            $user->load('department');
        }
        return $user;
    });

    Route::put('/profile', [RegisteredUserController::class, 'updateProfile']);

    // ─── Student Routes ──────────────────────────────────────────────────────
    Route::middleware('role:student')->prefix('student')->group(function () {
        Route::get('/dashboard', [Student\ComplaintController::class, 'index']);
        Route::get('/my-complaints', [Student\ComplaintController::class, 'myComplaints']);
        Route::get('/dashboard-stats', [Student\ComplaintController::class, 'dashboardStats']);
        Route::post('/complaints/{complaint}/respond', [Student\ComplaintController::class, 'storeResponse']);
        Route::put('/profile', [RegisteredUserController::class, 'updateProfile']);
        Route::get('/departments', [Student\ComplaintController::class, 'create']);
        Route::post('/complaints', [Student\ComplaintController::class, 'store']);
        Route::get('/complaints/{complaint}', [Student\ComplaintController::class, 'show']);
        Route::post('/complaints/{complaint}/upvote', [Student\UpvoteController::class, 'toggle']);
    });

    // ─── Department Routes ───────────────────────────────────────────────────
    Route::middleware('role:department')->prefix('department')->group(function () {
        Route::get('/dashboard', [Department\ComplaintController::class, 'index']);
        Route::get('/complaints/{complaint}', [Department\ComplaintController::class, 'show']);
        Route::patch('/complaints/{complaint}/status', [Department\ComplaintController::class, 'updateStatus']);
        Route::post('/complaints/{complaint}/respond', [Department\ComplaintController::class, 'storeResponse']);
    });

    // ─── Admin Routes ────────────────────────────────────────────────────────
    Route::middleware('role:admin')->prefix('admin')->group(function () {
        Route::get('/dashboard', [Admin\DashboardController::class, 'index']);
        
        // User management
        Route::get('/users', [Admin\UserController::class, 'index']);
        Route::get('/users/create', [Admin\UserController::class, 'create']);
        Route::post('/users', [Admin\UserController::class, 'store']);
        Route::get('/users/{user}/edit', [Admin\UserController::class, 'edit']);
        Route::put('/users/{user}', [Admin\UserController::class, 'update']);
        Route::delete('/users/{user}', [Admin\UserController::class, 'destroy']);

        // Complaint management
        Route::get('/complaints', [Admin\ComplaintController::class, 'index']);
        Route::get('/complaints/{complaint}', [Admin\ComplaintController::class, 'show']);
        Route::patch('/complaints/{complaint}/reassign', [Admin\ComplaintController::class, 'reassign']);
        Route::patch('/complaints/{complaint}/status', [Admin\ComplaintController::class, 'overrideStatus']);
        Route::delete('/complaints/{complaint}', [Admin\ComplaintController::class, 'destroy']);
    });
});
