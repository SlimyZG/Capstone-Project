<x-app-layout>
    <x-slot name="title">Dashboard</x-slot>

    <div class="animate-fade-up">
        {{-- Header --}}
        <div class="page-header">
            <div>
                <h1 class="page-title">Complaint Feed</h1>
                <p class="page-subtitle">Browse and engage with all submitted complaints</p>
            </div>
            <a href="{{ route('student.complaints.create') }}" class="btn-primary">
                <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" /></svg>
                New Complaint
            </a>
        </div>

        {{-- Complaint Cards --}}
        @if($complaints->isEmpty())
            <div class="empty-state">
                <div class="empty-state-icon">
                    <svg class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                </div>
                <h3 class="text-lg font-semibold text-slate-300">No complaints yet</h3>
                <p class="mt-1 text-sm text-slate-500">Be the first to submit a complaint.</p>
                <a href="{{ route('student.complaints.create') }}" class="btn-primary mt-4">Submit Complaint</a>
            </div>
        @else
            <div class="space-y-4 stagger">
                @foreach($complaints as $complaint)
                    <article class="card card-hover animate-fade-up group" onclick="window.location='{{ route('student.complaints.show', $complaint) }}'">
                        <div class="card-body flex gap-4">
                            {{-- Upvote --}}
                            <div class="flex flex-col items-center gap-1 shrink-0">
                                <form method="POST" action="{{ route('student.complaints.upvote', $complaint) }}" onclick="event.stopPropagation()">
                                    @csrf
                                    <button type="submit" class="upvote-btn {{ auth()->check() && $complaint->hasBeenUpvotedBy(auth()->user()) ? 'voted' : '' }}">
                                        <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" /></svg>
                                        <span class="text-xs font-bold">{{ $complaint->upvotes_count }}</span>
                                    </button>
                                </form>
                            </div>

                            {{-- Content --}}
                            <div class="flex-1 min-w-0">
                                <div class="flex flex-wrap items-center gap-2 mb-2">
                                    <span class="{{ $complaint->statusBadgeClass() }}">
                                        <span class="h-1.5 w-1.5 rounded-full bg-current animate-pulse-dot"></span>
                                        {{ $complaint->statusLabel() }}
                                    </span>
                                    <span class="text-xs text-slate-500">•</span>
                                    <span class="text-xs text-indigo-400 font-medium">{{ $complaint->department->name }}</span>
                                </div>

                                <h2 class="text-base font-semibold text-white group-hover:text-indigo-300 transition-colors truncate">
                                    {{ $complaint->title }}
                                </h2>

                                <p class="mt-1 text-sm text-slate-400 line-clamp-2">{{ $complaint->body }}</p>

                                <div class="mt-3 flex items-center gap-3 text-xs text-slate-500">
                                    <span>
                                        @if($complaint->is_anonymous)
                                            <span class="text-slate-400">🎭 Anonymous</span>
                                        @else
                                            <span>{{ $complaint->displayAuthor() }}</span>
                                        @endif
                                    </span>
                                    <span>•</span>
                                    <span>{{ $complaint->created_at->diffForHumans() }}</span>
                                    @if($complaint->responses->count())
                                        <span>•</span>
                                        <span>{{ $complaint->responses->count() }} {{ Str::plural('response', $complaint->responses->count()) }}</span>
                                    @endif
                                    @if($complaint->attachment_path)
                                        <span>•</span>
                                        <span class="text-indigo-400">📎 Attachment</span>
                                    @endif
                                </div>
                            </div>
                        </div>
                    </article>
                @endforeach
            </div>

            {{-- Pagination --}}
            <div class="mt-8">
                {{ $complaints->links('vendor.pagination.custom') }}
            </div>
        @endif
    </div>
</x-app-layout>
