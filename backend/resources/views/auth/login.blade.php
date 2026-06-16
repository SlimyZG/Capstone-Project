<x-guest-layout>
    <!-- Session Status -->
    <x-auth-session-status class="mb-4" :status="session('status')" />

    <div class="mb-6 text-center">
        <h2 class="text-xl font-bold text-white">Sign In</h2>
        <p class="text-sm text-slate-400 mt-1">Welcome back! Please enter your details.</p>
    </div>

    <form method="POST" action="{{ route('login') }}" class="space-y-4">
        @csrf

        <!-- Email Address -->
        <div class="form-group">
            <label for="email" class="form-label">Email Address</label>
            <input id="email" class="form-input @error('email') border-rose-500 @enderror" type="email" name="email" :value="old('email')" required autofocus autocomplete="username" placeholder="name@example.edu" />
            @error('email')<p class="form-error">{{ $message }}</p>@enderror
        </div>

        <!-- Password -->
        <div class="form-group">
            <label for="password" class="form-label">Password</label>
            <input id="password" class="form-input @error('password') border-rose-500 @enderror" type="password" name="password" required autocomplete="current-password" placeholder="••••••••" />
            @error('password')<p class="form-error">{{ $message }}</p>@enderror
        </div>

        <!-- Remember Me & Forgot Password -->
        <div class="flex items-center justify-between">
            <label for="remember_me" class="inline-flex items-center group cursor-pointer">
                <input id="remember_me" type="checkbox" class="rounded border-slate-700 bg-slate-800 text-indigo-600 shadow-sm focus:ring-indigo-500 focus:ring-offset-slate-900" name="remember">
                <span class="ms-2 text-sm text-slate-400 group-hover:text-slate-300 transition-colors">Remember me</span>
            </label>

            @if (Route::has('password.request'))
                <a class="text-sm text-indigo-400 hover:text-indigo-300 transition-colors" href="{{ route('password.request') }}">
                    Forgot your password?
                </a>
            @endif
        </div>

        <div class="pt-4">
            <button type="submit" class="btn-primary w-full justify-center">
                Sign In
            </button>
        </div>
        
        <div class="text-center mt-6">
            <p class="text-sm text-slate-400">
                Don't have an account? 
                <a href="{{ route('register') }}" class="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">Register as a Student</a>
            </p>
        </div>
    </form>
</x-guest-layout>
