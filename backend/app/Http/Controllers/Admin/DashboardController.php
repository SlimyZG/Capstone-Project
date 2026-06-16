<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Complaint;
use App\Models\Department;
use App\Models\User;

class DashboardController extends Controller
{
    public function index()
    {
        $stats = [
            'total_complaints'  => Complaint::count(),
            'pending'           => Complaint::where('status', 'pending')->count(),
            'investigating'     => Complaint::where('status', 'investigating')->count(),
            'resolved'          => Complaint::where('status', 'resolved')->count(),
            'closed'            => Complaint::where('status', 'closed')->count(),
            'total_students'    => User::where('role', 'student')->count(),
            'total_departments' => Department::count(),
        ];

        $recentComplaints = Complaint::with(['department', 'user'])
            ->orderByDesc('created_at')
            ->limit(10)
            ->get();

        $departmentStats = Department::withCount('complaints')
            ->orderByDesc('complaints_count')
            ->get();

        return response()->json([
            'stats'             => $stats,
            'recent_complaints' => $recentComplaints,
            'department_stats'  => $departmentStats,
        ]);
    }
}
