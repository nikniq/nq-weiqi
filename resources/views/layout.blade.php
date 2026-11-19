<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>@yield('title', 'Weiqi') · NQ Weiqi</title>
    <link rel="stylesheet" href="{{ asset('css/weiqi.css') }}">
</head>
<body>
<header class="topbar">
    <a href="{{ route('play') }}" class="brand">⚫⚪ NQ Weiqi</a>
    <nav>
        <a href="{{ route('play') }}">Play</a>
        <a href="{{ route('leaderboard') }}">Leaderboard</a>
        @auth
            <a href="{{ route('history') }}">My games</a>
            <form method="POST" action="{{ route('logout') }}" class="inline">
                @csrf
                <button type="submit" class="linklike">Logout ({{ auth()->user()->name }})</button>
            </form>
        @else
            <a href="{{ route('login') }}">Login</a>
            <a href="{{ route('register') }}" class="btn small">Register</a>
        @endauth
    </nav>
</header>
<main class="container">
    @yield('content')
</main>
<footer class="footer">
    <div class="footer-inner">
        <div>
            <a href="{{ route('play') }}" class="brand">⚫⚪ NQ Weiqi</a>
            <p class="small">Play Go (Weiqi) free in your browser. Part of the <a href="https://nikniq.com">nikniq.com</a> games family.</p>
        </div>
        <nav aria-label="Footer">
            <a href="{{ route('play') }}">Play</a>
            <a href="{{ route('leaderboard') }}">Leaderboard</a>
            @auth<a href="{{ route('history') }}">My games</a>@endauth
            <a href="https://nikniq.com">More games</a>
        </nav>
    </div>
    <p class="small copy">&copy; {{ date('Y') }} NQ Weiqi</p>
</footer>
@stack('scripts')
</body>
</html>
