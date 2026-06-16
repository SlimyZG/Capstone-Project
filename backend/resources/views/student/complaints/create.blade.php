<x-app-layout>
    <x-slot name="title">Submit Complaint</x-slot>

    <div class="max-w-2xl mx-auto animate-fade-up">
        <div class="page-header">
            <div>
                <h1 class="page-title">Submit a Complaint</h1>
                <p class="page-subtitle">Your voice matters. We'll ensure it's heard.</p>
            </div>
        </div>

        <div class="card card-body">
            <form method="POST" action="{{ route('student.complaints.store') }}" enctype="multipart/form-data" class="space-y-6">
                @csrf

                {{-- Title --}}
                <div class="form-group">
                    <label for="title" class="form-label">Complaint Title <span class="text-rose-400">*</span></label>
                    <input id="title" name="title" type="text" value="{{ old('title') }}"
                        class="form-input @error('title') border-rose-500 @enderror"
                        placeholder="Brief summary of your concern..." required />
                    @error('title')<p class="form-error">{{ $message }}</p>@enderror
                </div>

                {{-- Department --}}
                <div class="form-group">
                    <label for="department_id" class="form-label">Department <span class="text-rose-400">*</span></label>
                    <div class="relative">
                        <select id="department_id" name="department_id"
                            class="form-select @error('department_id') border-rose-500 @enderror" required>
                            <option value="" disabled {{ old('department_id') ? '' : 'selected' }}>Select a department...</option>
                            @foreach($departments as $department)
                                <option value="{{ $department->id }}" {{ old('department_id') == $department->id ? 'selected' : '' }}>
                                    {{ $department->name }}
                                </option>
                            @endforeach
                        </select>
                        <div class="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                            <svg class="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
                        </div>
                    </div>
                    @error('department_id')<p class="form-error">{{ $message }}</p>@enderror
                </div>

                {{-- Body --}}
                <div class="form-group">
                    <label for="body" class="form-label">Details <span class="text-rose-400">*</span></label>
                    <textarea id="body" name="body" rows="6"
                        class="form-textarea @error('body') border-rose-500 @enderror"
                        placeholder="Describe your complaint in detail. Be specific about what happened, when, and any relevant context..." required>{{ old('body') }}</textarea>
                    @error('body')<p class="form-error">{{ $message }}</p>@enderror
                </div>

                {{-- Attachment --}}
                <div class="form-group">
                    <label for="attachment" class="form-label">Attachment <span class="text-slate-500 font-normal">(optional)</span></label>
                    <div class="relative">
                        <input id="attachment" name="attachment" type="file"
                            accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx"
                            class="w-full text-sm text-slate-400
                                   file:mr-4 file:rounded-lg file:border-0 file:bg-indigo-600 file:px-4 file:py-2
                                   file:text-sm file:font-semibold file:text-white file:cursor-pointer file:hover:bg-indigo-500
                                   file:transition-colors" />
                    </div>
                    <p class="mt-1 text-xs text-slate-500">Supports: JPG, PNG, PDF, DOC, DOCX — max 5MB</p>
                    @error('attachment')<p class="form-error">{{ $message }}</p>@enderror
                </div>

                {{-- Anonymous Toggle --}}
                <div class="rounded-xl border border-slate-700 bg-slate-800/40 p-4">
                    <label class="flex items-start gap-4 cursor-pointer group">
                        <div class="relative mt-0.5">
                            <input id="is_anonymous" name="is_anonymous" type="checkbox" value="1"
                                {{ old('is_anonymous') ? 'checked' : '' }}
                                class="sr-only peer" />
                            <div class="h-6 w-11 rounded-full border border-slate-600 bg-slate-700 transition-colors peer-checked:bg-indigo-600 peer-checked:border-indigo-600"></div>
                            <div class="absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5"></div>
                        </div>
                        <div>
                            <p class="text-sm font-semibold text-slate-200 group-hover:text-white transition-colors">Submit Anonymously</p>
                            <p class="mt-0.5 text-xs text-slate-500">Your identity will be completely hidden — not even administrators can link this complaint to you.</p>
                        </div>
                    </label>
                </div>

                {{-- Submit --}}
                <div class="flex items-center justify-between pt-2">
                    <a href="{{ route('student.dashboard') }}" class="btn-secondary">Cancel</a>
                    <button type="submit" class="btn-primary">
                        <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                        Submit Complaint
                    </button>
                </div>
            </form>
        </div>
    </div>
</x-app-layout>
