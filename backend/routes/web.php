<?php

use App\Http\Controllers\Admin;
use App\Http\Controllers\Department;
use App\Http\Controllers\Student;
use App\Http\Controllers\ProfileController;
use Illuminate\Support\Facades\Route;

// ─── Root Redirect ──────────────────────────────────────────────────────────────
Route::get('/', function () {
    if (auth()->check()) {
        return match (auth()->user()->role) {
            'admin'      => redirect()->route('admin.dashboard'),
            'department' => redirect()->route('department.dashboard'),
            default      => redirect()->route('student.dashboard'),
        };
    }
    return redirect()->route('login');
});

// ─── Auth Routes (Breeze) ────────────────────────────────────────────────────────
require __DIR__.'/auth.php';

// ─── Post-login redirect by role ─────────────────────────────────────────────────
Route::middleware('auth')->group(function () {

    // Profile
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // ─── Student Routes ──────────────────────────────────────────────────────────
    Route::middleware('role:student')->prefix('student')->name('student.')->group(function () {
        Route::get('/dashboard', [Student\ComplaintController::class, 'index'])->name('dashboard');
        Route::resource('complaints', Student\ComplaintController::class)->only(['index', 'create', 'store', 'show']);
        Route::post('complaints/{complaint}/upvote', [Student\UpvoteController::class, 'toggle'])->name('complaints.upvote');
    });

    // ─── Department Routes ──────────────────────────────────────────────────────
    Route::middleware('role:department')->prefix('department')->name('department.')->group(function () {
        Route::get('/dashboard', [Department\ComplaintController::class, 'index'])->name('dashboard');
        Route::get('complaints/{complaint}', [Department\ComplaintController::class, 'show'])->name('complaints.show');
        Route::patch('complaints/{complaint}/status', [Department\ComplaintController::class, 'updateStatus'])->name('complaints.status');
        Route::post('complaints/{complaint}/respond', [Department\ComplaintController::class, 'storeResponse'])->name('complaints.respond');
    });

    // ─── Admin Routes ────────────────────────────────────────────────────────────
    Route::middleware('role:admin')->prefix('admin')->name('admin.')->group(function () {
        Route::get('/dashboard', [Admin\DashboardController::class, 'index'])->name('dashboard');

        // User management
        Route::resource('users', Admin\UserController::class)->except(['show']);

        // Complaint management
        Route::get('complaints', [Admin\ComplaintController::class, 'index'])->name('complaints.index');
        Route::get('complaints/{complaint}', [Admin\ComplaintController::class, 'show'])->name('complaints.show');
        Route::patch('complaints/{complaint}/reassign', [Admin\ComplaintController::class, 'reassign'])->name('complaints.reassign');
        Route::patch('complaints/{complaint}/status', [Admin\ComplaintController::class, 'overrideStatus'])->name('complaints.status');
        Route::delete('complaints/{complaint}', [Admin\ComplaintController::class, 'destroy'])->name('complaints.destroy');
    });
});
