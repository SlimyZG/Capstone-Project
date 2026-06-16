<x-app-layout>
    <x-slot name="title">Create User</x-slot>

    <div class="max-w-xl mx-auto animate-fade-up">
        <div class="page-header">
            <div>
                <h1 class="page-title">Create User</h1>
                <p class="page-subtitle">Add a new student or department account</p>
            </div>
            <a href="{{ route('admin.users.index') }}" class="btn-secondary">← Back</a>
        </div>

        <div class="card card-body">
            <form method="POST" action="{{ route('admin.users.store') }}" class="space-y-5">
                @csrf

                <div class="form-group">
                    <label for="name" class="form-label">Full Name <span class="text-rose-400">*</span></label>
                    <input id="name" name="name" type="text" value="{{ old('name') }}"
                        class="form-input @error('name') border-rose-500 @enderror" required />
                    @error('name')<p class="form-error">{{ $message }}</p>@enderror
                </div>

                <div class="form-group">
                    <label for="email" class="form-label">Email <span class="text-rose-400">*</span></label>
                    <input id="email" name="email" type="email" value="{{ old('email') }}"
                        class="form-input @error('email') border-rose-500 @enderror" required />
                    @error('email')<p class="form-error">{{ $message }}</p>@enderror
                </div>

                <div class="form-group">
                    <label for="role" class="form-label">Role <span class="text-rose-400">*</span></label>
                    <div class="relative">
                        <select id="role" name="role" class="form-select @error('role') border-rose-500 @enderror"
                            onchange="document.getElementById('dept-field').classList.toggle('hidden', this.value !== 'department')" required>
                            <option value="" disabled {{ old('role') ? '' : 'selected' }}>Choose role...</option>
                            <option value="student" {{ old('role') === 'student' ? 'selected' : '' }}>Student</option>
                            <option value="department" {{ old('role') === 'department' ? 'selected' : '' }}>Department</option>
                        </select>
                        <div class="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                            <svg class="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
                        </div>
                    </div>
                    @error('role')<p class="form-error">{{ $message }}</p>@enderror
                </div>

                <div id="dept-field" class="{{ old('role') === 'department' ? '' : 'hidden' }} form-group">
                    <label for="department_id" class="form-label">Department <span class="text-rose-400">*</span></label>
                    <div class="relative">
                        <select id="department_id" name="department_id" class="form-select @error('department_id') border-rose-500 @enderror">
                            <option value="">Select department...</option>
                            @foreach($departments as $dept)
                                <option value="{{ $dept->id }}" {{ old('department_id') == $dept->id ? 'selected' : '' }}>{{ $dept->name }}</option>
                            @endforeach
                        </select>
                        <div class="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                            <svg class="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
                        </div>
                    </div>
                    @error('department_id')<p class="form-error">{{ $message }}</p>@enderror
                </div>

                <div class="form-group">
                    <label for="password" class="form-label">Password <span class="text-rose-400">*</span></label>
                    <input id="password" name="password" type="password"
                        class="form-input @error('password') border-rose-500 @enderror"
                        placeholder="Min. 8 characters" required />
                    @error('password')<p class="form-error">{{ $message }}</p>@enderror
                </div>

                <div class="form-group">
                    <label for="password_confirmation" class="form-label">Confirm Password <span class="text-rose-400">*</span></label>
                    <input id="password_confirmation" name="password_confirmation" type="password"
                        class="form-input" placeholder="Repeat password" required />
                </div>

                <div class="flex items-center justify-between pt-2">
                    <a href="{{ route('admin.users.index') }}" class="btn-secondary">Cancel</a>
                    <button type="submit" class="btn-primary">Create User</button>
                </div>
            </form>
        </div>
    </div>
</x-app-layout>
