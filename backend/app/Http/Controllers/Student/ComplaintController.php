<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Mail\ComplaintStatusChanged;
use App\Models\Complaint;
use App\Models\Department;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;

class ComplaintController extends Controller
{
    public function index(Request $request)
    {
        $query = Complaint::with(['department'])
            ->where('is_private', false);

        if ($request->filled('department_id')) {
            $query->where('department_id', $request->department_id);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('body', 'like', "%{$search}%");
            });
        }

        $complaints = $query->orderByDesc('upvotes_count')
            ->orderByDesc('created_at')
            ->paginate(10);

        // Map complaints to include has_upvoted
        $complaints->getCollection()->transform(function ($complaint) {
            $complaint->has_upvoted = auth()->check()
                ? $complaint->hasBeenUpvotedBy(auth()->user())
                : false;
            return $complaint;
        });

        return response()->json($complaints);
    }

    public function create()
    {
        $departments = Department::orderBy('name')->get();
        return response()->json($departments);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title'         => 'required|string|max:255',
            'body'          => 'required|string|min:20',
            'department_id' => 'required|exists:departments,id',
            'is_anonymous'  => 'nullable|boolean',
            'is_private'    => 'nullable|boolean',
            'attachment'    => 'nullable|file|mimes:jpg,jpeg,png,gif,pdf,doc,docx|max:5120',
        ]);

        $attachmentPath = null;
        if ($request->hasFile('attachment')) {
            $attachmentPath = $request->file('attachment')->store('attachments', 'public');
        }

        $isAnonymous = filter_var($request->input('is_anonymous'), FILTER_VALIDATE_BOOLEAN);
        $isPrivate = filter_var($request->input('is_private'), FILTER_VALIDATE_BOOLEAN);

        $complaint = Complaint::create([
            'user_id'         => auth()->id(), // Always store user_id so owner can track it
            'department_id'   => $validated['department_id'],
            'title'           => $validated['title'],
            'body'            => $validated['body'],
            'is_anonymous'    => $isAnonymous,
            'is_private'      => $isPrivate,
            'attachment_path' => $attachmentPath,
            'status'          => 'pending',
        ]);

        return response()->json([
            'message' => 'Complaint submitted successfully!',
            'complaint' => $complaint
        ], 201);
    }

    public function show(Complaint $complaint)
    {
        // If the complaint is private, verify user is owner, staff, or admin
        if ($complaint->is_private) {
            $user = auth()->user();
            $isAuthorized = $user && (
                $user->id === $complaint->user_id ||
                $user->role === 'admin' ||
                ($user->role === 'department' && $user->department_id === $complaint->department_id)
            );
            if (!$isAuthorized) {
                abort(403, 'This complaint is private.');
            }
        }

        $complaint->load(['department', 'responses.user']);
        $hasUpvoted = auth()->check()
            ? $complaint->hasBeenUpvotedBy(auth()->user())
            : false;

        return response()->json([
            'complaint' => $complaint,
            'has_upvoted' => $hasUpvoted
        ]);
    }

    public function myComplaints()
    {
        $complaints = Complaint::with(['department', 'responses.user'])
            ->where('user_id', auth()->id())
            ->orderByDesc('created_at')
            ->get();

        return response()->json($complaints);
    }

    public function dashboardStats()
    {
        $userId = auth()->id();

        $total = Complaint::where('user_id', $userId)->count();
        $pending = Complaint::where('user_id', $userId)
            ->whereIn('status', ['pending', 'investigating'])
            ->count();
        $resolved = Complaint::where('user_id', $userId)
            ->whereIn('status', ['resolved', 'closed'])
            ->count();

        return response()->json([
            'total' => $total,
            'pending' => $pending,
            'resolved' => $resolved,
        ]);
    }

    public function storeResponse(Request $request, Complaint $complaint)
    {
        if ($complaint->user_id !== auth()->id()) {
            abort(403, 'You are not authorized to respond to this complaint.');
        }

        $validated = $request->validate([
            'body' => 'required|string|min:5',
        ]);

        $response = \App\Models\ComplaintResponse::create([
            'complaint_id' => $complaint->id,
            'user_id'      => auth()->id(),
            'body'         => $validated['body'],
        ]);

        return response()->json([
            'message' => 'Response added successfully.',
            'response' => $response->load('user')
        ]);
    }
}
