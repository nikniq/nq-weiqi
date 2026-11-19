/* NQ Weiqi — client-side Go engine, simple AI, canvas renderer. */
(() => {
    const EMPTY = 0, BLACK = 1, WHITE = 2;
    const KOMI = 6.5;
    const other = c => 3 - c;
    const name = c => (c === BLACK ? 'black' : 'white');

    const $ = id => document.getElementById(id);
    const canvas = $('board'), ctx = canvas.getContext('2d');

    let S; // game state

    // ---------- rules ----------
    function neighbors(i, n) {
        const x = i % n, y = (i / n) | 0, r = [];
        if (x > 0) r.push(i - 1);
        if (x < n - 1) r.push(i + 1);
        if (y > 0) r.push(i - n);
        if (y < n - 1) r.push(i + n);
        return r;
    }

    function group(board, n, start) {
        const color = board[start], stones = [], libs = new Set(), seen = new Set([start]), stack = [start];
        while (stack.length) {
            const p = stack.pop();
            stones.push(p);
            for (const q of neighbors(p, n)) {
                if (board[q] === EMPTY) libs.add(q);
                else if (board[q] === color && !seen.has(q)) { seen.add(q); stack.push(q); }
            }
        }
        return { stones, libs };
    }

    /** Returns {board, captured, ko} or null if illegal. */
    function play(board, n, i, color, ko) {
        if (board[i] !== EMPTY || i === ko) return null;
        const b = board.slice();
        b[i] = color;
        let captured = [];
        for (const q of neighbors(i, n)) {
            if (b[q] === other(color)) {
                const g = group(b, n, q);
                if (g.libs.size === 0) { for (const s of g.stones) b[s] = EMPTY; captured = captured.concat(g.stones); }
            }
        }
        const own = group(b, n, i);
        if (own.libs.size === 0) return null; // suicide
        const newKo = captured.length === 1 && own.stones.length === 1 && own.libs.size === 1 ? captured[0] : -1;
        return { board: b, captured: captured.length, ko: newKo };
    }

    function score(board, n) {
        let black = 0, white = 0;
        const seen = new Uint8Array(n * n);
        for (let i = 0; i < n * n; i++) {
            if (board[i] === BLACK) black++;
            else if (board[i] === WHITE) white++;
            else if (!seen[i]) {
                const region = [], borders = new Set(), stack = [i];
                seen[i] = 1;
                while (stack.length) {
                    const p = stack.pop();
                    region.push(p);
                    for (const q of neighbors(p, n)) {
                        if (board[q] === EMPTY) { if (!seen[q]) { seen[q] = 1; stack.push(q); } }
                        else borders.add(board[q]);
                    }
                }
                if (borders.size === 1) borders.has(BLACK) ? (black += region.length) : (white += region.length);
            }
        }
        return { black, white: white + KOMI };
    }

    // ---------- AI ----------
    function isOwnEye(board, n, i, color) {
        return neighbors(i, n).every(q => board[q] === color);
    }

    function aiMove(color) {
        const { board, size: n, ko } = S;
        let best = -1, bestScore = -Infinity;
        const center = (n - 1) / 2;
        const stonesOnBoard = board.reduce((a, v) => a + (v ? 1 : 0), 0);

        for (let i = 0; i < n * n; i++) {
            if (board[i] !== EMPTY || isOwnEye(board, n, i, color)) continue;
            const r = play(board, n, i, color, ko);
            if (!r) continue;
            let s = Math.random() * 2;
            s += r.captured * 12;

            const own = group(r.board, n, i);
            if (own.libs.size === 1) s -= 10 + own.stones.length * 2;   // self-atari
            else if (own.libs.size === 2) s -= 1;
            else s += Math.min(own.libs.size, 4) * 0.5;

            for (const q of neighbors(i, n)) {
                // rescue own groups that were in atari
                if (board[q] === color) {
                    const before = group(board, n, q);
                    if (before.libs.size === 1 && own.libs.size > 1) s += 8 + before.stones.length * 2;
                }
                // put opponent in atari / reduce liberties
                if (r.board[q] === other(color)) {
                    const g = group(r.board, n, q);
                    if (g.libs.size === 1) s += 4 + g.stones.length;
                    else if (g.libs.size === 2) s += 1;
                }
            }

            // opening shape: prefer 3rd/4th line, avoid edges
            const x = i % n, y = (i / n) | 0;
            const edge = Math.min(x, y, n - 1 - x, n - 1 - y);
            if (edge === 0) s -= 3;
            else if (edge === 1 && stonesOnBoard < n * 2) s -= 1;
            if (stonesOnBoard < n) s += (edge === 2 || edge === 3) ? 2 : 0;
            s -= (Math.abs(x - center) + Math.abs(y - center)) * 0.05;

            // territory: playing inside own territory late is wasteful
            const ns = neighbors(i, n);
            if (ns.every(q => board[q] !== other(color)) && ns.filter(q => board[q] === color).length >= 2) s -= 2;

            if (s > bestScore) { bestScore = s; best = i; }
        }
        if (best === -1 || bestScore < -4) return -1; // pass
        // if the human just passed and we're ahead, pass too
        if (S.passes === 1) {
            const sc = score(board, n);
            const mine = color === BLACK ? sc.black - sc.white : sc.white - sc.black;
            if (mine > 0 && bestScore < 6) return -1;
        }
        return best;
    }

    // ---------- game flow ----------
    function newGame() {
        const n = +$('size').value, mode = $('mode').value;
        S = {
            size: n, mode, human: mode === 'ai' ? ($('color').value === 'black' ? BLACK : WHITE) : null,
            board: new Int8Array(n * n), turn: BLACK, caps: { 1: 0, 2: 0 }, ko: -1, passes: 0,
            last: -1, moves: 0, over: false, history: [], hover: -1, thinking: false,
        };
        $('result').hidden = true;
        render(); updateUI();
        maybeAI();
    }

    function snapshot() {
        S.history.push({ board: S.board, turn: S.turn, caps: { ...S.caps }, ko: S.ko, passes: S.passes, last: S.last, moves: S.moves });
    }

    function doMove(i) {
        if (S.over) return false;
        if (i === -1) {
            snapshot();
            S.passes++; S.ko = -1; S.last = -1; S.moves++;
            S.turn = other(S.turn);
            if (S.passes >= 2) return finish(null), true;
        } else {
            const r = play(S.board, S.size, i, S.turn, S.ko);
            if (!r) return false;
            snapshot();
            S.board = r.board; S.ko = r.ko; S.caps[S.turn] += r.captured;
            S.passes = 0; S.last = i; S.moves++;
            S.turn = other(S.turn);
        }
        render(); updateUI();
        return true;
    }

    function maybeAI() {
        if (S.over || S.mode !== 'ai' || S.turn === S.human) return;
        S.thinking = true; updateUI();
        setTimeout(() => {
            S.thinking = false;
            const m = aiMove(S.turn);
            if (m === -1) flash('Computer passes');
            doMove(m);
        }, 350);
    }

    function finish(resigned) {
        S.over = true;
        const sc = score(S.board, S.size);
        let winner, result;
        if (resigned) {
            winner = other(resigned);
            result = (winner === BLACK ? 'B' : 'W') + '+R';
        } else {
            winner = sc.black > sc.white ? BLACK : WHITE;
            result = (winner === BLACK ? 'B+' : 'W+') + Math.abs(sc.black - sc.white);
        }
        let msg = `<b>${winner === BLACK ? 'Black' : 'White'} wins (${result})</b><br>Black ${sc.black} · White ${sc.white} (incl. komi ${KOMI})`;
        if (S.mode === 'ai') msg = `<b>${winner === S.human ? 'You win! 🎉' : 'Computer wins.'}</b><br>` + msg;
        $('result').innerHTML = msg;
        $('result').hidden = false;
        render(); updateUI();
        save({ sc, winner, result });
    }

    async function save({ sc, winner, result }) {
        if (!window.WEIQI.loggedIn) {
            $('result').insertAdjacentHTML('beforeend', '<br><span class="small">Log in to record your score.</span>');
            return;
        }
        try {
            const res = await fetch(window.WEIQI.saveUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json', 'Accept': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name=csrf-token]').content,
                },
                body: JSON.stringify({
                    board_size: S.size, mode: S.mode, player_color: name(S.human ?? BLACK),
                    black_score: sc.black, white_score: sc.white, komi: KOMI,
                    winner: name(winner), result, moves: S.moves,
                }),
            });
            const ok = res.ok;
            $('result').insertAdjacentHTML('beforeend', `<br><span class="small">${ok ? '✓ Score saved.' : 'Could not save score.'}</span>`);
        } catch {
            $('result').insertAdjacentHTML('beforeend', '<br><span class="small">Could not save score.</span>');
        }
    }

    function undo() {
        if (S.over || S.thinking || !S.history.length) return;
        let steps = S.mode === 'ai' ? 2 : 1;
        while (steps-- && S.history.length) Object.assign(S, S.history.pop());
        if (S.mode === 'ai' && S.turn !== S.human && S.history.length) Object.assign(S, S.history.pop());
        render(); updateUI();
        maybeAI();
    }

    let flashTimer;
    function flash(t) { S.flash = t; clearTimeout(flashTimer); flashTimer = setTimeout(() => { S.flash = null; updateUI(); }, 1500); }

    function updateUI() {
        const humanTurn = !S.over && !S.thinking && (S.mode === 'local' || S.turn === S.human);
        let st = S.over ? 'Game over' : S.thinking ? 'Computer is thinking…' :
            `${S.turn === BLACK ? '⚫ Black' : '⚪ White'} to play` + (S.mode === 'ai' ? (S.turn === S.human ? ' (you)' : '') : '');
        if (S.flash && !S.over) st = S.flash + ' — ' + st;
        $('status').textContent = st;
        $('cap-b').textContent = S.caps[BLACK];
        $('cap-w').textContent = S.caps[WHITE];
        $('pass').disabled = $('resign').disabled = !humanTurn;
        $('undo').disabled = !humanTurn || !S.history.length;
        $('color-row').style.display = $('mode').value === 'ai' ? '' : 'none';
    }

    // ---------- rendering ----------
    function geom() {
        const W = canvas.width, n = S.size, pad = W / (n + 1);
        return { W, n, pad, cell: (W - 2 * pad) / (n - 1) };
    }

    function render() {
        const { W, n, pad, cell } = geom();
        const g = ctx.createLinearGradient(0, 0, W, W);
        g.addColorStop(0, '#e3b56b'); g.addColorStop(1, '#c9944a');
        ctx.fillStyle = g; ctx.fillRect(0, 0, W, W);

        ctx.strokeStyle = '#3a2a14'; ctx.lineWidth = 1;
        for (let k = 0; k < n; k++) {
            const p = pad + k * cell;
            ctx.beginPath(); ctx.moveTo(pad, p); ctx.lineTo(W - pad, p); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(p, pad); ctx.lineTo(p, W - pad); ctx.stroke();
        }
        const stars = n === 19 ? [3, 9, 15] : n === 13 ? [3, 6, 9] : [2, 4, 6];
        ctx.fillStyle = '#3a2a14';
        for (const x of stars) for (const y of stars) {
            if (n === 9 && (x === 4) !== (y === 4)) continue;
            ctx.beginPath(); ctx.arc(pad + x * cell, pad + y * cell, Math.max(2.5, cell * 0.1), 0, 7); ctx.fill();
        }

        const r = cell * 0.47;
        for (let i = 0; i < n * n; i++) {
            if (S.board[i]) drawStone(i, S.board[i], r, 1);
        }
        if (!S.over && S.hover >= 0 && S.board[S.hover] === EMPTY) drawStone(S.hover, S.turn, r, 0.45);
        if (S.last >= 0) {
            const x = pad + (S.last % n) * cell, y = pad + ((S.last / n) | 0) * cell;
            ctx.strokeStyle = S.board[S.last] === BLACK ? '#fff' : '#000'; ctx.lineWidth = 2;
            ctx.beginPath(); ctx.arc(x, y, r * 0.45, 0, 7); ctx.stroke();
        }
        if (S.over) drawTerritory();
    }

    function drawStone(i, color, r, alpha) {
        const { n, pad, cell } = geom();
        const x = pad + (i % n) * cell, y = pad + ((i / n) | 0) * cell;
        ctx.globalAlpha = alpha;
        const g = ctx.createRadialGradient(x - r * 0.35, y - r * 0.35, r * 0.1, x, y, r);
        if (color === BLACK) { g.addColorStop(0, '#666'); g.addColorStop(1, '#111'); }
        else { g.addColorStop(0, '#fff'); g.addColorStop(1, '#cfcac0'); }
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill();
        ctx.globalAlpha = 1;
    }

    function drawTerritory() {
        const { n, pad, cell } = geom(), b = S.board, seen = new Uint8Array(n * n);
        for (let i = 0; i < n * n; i++) {
            if (b[i] || seen[i]) continue;
            const region = [], borders = new Set(), stack = [i]; seen[i] = 1;
            while (stack.length) {
                const p = stack.pop(); region.push(p);
                for (const q of neighbors(p, n)) b[q] ? borders.add(b[q]) : (!seen[q] && (seen[q] = 1, stack.push(q)));
            }
            if (borders.size !== 1) continue;
            ctx.fillStyle = borders.has(BLACK) ? '#111' : '#fff';
            for (const p of region) {
                const s = cell * 0.3;
                ctx.fillRect(pad + (p % n) * cell - s / 2, pad + ((p / n) | 0) * cell - s / 2, s, s);
            }
        }
    }

    function pointFromEvent(e) {
        const rect = canvas.getBoundingClientRect(), { n, pad, cell, W } = geom();
        const sx = (e.clientX - rect.left) * (W / rect.width), sy = (e.clientY - rect.top) * (W / rect.height);
        const x = Math.round((sx - pad) / cell), y = Math.round((sy - pad) / cell);
        return x >= 0 && y >= 0 && x < n && y < n ? y * n + x : -1;
    }

    // ---------- events ----------
    canvas.addEventListener('click', e => {
        if (S.over || S.thinking || (S.mode === 'ai' && S.turn !== S.human)) return;
        const i = pointFromEvent(e);
        if (i < 0) return;
        if (doMove(i)) maybeAI();
        else if (S.board[i] === EMPTY) { flash(i === S.ko ? 'Ko — play elsewhere first' : 'Illegal move (suicide)'); updateUI(); }
    });
    canvas.addEventListener('mousemove', e => { const i = pointFromEvent(e); if (i !== S.hover) { S.hover = i; render(); } });
    canvas.addEventListener('mouseleave', () => { S.hover = -1; render(); });
    $('new').addEventListener('click', newGame);
    $('mode').addEventListener('change', updateUI);
    $('pass').addEventListener('click', () => { if (doMove(-1)) maybeAI(); });
    $('undo').addEventListener('click', undo);
    $('resign').addEventListener('click', () => {
        if (!confirm('Resign this game?')) return;
        snapshot();
        finish(S.mode === 'ai' ? S.human : S.turn);
    });

    newGame();
})();
