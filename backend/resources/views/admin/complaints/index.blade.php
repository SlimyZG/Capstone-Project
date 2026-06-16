<x-app-layout>
    <x-slot name="title">All Complaints</x-slot>

    <div class="animate-fade-up">
        <div class="page-header">
            <div>
                <h1 class="page-title">All Complaints</h1>
                <p class="page-subtitle">Global view — reassign, override, or moderate any complaint</p>
            </div>
        </div>

        {{-- Filters --}}
        <form method="GET" action="{{ route('admin.complaints.index') }}" class="card card-body mb-6 flex flex-wrap items-end gap-4">
            <div class="flex-1 min-w-[200px]">
                <label class="form-label">Search Title</label>
                <input type="text" name="search" value="{{ request('search') }}" class="form-input" placeholder="Search..." />
            </div>
            <div class="min-w-[160px]">
                <label class="form-label">Status</label>
                <div class="relative">
                    <select name="status" class="form-select">
                        <option value="">All Statuses</option>
                        @foreach($statuses as $s)
                            <option value="{{ $s }}" {{ request('status') === $s ? 'selected' : '' }}>{{ ucfirst($s) }}</option>
                        @endforeach
                    </select>
                    <div class="pointer-events-none absolute inset-y-0 right-3 flex items-center"><svg class="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg></div>
                </div>
            </div>
            <div class="min-w-[180px]">
                <label class="form-label">Department</label>
                <div class="relative">
                    <select name="department_id" class="form-select">
                        <option value="">All Departments</option>
                        @foreach($departments as $dept)
                            <option value="{{ $dept->id }}" {{ request('department_id') == $dept->id ? 'selected' : '' }}>{{ $dept->name }}</option>
                        @endforeach
                    </select>
                    <div class="pointer-events-none absolute inset-y-0 right-3 flex items-center"><svg class="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg></div>
                </div>
            </div>
            <button type="submit" class="btn-primary">Filter</button>
            @if(request()->hasAny(['search','status','department_id']))
                <a href="{{ route('admin.complaints.index') }}" class="btn-secondary">Clear</a>
            @endif
        </form>

        @if($complaints->isEmpty())
            <div class="empty-state">
                <div class="empty-state-icon"><svg class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg></div>
                <h3 class="text-lg font-semibold text-slate-300">No complaints found</h3>
            </div>
        @else
            <div class="card overflow-hidden">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Title</th>
                            <th>Author</th>
                            <th>Department</th>
                            <th>Status</th>
                            <th>Upvotes</th>
                            <th>Date</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        @foreach($complaints as $complaint)
                            <tr>
                                <td class="max-w-xs">
                                    <span class="font-medium text-white">{{ Str::limit($complaint->title, 40) }}</span>
                                </td>
                                <td class="text-sm text-slate-400">
                                    {{ $complaint->is_anonymous ? '🎭 Anonymous' : ($complaint->user?->name ?? '—') }}
                                </td>
                                <td><span class="text-xs text-indigo-400 font-medium">{{ $complaint->department->name }}</span></td>
                                <td><span class="{{ $complaint->statusBadgeClass() }}">{{ $complaint->statusLabel() }}</span></td>
                                <td class="text-slate-300 font-semibold">{{ $complaint->upvotes_count }}</td>
                                <td class="text-xs text-slate-500">{{ $complaint->created_at->format('M d, Y') }}</td>
                                <td>
                                    <div class="flex items-center gap-2">
                                        <a href="{{ route('admin.complaints.show', $complaint) }}" class="btn-primary btn-sm">Manage</a>
                                        <form method="POST" action="{{ route('admin.complaints.destroy', $complaint) }}"
                                            onsubmit="return confirm('Delete this complaint?')">
                                            @csrf @method('DELETE')
                                            <button type="submit" class="btn-danger btn-sm">Del</button>
                                        </form>
                                    </div>
                                </td>
                            </tr>
                        @endforeach
                    </tbody>
                </table>
            </div>
            <div class="mt-6">{{ $complaints->links('vendor.pagination.custom') }}</div>
        @endif
    </div>
</x-app-layout>
