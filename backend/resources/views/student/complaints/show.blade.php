<x-app-layout>
    <x-slot name="title">{{ $complaint->title }}</x-slot>

    <div class="max-w-3xl mx-auto animate-fade-up">
        {{-- Back --}}
        <a href="{{ url()->previous() }}" class="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white mb-6 transition-colors">
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            Back
        </a>

        {{-- Complaint Card --}}
        <div class="card card-body">
            {{-- Header --}}
            <div class="flex flex-col sm:flex-row sm:items-start gap-4">
                {{-- Upvote --}}
                <div class="flex sm:flex-col items-center gap-2">
                    <form method="POST" action="{{ route('student.complaints.upvote', $complaint) }}">
                        @csrf
                        <button type="submit" class="upvote-btn {{ $hasUpvoted ? 'voted' : '' }}">
                            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" /></svg>
                            <span class="text-sm font-bold">{{ $complaint->upvotes_count }}</span>
                        </button>
                    </form>
                </div>

                {{-- Content --}}
                <div class="flex-1">
                    <div class="flex flex-wrap items-center gap-2 mb-3">
                        <span class="{{ $complaint->statusBadgeClass() }}">
                            <span class="h-1.5 w-1.5 rounded-full bg-current animate-pulse-dot"></span>
                            {{ $complaint->statusLabel() }}
                        </span>
                        <span class="text-xs text-indigo-400 font-medium border border-indigo-800/50 bg-indigo-900/30 rounded-full px-2.5 py-1">
                            {{ $complaint->department->name }}
                        </span>
                        @if($complaint->is_anonymous)
                            <span class="text-xs text-slate-500 border border-slate-700 rounded-full px-2.5 py-1">🎭 Anonymous</span>
                        @endif
                    </div>

                    <h1 class="text-xl font-bold text-white">{{ $complaint->title }}</h1>

                    <p class="mt-1 text-xs text-slate-500">
                        Submitted by <strong class="text-slate-400">{{ $complaint->displayAuthor() }}</strong>
                        · {{ $complaint->created_at->format('F j, Y \a\t g:i A') }}
                    </p>
                </div>
            </div>

            <div class="divider"></div>

            {{-- Body --}}
            <div class="prose prose-invert max-w-none">
                <p class="text-slate-300 leading-relaxed whitespace-pre-wrap">{{ $complaint->body }}</p>
            </div>

            {{-- Attachment --}}
            @if($complaint->attachment_path)
                <div class="mt-6">
                    <h3 class="text-sm font-semibold text-slate-400 mb-2">Attachment</h3>
                    @php $ext = pathinfo($complaint->attachment_path, PATHINFO_EXTENSION); @endphp
                    @if(in_array(strtolower($ext), ['jpg','jpeg','png','gif']))
                        <img src="{{ Storage::url($complaint->attachment_path) }}" alt="Attachment"
                             class="max-h-64 rounded-xl border border-slate-700 object-cover" />
                    @else
                        <a href="{{ Storage::url($complaint->attachment_path) }}" target="_blank"
                           class="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm text-slate-300 hover:border-indigo-500 hover:text-white transition-colors">
                            <svg class="h-4 w-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                            Download Attachment
                        </a>
                    @endif
                </div>
            @endif
        </div>

        {{-- Responses --}}
        <div class="mt-6">
            <h2 class="text-lg font-bold text-white mb-4">
                Responses
                <span class="ml-2 text-sm font-normal text-slate-500">({{ $complaint->responses->count() }})</span>
            </h2>

            @if($complaint->responses->isEmpty())
                <div class="alert-info">No responses yet. The department will reply soon.</div>
            @else
                <div class="space-y-4">
                    @foreach($complaint->responses as $response)
                        <div class="card card-body animate-fade-up">
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
                    @endforeach
                </div>
            @endif
        </div>
    </div>
</x-app-layout>
