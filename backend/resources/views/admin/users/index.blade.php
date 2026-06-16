<x-app-layout>
    <x-slot name="title">User Management</x-slot>

    <div class="animate-fade-up">
        <div class="page-header">
            <div>
                <h1 class="page-title">User Management</h1>
                <p class="page-subtitle">Create, edit, and manage student and department accounts</p>
            </div>
            <a href="{{ route('admin.users.create') }}" class="btn-primary">
                <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" /></svg>
                Add User
            </a>
        </div>

        {{-- Filters --}}
        <form method="GET" action="{{ route('admin.users.index') }}" class="card card-body mb-6 flex flex-wrap items-end gap-4">
            <div class="flex-1 min-w-[200px]">
                <label class="form-label">Search</label>
                <input type="text" name="search" value="{{ request('search') }}" class="form-input" placeholder="Name or email..." />
            </div>
            <div class="min-w-[160px]">
                <label class="form-label">Role</label>
                <div class="relative">
                    <select name="role" class="form-select">
                        <option value="">All Roles</option>
                        <option value="student" {{ request('role') === 'student' ? 'selected' : '' }}>Student</option>
                        <option value="department" {{ request('role') === 'department' ? 'selected' : '' }}>Department</option>
                    </select>
                    <div class="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                        <svg class="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
                    </div>
                </div>
            </div>
            <button type="submit" class="btn-primary">Search</button>
            @if(request()->hasAny(['search','role']))
                <a href="{{ route('admin.users.index') }}" class="btn-secondary">Clear</a>
            @endif
        </form>

        {{-- Table --}}
        @if($users->isEmpty())
            <div class="empty-state">
                <div class="empty-state-icon"><svg class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg></div>
                <h3 class="text-lg font-semibold text-slate-300">No users found</h3>
            </div>
        @else
            <div class="card overflow-hidden">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Department</th>
                            <th>Created</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        @foreach($users as $user)
                            <tr>
                                <td>
                                    <div class="flex items-center gap-2">
                                        <span class="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-xs font-bold text-white shrink-0">
                                            {{ strtoupper(substr($user->name, 0, 1)) }}
                                        </span>
                                        <span class="font-medium text-white">{{ $user->name }}</span>
                                    </div>
                                </td>
                                <td class="text-slate-400">{{ $user->email }}</td>
                                <td>
                                    <span class="badge {{ $user->role === 'student' ? 'bg-emerald-900/50 text-emerald-300 border-emerald-700/40' : 'bg-sky-900/50 text-sky-300 border-sky-700/40' }} border">
                                        {{ ucfirst($user->role) }}
                                    </span>
                                </td>
                                <td class="text-slate-400 text-sm">{{ $user->department?->name ?? '—' }}</td>
                                <td class="text-xs text-slate-500">{{ $user->created_at->format('M d, Y') }}</td>
                                <td>
                                    <div class="flex items-center gap-2">
                                        <a href="{{ route('admin.users.edit', $user) }}" class="btn-secondary btn-sm">Edit</a>
                                        <form method="POST" action="{{ route('admin.users.destroy', $user) }}"
                                            onsubmit="return confirm('Delete {{ addslashes($user->name) }}? This cannot be undone.')">
                                            @csrf @method('DELETE')
                                            <button type="submit" class="btn-danger btn-sm">Delete</button>
                                        </form>
                                    </div>
                                </td>
                            </tr>
                        @endforeach
                    </tbody>
                </table>
            </div>
            <div class="mt-6">{{ $users->links('vendor.pagination.custom') }}</div>
        @endif
    </div>
</x-app-layout>
