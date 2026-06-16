<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Complaint;
use App\Models\Upvote;
use Illuminate\Http\Request;

class UpvoteController extends Controller
{
    public function toggle(Request $request, Complaint $complaint)
    {
        $user = auth()->user();

        $existing = Upvote::where('complaint_id', $complaint->id)
                          ->where('user_id', $user->id)
                          ->first();

        if ($existing) {
            $existing->delete();
            $complaint->decrement('upvotes_count');
            $voted = false;
        } else {
            Upvote::create([
                'complaint_id' => $complaint->id,
                'user_id'      => $user->id,
            ]);
            $complaint->increment('upvotes_count');
            $voted = true;
        }

        return response()->json([
            'upvotes_count' => $complaint->fresh()->upvotes_count,
            'voted'         => $voted,
        ]);
    }
}
