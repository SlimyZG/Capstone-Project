<x-app-layout>
    <x-slot name="title">Department Queue</x-slot>

    <div class="animate-fade-up">
        {{-- Header --}}
        <div class="page-header">
            <div>
                <h1 class="page-title">{{ auth()->user()->department->name ?? 'Department' }} Queue</h1>
                <p class="page-subtitle">Manage and respond to complaints assigned to your department</p>
            </div>
        </div>

        {{-- Filter Bar --}}
        <form method="GET" action="{{ route('department.dashboard') }}" class="card card-body mb-6 flex flex-wrap items-end gap-4">
            <div class="flex-1 min-w-[160px]">
                <label class="form-label">Filter by Status</label>
                <div class="relative">
                    <select name="status" class="form-select">
                        <option value="">All Statuses</option>
                        @foreach($statuses as $s)
                            <option value="{{ $s }}" {{ request('status') === $s ? 'selected' : '' }}>{{ ucfirst($s) }}</option>
                        @endforeach
                    </select>
                    <div class="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                        <svg class="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
                    </div>
                </div>
            </div>
            <button type="submit" class="btn-primary">Apply Filter</button>
            @if(request('status'))
                <a href="{{ route('department.dashboard') }}" class="btn-secondary">Clear</a>
            @endif
        </form>

        {{-- Stats Row --}}
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6 stagger">
            @php
                $deptId = auth()->user()->department_id;
                $statusCounts = ['pending'=>0,'investigating'=>0,'resolved'=>0,'closed'=>0];
                foreach ($statusCounts as $s => $c) {
                    $statusCounts[$s] = \App\Models\Complaint::forDepartment($deptId)->byStatus($s)->count();
                }
            @endphp
            <div class="stat-card animate-fade-up border-rose-800/40">
                <span class="stat-value text-rose-400">{{ $statusCounts['pending'] }}</span>
                <span class="stat-label">Pending</span>
            </div>
            <div class="stat-card animate-fade-up border-amber-800/40">
                <span class="stat-value text-amber-400">{{ $statusCounts['investigating'] }}</span>
                <span class="stat-label">Investigating</span>
            </div>
            <div class="stat-card animate-fade-up border-emerald-800/40">
                <span class="stat-value text-emerald-400">{{ $statusCounts['resolved'] }}</span>
                <span class="stat-label">Resolved</span>
            </div>
            <div class="stat-card animate-fade-up border-slate-700">
                <span class="stat-value text-slate-400">{{ $statusCounts['closed'] }}</span>
                <span class="stat-label">Closed</span>
            </div>
        </div>

        {{-- Complaints Table --}}
        @if($complaints->isEmpty())
            <div class="empty-state">
                <div class="empty-state-icon">
                    <svg class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <h3 class="text-lg font-semibold text-slate-300">All clear!</h3>
                <p class="mt-1 text-sm text-slate-500">No complaints matching this filter.</p>
            </div>
        @else
            <div class="card overflow-hidden">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Title</th>
                            <th>Status</th>
                            <th>Upvotes</th>
                            <th>Submitted</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        @foreach($complaints as $complaint)
                            <tr>
                                <td>
                                    <div class="flex items-center gap-2">
                                        @if($complaint->is_anonymous)
                                            <span class="text-xs text-slate-500" title="Anonymous">🎭</span>
                                        @endif
                                        <span class="font-medium text-white">{{ Str::limit($complaint->title, 55) }}</span>
                                    </div>
                                </td>
                                <td><span class="{{ $complaint->statusBadgeClass() }}">{{ $complaint->statusLabel() }}</span></td>
                                <td>
                                    <span class="inline-flex items-center gap-1 text-xs text-slate-400">
                                        <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" /></svg>
                                        {{ $complaint->upvotes_count }}
                                    </span>
                                </td>
                                <td class="text-xs">{{ $complaint->created_at->format('M d, Y') }}</td>
                                <td>
                                    <a href="{{ route('department.complaints.show', $complaint) }}" class="btn-primary btn-sm">
                                        Manage
                                    </a>
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
