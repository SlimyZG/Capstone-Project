<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Complaint;
use App\Models\Department;
use Illuminate\Http\Request;

class ComplaintController extends Controller
{
    public function index(Request $request)
    {
        $query = Complaint::with(['department', 'user'])->orderByDesc('created_at');

        if ($request->filled('status')) {
            $query->byStatus($request->status);
        }
        if ($request->filled('department_id')) {
            $query->forDepartment($request->department_id);
        }
        if ($request->filled('search')) {
            $query->where('title', 'like', "%{$request->search}%");
        }

        $complaints  = $query->paginate(20)->withQueryString();
        $departments = Department::orderBy('name')->get();
        $statuses    = Complaint::$statuses;

        return response()->json([
            'complaints'  => $complaints,
            'departments' => $departments,
            'statuses'    => $statuses,
        ]);
    }

    public function show(Complaint $complaint)
    {
        $complaint->load(['department', 'responses.user', 'user']);
        $departments = Department::orderBy('name')->get();
        $statuses    = Complaint::$statuses;

        return response()->json([
            'complaint'   => $complaint,
            'departments' => $departments,
            'statuses'    => $statuses,
        ]);
    }

    public function reassign(Request $request, Complaint $complaint)
    {
        $validated = $request->validate([
            'department_id' => 'required|exists:departments,id',
        ]);

        $complaint->update(['department_id' => $validated['department_id']]);

        return response()->json([
            'message' => 'Complaint reassigned.',
            'complaint' => $complaint->load(['department'])
        ]);
    }

    public function overrideStatus(Request $request, Complaint $complaint)
    {
        $validated = $request->validate([
            'status' => 'required|in:pending,investigating,resolved,closed',
        ]);

        $complaint->update(['status' => $validated['status']]);

        return response()->json([
            'message' => 'Status overridden to ' . ucfirst($validated['status']) . '.',
            'complaint' => $complaint
        ]);
    }

    public function destroy(Complaint $complaint)
    {
        $complaint->delete();

        return response()->json([
            'message' => 'Complaint deleted.'
        ]);
    }
}
