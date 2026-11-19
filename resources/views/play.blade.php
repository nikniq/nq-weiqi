@extends('layout')
@section('title', 'Play')
@section('content')
<div class="play">
    <section class="board-wrap">
        <canvas id="board" width="640" height="640"></canvas>
    </section>
    <aside class="panel">
        <h2>New game</h2>
        <label>Board
            <select id="size"><option value="9" selected>9 × 9</option><option value="13">13 × 13</option><option value="19">19 × 19</option></select>
        </label>
        <label>Opponent
            <select id="mode"><option value="ai" selected>Computer</option><option value="local">Two players (same device)</option></select>
        </label>
        <label id="color-row">You play
            <select id="color"><option value="black" selected>Black (first)</option><option value="white">White</option></select>
        </label>
        <button id="new" class="btn">Start new game</button>

        <h2>Game</h2>
        <p id="status" class="status">Black to play</p>
        <p>Captures — ⚫ <b id="cap-b">0</b> · ⚪ <b id="cap-w">0</b></p>
        <div class="row">
            <button id="pass" class="btn ghost">Pass</button>
            <button id="undo" class="btn ghost">Undo</button>
            <button id="resign" class="btn ghost">Resign</button>
        </div>
        <div id="result" class="result" hidden></div>

        @guest
            <p class="hint">Playing as guest. <a href="{{ route('login') }}">Log in</a> or <a href="{{ route('register') }}">register</a> to record your scores.</p>
        @else
            <p class="hint">Finished games are saved to <a href="{{ route('history') }}">My games</a>.</p>
        @endguest
        <p class="hint small">Area scoring (stones + territory), komi 6.5. Game ends after two consecutive passes; all stones on the board are counted as alive, so capture dead stones before passing.</p>
    </aside>
</div>
@endsection
@push('scripts')
<script>
    window.WEIQI = {
        loggedIn: @json(auth()->check()),
        saveUrl: @json(route('games.store')),
    };
</script>
<script src="{{ asset('js/weiqi.js') }}"></script>
@endpush
