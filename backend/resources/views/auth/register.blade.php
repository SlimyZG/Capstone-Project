<x-guest-layout>
    <div class="mb-6 text-center">
        <h2 class="text-xl font-bold text-white">Student Registration</h2>
        <p class="text-sm text-slate-400 mt-1">Create an account to submit and track your complaints.</p>
    </div>

    <form method="POST" action="{{ route('register') }}" class="space-y-4">
        @csrf

        <!-- Name -->
        <div class="form-group">
            <label for="name" class="form-label">Full Name</label>
            <input id="name" type="text" name="name" value="{{ old('name') }}" required autofocus autocomplete="name"
                   class="form-input @error('name') border-rose-500 @enderror" placeholder="John Doe" />
            @error('name')<p class="form-error">{{ $message }}</p>@enderror
        </div>

        <!-- Email Address -->
        <div class="form-group">
            <label for="email" class="form-label">Email Address</label>
            <input id="email" type="email" name="email" value="{{ old('email') }}" required autocomplete="username"
                   class="form-input @error('email') border-rose-500 @enderror" placeholder="student@example.edu" />
            @error('email')<p class="form-error">{{ $message }}</p>@enderror
        </div>

        <!-- Password -->
        <div class="form-group">
            <label for="password" class="form-label">Password</label>
            <input id="password" type="password" name="password" required autocomplete="new-password"
                   class="form-input @error('password') border-rose-500 @enderror" placeholder="Min. 8 characters" />
            @error('password')<p class="form-error">{{ $message }}</p>@enderror
        </div>

        <!-- Confirm Password -->
        <div class="form-group">
            <label for="password_confirmation" class="form-label">Confirm Password</label>
            <input id="password_confirmation" type="password" name="password_confirmation" required autocomplete="new-password"
                   class="form-input" placeholder="Repeat password" />
            @error('password_confirmation')<p class="form-error">{{ $message }}</p>@enderror
        </div>

        <div class="alert-info text-xs mt-2">
            <strong>Note:</strong> Department and Admin accounts cannot be registered here. They are created internally by the administration.
        </div>

        <div class="flex items-center justify-between pt-4">
            <a class="text-sm text-indigo-400 hover:text-indigo-300 transition-colors" href="{{ route('login') }}">
                Already registered? Sign in
            </a>

            <button type="submit" class="btn-primary">
                Create Account
            </button>
        </div>
    </form>
</x-guest-layout>
