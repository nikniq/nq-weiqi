<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class WeiqiTest extends TestCase
{
    use RefreshDatabase;

    private array $game = [
        'board_size' => 9, 'mode' => 'ai', 'player_color' => 'black', 'black_score' => 45,
        'white_score' => 42.5, 'komi' => 6.5, 'winner' => 'black', 'result' => 'B+2.5', 'moves' => 80,
    ];

    public function test_guest_can_play_and_view_leaderboard(): void
    {
        $this->get('/')->assertOk()->assertSee('board');
        $this->get('/leaderboard')->assertOk();
    }

    public function test_guest_cannot_save_scores(): void
    {
        $this->postJson('/games', $this->game)->assertUnauthorized();
    }

    public function test_register_then_save_score(): void
    {
        $this->post('/register', ['name' => 'Ann', 'email' => 'a@example.com', 'password' => 'secret123', 'password_confirmation' => 'secret123'])
            ->assertRedirect('/');
        $this->postJson('/games', $this->game)->assertOk()->assertJson(['saved' => true]);
        $this->assertDatabaseHas('games', ['result' => 'B+2.5', 'user_won' => true]);
        $this->get('/my-games')->assertOk()->assertSee('B+2.5');
        $this->get('/leaderboard')->assertSee('Ann');
    }

    public function test_login_and_logout(): void
    {
        $u = User::factory()->create(['password' => 'secret123']);
        $this->post('/login', ['email' => $u->email, 'password' => 'secret123'])->assertRedirect('/');
        $this->assertAuthenticated();
        $this->post('/logout')->assertRedirect('/');
        $this->assertGuest();
    }
}
