@extends('layout')
@section('title', 'My games')
@section('content')
<h1>My games</h1>
<p>Versus computer: <b>{{ $stats['won'] }}</b> won of <b>{{ $stats['played'] }}</b> played.</p>
@if ($games->isEmpty())
    <p>No games yet. <a href="{{ route('play') }}">Play one!</a></p>
@else
<table class="table">
    <thead><tr><th>Date</th><th>Board</th><th>Opponent</th><th>You</th><th>Black</th><th>White</th><th>Result</th><th>Outcome</th></tr></thead>
    <tbody>
    @foreach ($games as $g)
        <tr>
            <td>{{ $g->created_at->format('Y-m-d H:i') }}</td>
            <td>{{ $g->board_size }}×{{ $g->board_size }}</td>
            <td>{{ $g->mode === 'ai' ? 'Computer' : 'Local' }}</td>
            <td>{{ $g->mode === 'ai' ? ucfirst($g->player_color) : '—' }}</td>
            <td>{{ $g->black_score }}</td>
            <td>{{ $g->white_score }}</td>
            <td>{{ $g->result }}</td>
            <td>@if (is_null($g->user_won)) — @elseif ($g->user_won)<span class="win">Won</span>@else<span class="loss">Lost</span>@endif</td>
        </tr>
    @endforeach
    </tbody>
</table>
{{ $games->links() }}
@endif
@endsection
