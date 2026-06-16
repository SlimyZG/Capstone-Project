<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Department;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $query = User::with('department')->where('role', '!=', 'admin');

        if ($request->filled('role')) {
            $query->where('role', $request->role);
        }
        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', "%{$request->search}%")
                  ->orWhere('email', 'like', "%{$request->search}%");
            });
        }

        $users       = $query->orderByDesc('created_at')->paginate(15)->withQueryString();
        $departments = Department::orderBy('name')->get();

        return response()->json([
            'users'       => $users,
            'departments' => $departments,
        ]);
    }

    public function create()
    {
        $departments = Department::orderBy('name')->get();
        return response()->json($departments);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'          => 'required|string|max:255',
            'email'         => 'required|email|unique:users,email',
            'password'      => 'required|string|min:8|confirmed',
            'role'          => 'required|in:student,department',
            'department_id' => 'required_if:role,department|nullable|exists:departments,id',
        ]);

        $user = User::create([
            'name'          => $validated['name'],
            'email'         => $validated['email'],
            'password'      => Hash::make($validated['password']),
            'role'          => $validated['role'],
            'department_id' => $validated['role'] === 'department' ? $validated['department_id'] : null,
        ]);

        return response()->json([
            'message' => 'User created successfully.',
            'user'    => $user->load('department')
        ], 201);
    }

    public function edit(User $user)
    {
        $departments = Department::orderBy('name')->get();
        return response()->json([
            'user'        => $user,
            'departments' => $departments
        ]);
    }

    public function update(Request $request, User $user)
    {
        $validated = $request->validate([
            'name'          => 'required|string|max:255',
            'email'         => ['required', 'email', Rule::unique('users')->ignore($user->id)],
            'password'      => 'nullable|string|min:8|confirmed',
            'role'          => 'required|in:student,department',
            'department_id' => 'required_if:role,department|nullable|exists:departments,id',
        ]);

        $updateData = [
            'name'          => $validated['name'],
            'email'         => $validated['email'],
            'role'          => $validated['role'],
            'department_id' => $validated['role'] === 'department' ? $validated['department_id'] : null,
        ];

        if (! empty($validated['password'])) {
            $updateData['password'] = Hash::make($validated['password']);
        }

        $user->update($updateData);

        return response()->json([
            'message' => 'User updated successfully.',
            'user'    => $user->load('department')
        ]);
    }

    public function destroy(User $user)
    {
        if ($user->isAdmin()) {
            return response()->json([
                'error' => 'Cannot delete admin accounts.'
            ], 400);
        }

        $user->delete();

        return response()->json([
            'message' => 'User deleted.'
        ]);
    }
}
