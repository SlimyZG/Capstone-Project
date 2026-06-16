<x-app-layout>
    <x-slot name="title">{{ $complaint->title }}</x-slot>

    <div class="max-w-3xl mx-auto animate-fade-up">
        <a href="{{ route('department.dashboard') }}" class="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white mb-6 transition-colors">
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            Back to Queue
        </a>

        {{-- Complaint Detail --}}
        <div class="card card-body">
            <div class="flex flex-wrap items-center gap-2 mb-4">
                <span class="{{ $complaint->statusBadgeClass() }}">
                    <span class="h-1.5 w-1.5 rounded-full bg-current animate-pulse-dot"></span>
                    {{ $complaint->statusLabel() }}
                </span>
                @if($complaint->is_anonymous)
                    <span class="text-xs text-slate-500 border border-slate-700 rounded-full px-2.5 py-1">🎭 Anonymous</span>
                @else
                    <span class="text-xs text-slate-400 border border-slate-700 rounded-full px-2.5 py-1">From: {{ $complaint->displayAuthor() }}</span>
                @endif
                <span class="ml-auto text-xs text-slate-500">{{ $complaint->created_at->format('F j, Y \a\t g:i A') }}</span>
            </div>

            <h1 class="text-xl font-bold text-white mb-1">{{ $complaint->title }}</h1>
            <p class="text-sm text-slate-400 mb-1">
                <span class="inline-flex items-center gap-1">
                    <svg class="h-3.5 w-3.5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" /></svg>
                    {{ $complaint->upvotes_count }} upvotes
                </span>
            </p>

            <div class="divider"></div>
            <p class="text-slate-300 leading-relaxed whitespace-pre-wrap">{{ $complaint->body }}</p>

            @if($complaint->attachment_path)
                <div class="mt-6">
                    @php $ext = pathinfo($complaint->attachment_path, PATHINFO_EXTENSION); @endphp
                    @if(in_array(strtolower($ext), ['jpg','jpeg','png','gif']))
                        <img src="{{ Storage::url($complaint->attachment_path) }}" alt="Attachment" class="max-h-64 rounded-xl border border-slate-700" />
                    @else
                        <a href="{{ Storage::url($complaint->attachment_path) }}" target="_blank" class="btn-secondary btn-sm">
                            📎 Download Attachment
                        </a>
                    @endif
                </div>
            @endif
        </div>

        {{-- Status Update --}}
        <div class="card card-body mt-4">
            <h2 class="text-sm font-semibold text-slate-300 mb-3">Update Status</h2>
            <form method="POST" action="{{ route('department.complaints.status', $complaint) }}" class="flex flex-wrap gap-3">
                @csrf @method('PATCH')
                <div class="relative flex-1 min-w-[180px]">
                    <select name="status" class="form-select">
                        @foreach(\App\Models\Complaint::$statuses as $s)
                            <option value="{{ $s }}" {{ $complaint->status === $s ? 'selected' : '' }}>{{ ucfirst($s) }}</option>
                        @endforeach
                    </select>
                    <div class="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                        <svg class="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
                    </div>
                </div>
                <button type="submit" class="btn-primary">Update Status</button>
            </form>
        </div>

        {{-- Responses --}}
        <div class="mt-6">
            <h2 class="text-lg font-bold text-white mb-4">
                Responses
                <span class="text-sm font-normal text-slate-500 ml-2">({{ $complaint->responses->count() }})</span>
            </h2>

            @forelse($complaint->responses as $response)
                <div class="card card-body mb-4 animate-fade-up">
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
                <div class="alert-info">No responses yet. Add the first one below.</div>
            @endforelse
        </div>

        {{-- Add Response --}}
        <div class="card card-body mt-4">
            <h3 class="text-sm font-semibold text-slate-300 mb-3">Add a Response</h3>
            <form method="POST" action="{{ route('department.complaints.respond', $complaint) }}" class="space-y-4">
                @csrf
                <div>
                    <textarea name="body" rows="4" class="form-textarea @error('body') border-rose-500 @enderror"
                        placeholder="Provide a detailed response to this complaint...">{{ old('body') }}</textarea>
                    @error('body')<p class="form-error">{{ $message }}</p>@enderror
                </div>
                <div class="flex justify-end">
                    <button type="submit" class="btn-primary">
                        <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                        Send Response
                    </button>
                </div>
            </form>
        </div>
    </div>
</x-app-layout>
