<?php

namespace App\Http\Controllers\Department;

use App\Http\Controllers\Controller;
use App\Mail\ComplaintStatusChanged;
use App\Models\Complaint;
use App\Models\ComplaintResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;

class ComplaintController extends Controller
{
    public function index(Request $request)
    {
        $user       = auth()->user();
        $query      = Complaint::with(['department'])
                        ->forDepartment($user->department_id)
                        ->orderByDesc('created_at');

        if ($request->filled('status')) {
            $query->byStatus($request->status);
        }

        $complaints = $query->paginate(15);
        $statuses   = Complaint::$statuses;

        return response()->json([
            'complaints' => $complaints,
            'statuses' => $statuses
        ]);
    }

    public function show(Complaint $complaint)
    {
        $this->authorizeComplaint($complaint);
        $complaint->load(['department', 'responses.user']);

        return response()->json($complaint);
    }

    public function updateStatus(Request $request, Complaint $complaint)
    {
        $this->authorizeComplaint($complaint);

        $validated = $request->validate([
            'status' => 'required|in:pending,investigating,resolved,closed',
        ]);

        $oldStatus = $complaint->status;
        $complaint->update(['status' => $validated['status']]);

        // Email notification if submitter is not anonymous
        if (! $complaint->is_anonymous && $complaint->user && $complaint->user->email) {
            Mail::to($complaint->user->email)
                ->queue(new ComplaintStatusChanged($complaint, $oldStatus));
        }

        return response()->json([
            'message' => 'Status updated to ' . ucfirst($validated['status']) . '.',
            'complaint' => $complaint->fresh()
        ]);
    }

    public function storeResponse(Request $request, Complaint $complaint)
    {
        $this->authorizeComplaint($complaint);

        $validated = $request->validate([
            'body' => 'required|string|min:5',
        ]);

        $response = ComplaintResponse::create([
            'complaint_id' => $complaint->id,
            'user_id'      => auth()->id(),
            'body'         => $validated['body'],
        ]);

        // Email notification
        if (! $complaint->is_anonymous && $complaint->user && $complaint->user->email) {
            Mail::to($complaint->user->email)
                ->queue(new \App\Mail\NewComplaintResponse($complaint));
        }

        return response()->json([
            'message' => 'Response added successfully.',
            'response' => $response->load('user')
        ]);
    }

    private function authorizeComplaint(Complaint $complaint): void
    {
        if ($complaint->department_id !== auth()->user()->department_id) {
            abort(403, 'You are not authorized to manage this complaint.');
        }
    }
}
