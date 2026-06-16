<x-app-layout>
    <x-slot name="title">Edit User</x-slot>

    <div class="max-w-xl mx-auto animate-fade-up">
        <div class="page-header">
            <div>
                <h1 class="page-title">Edit User</h1>
                <p class="page-subtitle">Modify account details for {{ $user->name }}</p>
            </div>
            <a href="{{ route('admin.users.index') }}" class="btn-secondary">← Back</a>
        </div>

        <div class="card card-body">
            <form method="POST" action="{{ route('admin.users.update', $user) }}" class="space-y-5">
                @csrf @method('PUT')

                <div class="form-group">
                    <label for="name" class="form-label">Full Name <span class="text-rose-400">*</span></label>
                    <input id="name" name="name" type="text" value="{{ old('name', $user->name) }}"
                        class="form-input @error('name') border-rose-500 @enderror" required />
                    @error('name')<p class="form-error">{{ $message }}</p>@enderror
                </div>

                <div class="form-group">
                    <label for="email" class="form-label">Email <span class="text-rose-400">*</span></label>
                    <input id="email" name="email" type="email" value="{{ old('email', $user->email) }}"
                        class="form-input @error('email') border-rose-500 @enderror" required />
                    @error('email')<p class="form-error">{{ $message }}</p>@enderror
                </div>

                <div class="form-group">
                    <label for="role" class="form-label">Role <span class="text-rose-400">*</span></label>
                    <div class="relative">
                        <select id="role" name="role" class="form-select @error('role') border-rose-500 @enderror"
                            onchange="document.getElementById('dept-field').classList.toggle('hidden', this.value !== 'department')" required>
                            <option value="student" {{ old('role', $user->role) === 'student' ? 'selected' : '' }}>Student</option>
                            <option value="department" {{ old('role', $user->role) === 'department' ? 'selected' : '' }}>Department</option>
                        </select>
                        <div class="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                            <svg class="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
                        </div>
                    </div>
                    @error('role')<p class="form-error">{{ $message }}</p>@enderror
                </div>

                <div id="dept-field" class="{{ old('role', $user->role) === 'department' ? '' : 'hidden' }} form-group">
                    <label for="department_id" class="form-label">Department</label>
                    <div class="relative">
                        <select id="department_id" name="department_id" class="form-select">
                            <option value="">Select department...</option>
                            @foreach($departments as $dept)
                                <option value="{{ $dept->id }}" {{ old('department_id', $user->department_id) == $dept->id ? 'selected' : '' }}>{{ $dept->name }}</option>
                            @endforeach
                        </select>
                        <div class="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                            <svg class="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
                        </div>
                    </div>
                    @error('department_id')<p class="form-error">{{ $message }}</p>@enderror
                </div>

                <div class="divider"></div>
                <p class="text-xs text-slate-500">Leave password fields blank to keep the current password.</p>

                <div class="form-group">
                    <label for="password" class="form-label">New Password</label>
                    <input id="password" name="password" type="password"
                        class="form-input @error('password') border-rose-500 @enderror" placeholder="Min. 8 characters" />
                    @error('password')<p class="form-error">{{ $message }}</p>@enderror
                </div>

                <div class="form-group">
                    <label for="password_confirmation" class="form-label">Confirm New Password</label>
                    <input id="password_confirmation" name="password_confirmation" type="password" class="form-input" />
                </div>

                <div class="flex items-center justify-between pt-2">
                    <a href="{{ route('admin.users.index') }}" class="btn-secondary">Cancel</a>
                    <button type="submit" class="btn-primary">Save Changes</button>
                </div>
            </form>
        </div>
    </div>
</x-app-layout>
