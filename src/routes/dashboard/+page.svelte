<script>
    import { selectedTeam } from '$lib/stores/teamStore';
    import { goto } from '$app/navigation';
    import { onMount } from 'svelte';
    import { fly } from 'svelte/transition';

    if (!$selectedTeam) goto('/');

    // (All previous Dashboard Logic for Roster/History)
    let newPlayerName = "";
    let newPlayerNumber = "";
    let editingPlayerId = null;
    let editName = "";
    let editNumber = "";
    let pastGames = [];

    onMount(async () => { loadHistory(); });

    async function loadHistory() {
        if (!$selectedTeam) return;
        const res = await fetch(`https://squad-stats-server.vercel.app//api/games/team/${$selectedTeam._id}`);
        pastGames = await res.json();
    }

    async function addPlayer() {
        if (!newPlayerName) return;
        const res = await fetch(`https://squad-stats-server.vercel.app//api/teams/${$selectedTeam._id}/players`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ name: newPlayerName, number: newPlayerNumber })
        });
        selectedTeam.set(await res.json());
        newPlayerName = ""; newPlayerNumber = "";
    }

    async function deletePlayer(id) {
        if(confirm("Remove player?")) {
            const res = await fetch(`https://squad-stats-server.vercel.app//api/teams/${$selectedTeam._id}/players/${id}`, { method: 'DELETE' });
            selectedTeam.set(await res.json());
        }
    }

    // ... (Keep existing Edit/Delete Game Logic if you have it, omitting for brevity but it works same as before)
    
    async function deleteGame(gameId) {
        if(confirm("Delete game record?")) {
            await fetch(`https://squad-stats-server.vercel.app//api/games/${gameId}`, { method: 'DELETE' });
            loadHistory();
        }
    }

    async function deleteTeam() {
        if(confirm(`Delete ${$selectedTeam.name}?`)) {
            await fetch(`https://squad-stats-server.vercel.app//api/teams/${$selectedTeam._id}`, { method: 'DELETE' });
            selectedTeam.set(null);
            goto('/');
        }
    }
</script>

<main in:fly={{ y: 20, duration: 500 }}>
    <div class="header">
        <div>
            <h1>DASHBOARD: <span class="highlight">{$selectedTeam?.name}</span></h1>
        </div>
        <div class="header-buttons">
            <button class="danger-btn" on:click={deleteTeam}>DELETE TEAM</button>
            <button class="switch-btn" on:click={() => goto('/')}>SWITCH TEAM</button>
        </div>
    </div>

    <div class="dashboard-grid">
        
        <div class="card roster-card">
            <h3>ROSTER MANAGEMENT</h3>
            <div class="add-form">
                <input type="text" bind:value={newPlayerName} placeholder="NAME">
                <input type="number" bind:value={newPlayerNumber} placeholder="#" class="num-input">
                <button class="add-btn" on:click={addPlayer}>+</button>
            </div>
            <ul class="roster-list">
                {#if $selectedTeam?.players}
                    {#each $selectedTeam.players as player}
                        <li class="roster-item">
                            <span class="jersey">#{player.number}</span>
                            <span class="p-name">{player.name}</span>
                            <button class="icon-btn trash" on:click={() => deletePlayer(player._id)}>🗑</button>
                        </li>
                    {/each}
                {/if}
            </ul>
        </div>

        <div class="right-col">
            
            <div class="card access-card">
                <h3>QUICK ACTIONS</h3>
                <div class="btn-group">
                    <button class="big-btn play" on:click={() => goto('/create')}>
                        ▶ START NEW GAME
                    </button>
                    <button class="big-btn stats" on:click={() => goto('/profile')}>
                        📊 PLAYER ANALYTICS
                    </button>
                </div>
                <button class="big-btn ai" on:click={() => goto('/assistant')}>
    🤖 AI ASSISTANT
</button>

<style>
/* Add this to your style block */
.big-btn.ai { background: #6f42c1; color: white; border: none; } /* Purple for AI */
.big-btn.ai:hover { background: #8e5ad6; box-shadow: 0 0 15px #8e5ad6; }
</style>
            </div>

            <div class="card history-card">
                <h3>RECENT GAMES</h3>
                {#if pastGames.length === 0}
                    <p class="empty">NO GAMES RECORDED</p>
                {:else}
                    <ul class="history-list">
                        {#each pastGames as game}
                            <li class="history-item">
                                <span>{new Date(game.date).toLocaleDateString()} vs <strong>{game.opponent}</strong></span>
                                <div class="controls">
                                    <a href={`/tracker/${game._id}`} class="icon-btn">👁</a>
                                    <button class="icon-btn trash" on:click={() => deleteGame(game._id)}>🗑</button>
                                </div>
                            </li>
                        {/each}
                    </ul>
                {/if}
            </div>
        </div>
    </div>
</main>

<style>
    /* Styles matching your Red/Black theme */
    main { max-width: 1100px; margin: 0 auto; padding: 20px; }
    .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #333; padding-bottom: 20px; margin-bottom: 20px; }
    .highlight { color: var(--brand-red); }
    
    .dashboard-grid { display: grid; grid-template-columns: 1fr 1.2fr; gap: 30px; }
    
    .card { background: #1e1e1e; padding: 25px; border-radius: 10px; border: 1px solid #333; margin-bottom: 20px; }
    h3 { margin-top: 0; border-bottom: 2px solid var(--brand-red); display: inline-block; padding-bottom: 5px; margin-bottom: 20px; }

    /* ACCESS BUTTONS */
    .btn-group { display: flex; gap: 15px; }
    .big-btn { width: 100%; padding: 20px; font-size: 1.1rem; font-weight: bold; border: none; cursor: pointer; border-radius: 5px; transition: 0.3s; }
    
    .big-btn.play { background: var(--brand-red); color: white; }
    .big-btn.play:hover { background: #ff003c; box-shadow: 0 0 15px #ff003c; }

    .big-btn.stats { background: #333; color: white; border: 1px solid #555; }
    .big-btn.stats:hover { background: white; color: black; }

    /* INPUTS & ROSTER */
    input { background: #121212; border: 1px solid #444; color: white; padding: 10px; }
    .add-form { display: flex; gap: 10px; margin-bottom: 15px; }
    .num-input { width: 50px; }
    .add-btn { background: var(--brand-red); color: white; border: none; width: 40px; cursor: pointer; font-size: 1.5rem; }

    .roster-list, .history-list { list-style: none; padding: 0; }
    .roster-item, .history-item { display: flex; justify-content: space-between; align-items: center; padding: 12px; background: #252525; margin-bottom: 8px; border-radius: 4px; }
    .jersey { color: var(--brand-red); font-weight: bold; width: 40px; font-family: 'Oswald'; }
    .p-name { flex-grow: 1; }

    .switch-btn { background: #333; color: white; border: none; padding: 10px; cursor: pointer; }
    .danger-btn { background: transparent; color: #ff003c; border: 1px solid #ff003c; padding: 10px; margin-right: 10px; cursor: pointer; }
    .danger-btn:hover { background: #ff003c; color: white; }
    
    .icon-btn { background: none; border: none; cursor: pointer; font-size: 1.2rem; }
    .icon-btn.trash:hover { color: var(--brand-red); }
    a { color: white; text-decoration: none; }
</style>