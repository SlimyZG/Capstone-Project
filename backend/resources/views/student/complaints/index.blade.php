<x-app-layout>
    <x-slot name="title">My Complaints</x-slot>

    <div class="animate-fade-up">
        <div class="page-header">
            <div>
                <h1 class="page-title">My Complaints</h1>
                <p class="page-subtitle">Track the status of your submitted complaints</p>
            </div>
            <a href="{{ route('student.complaints.create') }}" class="btn-primary">
                <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" /></svg>
                New Complaint
            </a>
        </div>

        @if($complaints->isEmpty())
            <div class="empty-state">
                <div class="empty-state-icon">
                    <svg class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                </div>
                <h3 class="text-lg font-semibold text-slate-300">No complaints found</h3>
                <p class="mt-1 text-sm text-slate-500">Start by submitting your first complaint.</p>
                <a href="{{ route('student.complaints.create') }}" class="btn-primary mt-4">Submit Complaint</a>
            </div>
        @else
            <div class="card overflow-hidden">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Title</th>
                            <th>Department</th>
                            <th>Status</th>
                            <th>Upvotes</th>
                            <th>Submitted</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        @foreach($complaints as $complaint)
                            <tr>
                                <td>
                                    <div class="flex items-center gap-2">
                                        @if($complaint->is_anonymous)
                                            <span class="text-xs text-slate-500">🎭</span>
                                        @endif
                                        <span class="font-medium text-white">{{ Str::limit($complaint->title, 50) }}</span>
                                    </div>
                                </td>
                                <td><span class="text-indigo-400 text-xs font-medium">{{ $complaint->department->name }}</span></td>
                                <td><span class="{{ $complaint->statusBadgeClass() }}">{{ $complaint->statusLabel() }}</span></td>
                                <td><span class="text-slate-300 font-semibold">{{ $complaint->upvotes_count }}</span></td>
                                <td>{{ $complaint->created_at->format('M d, Y') }}</td>
                                <td>
                                    <a href="{{ route('student.complaints.show', $complaint) }}" class="btn-outline btn-sm">View</a>
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
