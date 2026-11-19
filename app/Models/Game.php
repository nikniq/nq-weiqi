<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Game extends Model
{
    protected $fillable = [
        'board_size', 'mode', 'player_color', 'black_score', 'white_score',
        'komi', 'winner', 'user_won', 'result', 'moves',
    ];

    protected function casts(): array
    {
        return ['user_won' => 'boolean'];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
