# nq-weiqi

Weiqi (Go) game built on Laravel 13. The web root is `public_html/` (not `public/`).

- Anyone can play: against the computer, or two players on one device; 9×9, 13×13 or 19×19 boards.
- Registered users have their finished games saved, see them under **My games**, and appear on the **Leaderboard**.

## Setup

```bash
composer install
cp .env.example .env && php artisan key:generate
php artisan migrate
php artisan serve        # http://127.0.0.1:8000
```

On shared hosting, point the document root at `public_html/`. The path is set in `bootstrap/app.php`.

## Where things are

- Game engine, AI and canvas board: `public_html/js/weiqi.js`
- Styles: `public_html/css/weiqi.css`
- Controllers: `app/Http/Controllers/{GameController,AuthController}.php`
- Scoring is area scoring with komi 6.5. Scores are calculated in the browser and posted to `POST /games`.
