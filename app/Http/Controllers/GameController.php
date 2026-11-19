<?php

namespace App\Http\Controllers;

use App\Models\Game;
use App\Models\User;
use Illuminate\Http\Request;

class GameController extends Controller
{
    public function play()
    {
        return view('play');
    }

    /** Save a finished game for the logged-in user (called via fetch from the board). */
    public function store(Request $request)
    {
        $data = $request->validate([
            'board_size' => ['required', 'integer', 'in:9,13,19'],
            'mode' => ['required', 'in:ai,local'],
            'player_color' => ['required', 'in:black,white'],
            'black_score' => ['required', 'numeric', 'min:0', 'max:400'],
            'white_score' => ['required', 'numeric', 'min:0', 'max:400'],
            'komi' => ['required', 'numeric', 'min:0', 'max:20'],
            'winner' => ['required', 'in:black,white'],
            'result' => ['required', 'string', 'max:20'],
            'moves' => ['required', 'integer', 'min:0', 'max:2000'],
        ]);

        $data['user_won'] = $data['mode'] === 'ai' ? $data['winner'] === $data['player_color'] : null;

        $game = $request->user()->games()->create($data);

        return response()->json(['saved' => true, 'id' => $game->id]);
    }

    public function history(Request $request)
    {
        $games = $request->user()->games()->latest()->paginate(20);
        $stats = [
            'played' => $request->user()->games()->where('mode', 'ai')->count(),
            'won' => $request->user()->games()->where('user_won', true)->count(),
        ];

        return view('history', compact('games', 'stats'));
    }

    public function leaderboard()
    {
        $leaders = User::query()
            ->withCount([
                'games as wins' => fn ($q) => $q->where('user_won', true),
                'games as played' => fn ($q) => $q->where('mode', 'ai'),
            ])
            ->whereHas('games', fn ($q) => $q->where('mode', 'ai'))
            ->orderByDesc('wins')
            ->orderBy('played')
            ->limit(50)
            ->get();

        return view('leaderboard', compact('leaders'));
    }
}
