<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('games', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->unsignedTinyInteger('board_size');
            $table->string('mode', 10);              // ai | local
            $table->string('player_color', 5);       // black | white (user's colour vs AI)
            $table->decimal('black_score', 6, 1);
            $table->decimal('white_score', 6, 1);
            $table->decimal('komi', 4, 1);
            $table->string('winner', 5);             // black | white
            $table->boolean('user_won')->nullable(); // null for local games
            $table->string('result', 20);            // e.g. "B+3.5", "W+R"
            $table->unsignedSmallInteger('moves');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('games');
    }
};
