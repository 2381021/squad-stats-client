<script>
    import { page } from '$app/stores';
    import { onMount, onDestroy } from 'svelte';
    import { fly, scale } from 'svelte/transition';

    const gameId = $page.params.id;
    let game = null;
    let gameTime = 0;
    let isTimerRunning = false;
    let timerInterval = null;
    let activePlayerIndices = new Set(); 

    onMount(async () => {
        const res = await fetch(`https://squad-stats-server.vercel.app//api/games/${gameId}`);
        if (res.ok) {
            game = await res.json();
            game.players.forEach(p => {
                if (!p.secondsPlayed) p.secondsPlayed = p.minutes * 60; 
            });
        }
    });

    onDestroy(() => { if (timerInterval) clearInterval(timerInterval); });

    function toggleTimer() {
        if (isTimerRunning) {
            clearInterval(timerInterval);
            isTimerRunning = false;
        } else {
            isTimerRunning = true;
            timerInterval = setInterval(() => {
                gameTime++;
                activePlayerIndices.forEach(index => {
                    if (!game.players[index].secondsPlayed) game.players[index].secondsPlayed = 0;
                    game.players[index].secondsPlayed++;
                    game.players[index].minutes = parseFloat((game.players[index].secondsPlayed / 60).toFixed(1));
                });
                game = game;
            }, 1000);
        }
    }

    function toggleSubstitution(index) {
        if (activePlayerIndices.has(index)) {
            activePlayerIndices.delete(index);
        } else {
            if (activePlayerIndices.size >= 5) { alert("Max 5 Players!"); return; }
            activePlayerIndices.add(index);
        }
        activePlayerIndices = activePlayerIndices;
    }

    function formatTime(seconds) {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }

    function updateStat(playerIndex, statType, value) {
        if (!activePlayerIndices.has(playerIndex)) return;
        const newValue = game.players[playerIndex][statType] + value;
        if (newValue >= 0) {
            game.players[playerIndex][statType] = newValue;
            game = game;
        }
    }

    async function saveGame() {
        await fetch(`https://squad-stats-server.vercel.app//api/games/${gameId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(game)
        });
        alert("✅ GAME SAVED");
    }
</script>

<main in:fly={{ y: 20, duration: 400 }}>
    {#if game}
        <header class="scoreboard">
            <div class="matchup">
                <h1>VS. <span class="opp-name">{game.opponent}</span></h1>
            </div>
            
            <div class="clock-display {isTimerRunning ? 'active' : ''}">
                <div class="digital-time">{formatTime(gameTime)}</div>
                <button class="clock-control" on:click={toggleTimer}>
                    {isTimerRunning ? 'STOP' : 'START'}
                </button>
            </div>

            <button class="save-btn" on:click={saveGame}>SAVE</button>
        </header>

        <div class="grid">
            {#each game.players as player, index}
                <div 
                    class="player-card {activePlayerIndices.has(index) ? 'on-court' : 'bench'}"
                    in:scale={{ duration: 300, delay: index * 50 }}
                >
                    <div class="card-top">
                        <div class="jersey-num">{player.number}</div>
                        <div class="name-box">
                            <h3>{player.name}</h3>
                            <div class="minutes">MIN: {formatTime(player.secondsPlayed || 0)}</div>
                        </div>
                        
                        <div class="sub-toggle" on:click={() => toggleSubstitution(index)}>
                            <div class="knob"></div>
                        </div>
                    </div>

                    <div class="stats-grid">
                        <div class="stat-col">
                            <label>PTS</label>
                            <div class="val">{player.points}</div>
                            <div class="btns">
                                <button on:click={() => updateStat(index, 'points', 1)}>+1</button>
                                <button on:click={() => updateStat(index, 'points', 2)}>+2</button>
                                <button on:click={() => updateStat(index, 'points', 3)}>+3</button>
                            </div>
                        </div>
                        
                        <div class="mini-stats">
                            <div class="mini-row">
                                <span>REB: {player.rebounds}</span>
                                <button on:click={() => updateStat(index, 'rebounds', 1)}>+</button>
                            </div>
                            <div class="mini-row">
                                <span>AST: {player.assists}</span>
                                <button on:click={() => updateStat(index, 'assists', 1)}>+</button>
                            </div>
                            <div class="mini-row">
                                <span>STL: {player.steals}</span>
                                <button on:click={() => updateStat(index, 'steals', 1)}>+</button>
                            </div>
                        </div>
                    </div>
                </div>
            {/each}
        </div>
    {/if}
</main>

<style>
    /* SCOREBOARD */
    .scoreboard {
        background: black; border: 2px solid #333; border-radius: 15px;
        padding: 20px 40px; display: flex; justify-content: space-between; align-items: center;
        margin-bottom: 30px; box-shadow: 0 10px 30px rgba(0,0,0,0.5);
    }
    
    .opp-name { color: var(--brand-red); font-size: 2.5rem; text-shadow: 0 0 10px var(--brand-red); }

    .clock-display {
        text-align: center; background: #0f0f0f; padding: 15px 30px; border-radius: 10px; border: 1px solid #333;
    }
    .digital-time {
        font-family: 'Courier New', monospace; font-size: 3rem; color: #555; font-weight: bold; margin-bottom: 5px;
    }
    .clock-display.active .digital-time { color: #00ff66; text-shadow: 0 0 15px #00ff66; }
    
    .clock-control { width: 100%; font-size: 1rem; padding: 5px; background: #333; }

    .save-btn { background: #007bff; font-size: 1rem; padding: 10px 20px; border-radius: 5px; }

    /* PLAYER CARDS */
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 20px; }

    .player-card {
        background: #1a1a1a; border-radius: 12px; padding: 20px; border: 1px solid #333;
        transition: all 0.3s ease; position: relative; overflow: hidden;
    }

    /* ON COURT STATE */
    .on-court { border-color: #00ff66; box-shadow: 0 0 20px rgba(0, 255, 102, 0.1); }
    .on-court .jersey-num { color: #00ff66; }
    .on-court .knob { background: #00ff66; transform: translateX(20px); }
    .on-court .sub-toggle { border-color: #00ff66; }

    /* BENCH STATE */
    .bench { opacity: 0.6; filter: grayscale(0.8); }
    .bench:hover { opacity: 0.8; }
    .bench .stats-grid { pointer-events: none; }

    .card-top { display: flex; align-items: center; gap: 15px; margin-bottom: 20px; border-bottom: 1px solid #333; padding-bottom: 15px; }
    .jersey-num { font-size: 2rem; font-weight: bold; font-family: 'Oswald'; color: #444; }
    .name-box h3 { margin: 0; font-size: 1.4rem; }
    .minutes { font-family: monospace; color: #888; }

    /* Custom Toggle Switch */
    .sub-toggle { 
        margin-left: auto; width: 44px; height: 24px; border: 2px solid #555; 
        border-radius: 20px; position: relative; cursor: pointer; 
    }
    .knob { 
        width: 16px; height: 16px; background: #555; border-radius: 50%; 
        position: absolute; top: 2px; left: 2px; transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); 
    }

    /* STATS CONTROLS */
    .stat-col { text-align: center; margin-bottom: 15px; }
    .stat-col label { color: var(--brand-red); font-weight: bold; letter-spacing: 1px; }
    .stat-col .val { font-size: 2.5rem; font-family: 'Oswald'; font-weight: bold; }
    
    .btns { display: flex; justify-content: center; gap: 5px; }
    .btns button { background: #333; width: 40px; height: 40px; border-radius: 50%; padding: 0; font-size: 1rem; }
    .btns button:hover { background: white; color: black; transform: scale(1.1); }

    .mini-stats { display: flex; justify-content: space-between; }
    .mini-row { background: #222; padding: 5px 10px; border-radius: 5px; display: flex; align-items: center; gap: 10px; font-size: 0.9rem; }
    .mini-row button { padding: 2px 8px; font-size: 0.8rem; background: #444; }
</style>