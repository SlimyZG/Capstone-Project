<x-app-layout>
    <x-slot name="title">Admin Dashboard</x-slot>

    <div class="animate-fade-up">
        <div class="page-header">
            <div>
                <h1 class="page-title">
                    <span class="gradient-text">Admin Dashboard</span>
                </h1>
                <p class="page-subtitle">System-wide overview and management</p>
            </div>
        </div>

        {{-- Stats Grid --}}
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8 stagger">
            <div class="stat-card animate-fade-up border-slate-700 col-span-2 lg:col-span-1">
                <span class="stat-value gradient-text">{{ $stats['total_complaints'] }}</span>
                <span class="stat-label">Total Complaints</span>
            </div>
            <div class="stat-card animate-fade-up border-rose-800/40">
                <span class="stat-value text-rose-400">{{ $stats['pending'] }}</span>
                <span class="stat-label">Pending</span>
            </div>
            <div class="stat-card animate-fade-up border-amber-800/40">
                <span class="stat-value text-amber-400">{{ $stats['investigating'] }}</span>
                <span class="stat-label">Investigating</span>
            </div>
            <div class="stat-card animate-fade-up border-emerald-800/40">
                <span class="stat-value text-emerald-400">{{ $stats['resolved'] }}</span>
                <span class="stat-label">Resolved</span>
            </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8 stagger">
            {{-- Secondary stats --}}
            <div class="stat-card animate-fade-up">
                <span class="stat-value text-sky-400">{{ $stats['total_students'] }}</span>
                <span class="stat-label">Registered Students</span>
            </div>
            <div class="stat-card animate-fade-up">
                <span class="stat-value text-violet-400">{{ $stats['total_departments'] }}</span>
                <span class="stat-label">Departments</span>
            </div>
            <div class="stat-card animate-fade-up">
                <span class="stat-value text-slate-400">{{ $stats['closed'] }}</span>
                <span class="stat-label">Closed</span>
            </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {{-- Recent Complaints --}}
            <div class="card">
                <div class="card-body border-b border-slate-800 flex items-center justify-between">
                    <h2 class="text-base font-bold text-white">Recent Complaints</h2>
                    <a href="{{ route('admin.complaints.index') }}" class="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">View all →</a>
                </div>
                <div class="divide-y divide-slate-800/60">
                    @forelse($recentComplaints as $complaint)
                        <a href="{{ route('admin.complaints.show', $complaint) }}"
                           class="flex items-center gap-3 px-5 py-3 hover:bg-slate-800/30 transition-colors group">
                            <span class="{{ $complaint->statusBadgeClass() }} shrink-0">{{ $complaint->statusLabel() }}</span>
                            <span class="flex-1 text-sm text-slate-300 truncate group-hover:text-white transition-colors">{{ $complaint->title }}</span>
                            <span class="text-xs text-indigo-400 shrink-0">{{ $complaint->department->name }}</span>
                        </a>
                    @empty
                        <div class="px-5 py-8 text-center text-sm text-slate-500">No complaints yet.</div>
                    @endforelse
                </div>
            </div>

            {{-- Department Breakdown --}}
            <div class="card">
                <div class="card-body border-b border-slate-800">
                    <h2 class="text-base font-bold text-white">Complaints by Department</h2>
                </div>
                <div class="card-body space-y-3">
                    @php $max = $departmentStats->max('complaints_count') ?: 1; @endphp
                    @forelse($departmentStats as $dept)
                        <div>
                            <div class="flex items-center justify-between mb-1">
                                <span class="text-sm text-slate-300">{{ $dept->name }}</span>
                                <span class="text-sm font-semibold text-indigo-400">{{ $dept->complaints_count }}</span>
                            </div>
                            <div class="h-1.5 w-full rounded-full bg-slate-800">
                                <div class="h-1.5 rounded-full bg-gradient-to-r from-indigo-600 to-violet-500 transition-all"
                                     style="width: {{ ($dept->complaints_count / $max) * 100 }}%"></div>
                            </div>
                        </div>
                    @empty
                        <p class="text-sm text-slate-500">No departments found.</p>
                    @endforelse
                </div>
            </div>
        </div>
    </div>
</x-app-layout>
