<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" class="h-full">
<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="csrf-token" content="{{ csrf_token() }}" />
    <title>{{ $title ?? 'UniComplaints' }} — University Student Complaints Portal</title>
    <meta name="description" content="A secure platform for students to voice concerns and departments to address them." />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
    @vite(['resources/css/app.css', 'resources/js/app.js'])
</head>
<body class="h-full bg-slate-950 text-slate-100 font-inter antialiased">

    {{-- ── Navigation ───────────────────────────────────────────────────────── --}}
    <nav class="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/80 backdrop-blur-xl">
        <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div class="flex h-16 items-center justify-between">

                {{-- Brand --}}
                <a href="{{ url('/') }}" class="flex items-center gap-2 group">
                    <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/25 group-hover:shadow-indigo-500/40 transition-shadow">
                        <svg class="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                        </svg>
                    </div>
                    <span class="text-lg font-bold tracking-tight">
                        <span class="text-white">Uni</span><span class="text-indigo-400">Complaints</span>
                    </span>
                </a>

                {{-- Nav Links --}}
                <div class="hidden sm:flex items-center gap-1">
                    @auth
                        @if(auth()->user()->isAdmin())
                            <a href="{{ route('admin.dashboard') }}" class="nav-link {{ request()->routeIs('admin.dashboard') ? 'nav-link-active' : '' }}">Dashboard</a>
                            <a href="{{ route('admin.users.index') }}" class="nav-link {{ request()->routeIs('admin.users.*') ? 'nav-link-active' : '' }}">Users</a>
                            <a href="{{ route('admin.complaints.index') }}" class="nav-link {{ request()->routeIs('admin.complaints.*') ? 'nav-link-active' : '' }}">Complaints</a>
                        @elseif(auth()->user()->isDepartment())
                            <a href="{{ route('department.dashboard') }}" class="nav-link {{ request()->routeIs('department.*') ? 'nav-link-active' : '' }}">My Queue</a>
                        @else
                            <a href="{{ route('student.dashboard') }}" class="nav-link {{ request()->routeIs('student.dashboard') ? 'nav-link-active' : '' }}">Feed</a>
                            <a href="{{ route('student.complaints.index') }}" class="nav-link {{ request()->routeIs('student.complaints.*') ? 'nav-link-active' : '' }}">My Complaints</a>
                            <a href="{{ route('student.complaints.create') }}" class="nav-link {{ request()->routeIs('student.complaints.create') ? 'nav-link-active' : '' }}">+ New</a>
                        @endif
                    @endauth
                </div>

                {{-- Right: user menu --}}
                <div class="flex items-center gap-3">
                    @auth
                        <div class="relative" x-data="{ open: false }">
                            <button @click="open = !open" class="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors">
                                <span class="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold">
                                    {{ strtoupper(substr(auth()->user()->name, 0, 1)) }}
                                </span>
                                <span class="hidden sm:block max-w-[120px] truncate">{{ auth()->user()->name }}</span>
                                <svg class="h-4 w-4 transition-transform" :class="open && 'rotate-180'" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
                            </button>
                            <div x-show="open" @click.away="open = false" x-transition
                                class="absolute right-0 mt-2 w-52 origin-top-right rounded-xl border border-slate-700 bg-slate-900 shadow-xl shadow-black/50 py-1">
                                <div class="px-4 py-2 border-b border-slate-800">
                                    <p class="text-xs text-slate-500">Signed in as</p>
                                    <p class="text-sm font-medium text-white truncate">{{ auth()->user()->email }}</p>
                                    <span class="mt-1 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium
                                        {{ auth()->user()->isAdmin() ? 'bg-violet-900/50 text-violet-300' : (auth()->user()->isDepartment() ? 'bg-sky-900/50 text-sky-300' : 'bg-emerald-900/50 text-emerald-300') }}">
                                        {{ ucfirst(auth()->user()->role) }}
                                    </span>
                                </div>
                                <a href="{{ route('profile.edit') }}" class="dropdown-item">Profile Settings</a>
                                <form method="POST" action="{{ route('logout') }}">
                                    @csrf
                                    <button type="submit" class="dropdown-item w-full text-left text-rose-400 hover:text-rose-300">Sign Out</button>
                                </form>
                            </div>
                        </div>
                    @else
                        <a href="{{ route('login') }}" class="btn-outline text-sm">Sign In</a>
                    @endauth
                </div>
            </div>
        </div>
    </nav>

    {{-- ── Flash Messages ────────────────────────────────────────────────────── --}}
    @if(session('success'))
        <div id="flash-success" class="fixed top-20 right-4 z-50 flex items-center gap-3 rounded-xl border border-emerald-700 bg-emerald-900/90 px-4 py-3 text-emerald-200 shadow-xl backdrop-blur-sm animate-slide-in">
            <svg class="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
            <span class="text-sm font-medium">{{ session('success') }}</span>
            <button onclick="document.getElementById('flash-success').remove()" class="ml-2 text-emerald-400 hover:text-white">&times;</button>
        </div>
    @endif
    @if(session('error'))
        <div id="flash-error" class="fixed top-20 right-4 z-50 flex items-center gap-3 rounded-xl border border-rose-700 bg-rose-900/90 px-4 py-3 text-rose-200 shadow-xl backdrop-blur-sm animate-slide-in">
            <svg class="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <span class="text-sm font-medium">{{ session('error') }}</span>
            <button onclick="document.getElementById('flash-error').remove()" class="ml-2 text-rose-400 hover:text-white">&times;</button>
        </div>
    @endif

    {{-- ── Page Content ─────────────────────────────────────────────────────── --}}
    <main class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {{ $slot }}
    </main>

    <script>
        // Auto-dismiss flash messages
        setTimeout(() => {
            ['flash-success','flash-error'].forEach(id => {
                const el = document.getElementById(id);
                if (el) el.style.opacity = '0', el.style.transition = 'opacity 0.5s', setTimeout(() => el.remove(), 500);
            });
        }, 4000);
    </script>
</body>
</html>
