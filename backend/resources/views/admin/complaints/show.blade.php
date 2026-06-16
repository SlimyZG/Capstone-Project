<x-app-layout>
    <x-slot name="title">Manage Complaint</x-slot>

    <div class="max-w-3xl mx-auto animate-fade-up">
        <a href="{{ route('admin.complaints.index') }}" class="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white mb-6 transition-colors">
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            Back to Complaints
        </a>

        {{-- Complaint Card --}}
        <div class="card card-body">
            <div class="flex flex-wrap items-center gap-2 mb-4">
                <span class="{{ $complaint->statusBadgeClass() }}">
                    <span class="h-1.5 w-1.5 rounded-full bg-current animate-pulse-dot"></span>
                    {{ $complaint->statusLabel() }}
                </span>
                <span class="text-xs text-indigo-400 border border-indigo-800/50 bg-indigo-900/30 rounded-full px-2.5 py-1">{{ $complaint->department->name }}</span>
                @if($complaint->is_anonymous)
                    <span class="text-xs text-slate-500 border border-slate-700 rounded-full px-2.5 py-1">🎭 Anonymous</span>
                @else
                    <span class="text-xs text-slate-400 border border-slate-700 rounded-full px-2.5 py-1">By: {{ $complaint->user?->name ?? 'Deleted User' }}</span>
                @endif
                <span class="ml-auto text-xs text-slate-500">{{ $complaint->created_at->format('F j, Y \a\t g:i A') }}</span>
            </div>

            <h1 class="text-xl font-bold text-white">{{ $complaint->title }}</h1>
            <div class="divider"></div>
            <p class="text-slate-300 leading-relaxed whitespace-pre-wrap">{{ $complaint->body }}</p>

            @if($complaint->attachment_path)
                <div class="mt-6">
                    @php $ext = pathinfo($complaint->attachment_path, PATHINFO_EXTENSION); @endphp
                    @if(in_array(strtolower($ext), ['jpg','jpeg','png','gif']))
                        <img src="{{ Storage::url($complaint->attachment_path) }}" alt="Attachment" class="max-h-64 rounded-xl border border-slate-700" />
                    @else
                        <a href="{{ Storage::url($complaint->attachment_path) }}" target="_blank" class="btn-secondary btn-sm">📎 Download Attachment</a>
                    @endif
                </div>
            @endif
        </div>

        {{-- Admin Controls --}}
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            {{-- Override Status --}}
            <div class="card card-body">
                <h3 class="text-sm font-semibold text-slate-300 mb-3">Override Status</h3>
                <form method="POST" action="{{ route('admin.complaints.status', $complaint) }}" class="flex gap-3">
                    @csrf @method('PATCH')
                    <div class="relative flex-1">
                        <select name="status" class="form-select">
                            @foreach($statuses as $s)
                                <option value="{{ $s }}" {{ $complaint->status === $s ? 'selected' : '' }}>{{ ucfirst($s) }}</option>
                            @endforeach
                        </select>
                        <div class="pointer-events-none absolute inset-y-0 right-3 flex items-center"><svg class="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg></div>
                    </div>
                    <button type="submit" class="btn-primary btn-sm whitespace-nowrap">Apply</button>
                </form>
            </div>

            {{-- Reassign Department --}}
            <div class="card card-body">
                <h3 class="text-sm font-semibold text-slate-300 mb-3">Reassign Department</h3>
                <form method="POST" action="{{ route('admin.complaints.reassign', $complaint) }}" class="flex gap-3">
                    @csrf @method('PATCH')
                    <div class="relative flex-1">
                        <select name="department_id" class="form-select">
                            @foreach($departments as $dept)
                                <option value="{{ $dept->id }}" {{ $complaint->department_id === $dept->id ? 'selected' : '' }}>{{ $dept->name }}</option>
                            @endforeach
                        </select>
                        <div class="pointer-events-none absolute inset-y-0 right-3 flex items-center"><svg class="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg></div>
                    </div>
                    <button type="submit" class="btn-primary btn-sm whitespace-nowrap">Move</button>
                </form>
            </div>
        </div>

        {{-- Responses --}}
        <div class="mt-6">
            <h2 class="text-lg font-bold text-white mb-4">
                Responses <span class="text-sm font-normal text-slate-500">({{ $complaint->responses->count() }})</span>
            </h2>
            @forelse($complaint->responses as $response)
                <div class="card card-body mb-4">
                    <div class="flex items-center justify-between mb-3">
                        <div class="flex items-center gap-2">
                            <span class="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-sky-500 to-indigo-600 text-xs font-bold text-white">
                                {{ strtoupper(substr($response->user->name, 0, 1)) }}
                            </span>
                            <div>
                                <p class="text-sm font-semibold text-white">{{ $response->user->name }}</p>
                                <p class="text-xs text-slate-500">{{ ucfirst($response->user->role) }}</p>
                            </div>
                        </div>
                        <span class="text-xs text-slate-500">{{ $response->created_at->diffForHumans() }}</span>
                    </div>
                    <p class="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">{{ $response->body }}</p>
                </div>
            @empty
                <div class="alert-info">No responses yet.</div>
            @endforelse
        </div>

        {{-- Delete --}}
        <div class="mt-6 flex justify-end">
            <form method="POST" action="{{ route('admin.complaints.destroy', $complaint) }}"
                onsubmit="return confirm('Permanently delete this complaint and all its responses?')">
                @csrf @method('DELETE')
                <button type="submit" class="btn-danger">
                    <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    Delete Complaint
                </button>
            </form>
        </div>
    </div>
</x-app-layout>
