@extends('layout')
@section('title', 'Leaderboard')
@section('content')
<h1>Leaderboard</h1>
<p class="small">Wins against the computer.</p>
@if ($leaders->isEmpty())
    <p>No recorded games yet.</p>
@else
<table class="table">
    <thead><tr><th>#</th><th>Player</th><th>Wins</th><th>Played</th><th>Win rate</th></tr></thead>
    <tbody>
    @foreach ($leaders as $i => $u)
        <tr>
            <td>{{ $i + 1 }}</td>
            <td>{{ $u->name }}</td>
            <td>{{ $u->wins }}</td>
            <td>{{ $u->played }}</td>
            <td>{{ round($u->wins / $u->played * 100) }}%</td>
        </tr>
    @endforeach
    </tbody>
</table>
@endif
@endsection
