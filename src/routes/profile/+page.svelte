<script>
    import { selectedTeam } from '$lib/stores/teamStore';
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
    import { fly, fade } from 'svelte/transition';

    onMount(() => { if (!$selectedTeam) goto('/'); });

    let selectedPlayerName = null;
    let stats = null;
    let loading = false;

    async function viewPlayerStats(name) {
        selectedPlayerName = name;
        loading = true;
        stats = null;
        try {
            const res = await fetch(`https://squad-stats-server.vercel.app/api/stats/${$selectedTeam._id}/player/${name}`);
            if (res.ok) stats = await res.json();
        } catch (error) { console.error(error); } 
        finally { loading = false; }
    }

    function closeReport() { selectedPlayerName = null; stats = null; }
</script>

<main in:fade>
    {#if $selectedTeam}
        <div class="header">
            <h1>TEAM <span class="highlight">ANALYTICS</span></h1>
            <p class="team-name">{$selectedTeam.name}</p>
        </div>

        {#if !selectedPlayerName}
            <div class="roster-grid">
                {#each $selectedTeam.players as player, i}
                    <div 
                        class="player-card" 
                        on:click={() => viewPlayerStats(player.name)}
                        in:fly={{ y: 20, delay: i * 50 }}
                    >
                        <div class="jersey">#{player.number}</div>
                        <div class="name">{player.name}</div>
                        <div class="cta">VIEW REPORT</div>
                    </div>
                {/each}
            </div>

        {:else}
            <button class="back-btn" on:click={closeReport}>← BACK TO ROSTER</button>

            {#if loading}
                <div class="loading">CALCULATING METRICS...</div>
            {:else if stats}
                <div class="report" in:fly={{ y: 20 }}>
                    <div class="player-header">
                        <h2>{stats.name}</h2>
                        <span class="badge">{stats.totalGames} GAMES PLAYED</span>
                    </div>

                    <div class="averages-grid">
                        <div class="stat-box pts">
                            <span class="label">PPG</span>
                            <span class="val">{stats.averages.points}</span>
                        </div>
                        <div class="stat-box">
                            <span class="label">RPG</span>
                            <span class="val">{stats.averages.rebounds}</span>
                        </div>
                        <div class="stat-box">
                            <span class="label">APG</span>
                            <span class="val">{stats.averages.assists}</span>
                        </div>
                        <div class="stat-box">
                            <span class="label">SPG</span>
                            <span class="val">{stats.averages.steals}</span>
                        </div>
                        <div class="stat-box">
                            <span class="label">BPG</span>
                            <span class="val">{stats.averages.blocks}</span>
                        </div>
                        <div class="stat-box">
                            <span class="label">MIN</span>
                            <span class="val">{stats.averages.minutes}</span>
                        </div>
                    </div>

                    <h3>GAME LOGS</h3>
                    <div class="table-wrapper">
                        <table>
                            <thead>
                                <tr>
                                    <th>DATE</th>
                                    <th>OPPONENT</th>
                                    <th>PTS</th>
                                    <th>REB</th>
                                    <th>AST</th>
                                    <th>STL</th>
                                    <th>BLK</th>
                                </tr>
                            </thead>
                            <tbody>
                                {#each stats.history as game}
                                    <tr>
                                        <td class="date-cell">{new Date(game.date).toLocaleDateString()}</td>
                                        <td class="opp-cell">{game.opponent}</td>
                                        <td class="highlight-stat">{game.points}</td>
                                        <td>{game.rebounds}</td>
                                        <td>{game.assists}</td>
                                        <td>{game.steals}</td>
                                        <td>{game.blocks}</td>
                                    </tr>
                                {/each}
                            </tbody>
                        </table>
                    </div>
                </div>
            {:else}
                <div class="empty-state">
                    <h3>NO DATA</h3>
                    <p>No games recorded for this player yet.</p>
                </div>
            {/if}
        {/if}
    {/if}
</main>

<style>
    main { max-width: 1000px; margin: 0 auto; padding: 20px; }
    .highlight { color: var(--brand-red); }
    .team-name { color: #888; letter-spacing: 2px; text-transform: uppercase; margin-top: -10px; margin-bottom: 30px; }

    /* ROSTER GRID (Dark Mode) */
    .roster-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 20px; }
    
    .player-card { 
        background: #1e1e1e; border: 1px solid #333; border-radius: 10px; padding: 30px 20px; 
        text-align: center; cursor: pointer; transition: 0.3s;
    }
    .player-card:hover { border-color: var(--brand-red); transform: translateY(-5px); background: #252525; }
    
    .jersey { font-size: 2rem; font-weight: bold; color: #444; font-family: 'Oswald'; }
    .name { font-weight: bold; font-size: 1.2rem; margin: 10px 0; color: white; }
    .cta { font-size: 0.8rem; color: var(--brand-red); font-weight: bold; letter-spacing: 1px; }

    /* REPORT STYLES */
    .back-btn { background: none; border: none; color: #888; cursor: pointer; margin-bottom: 20px; font-size: 0.9rem; }
    .back-btn:hover { color: white; }

    .player-header { display: flex; align-items: center; gap: 20px; margin-bottom: 30px; }
    .badge { background: #333; color: white; padding: 5px 15px; border-radius: 20px; font-size: 0.8rem; }

    .averages-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(100px, 1fr)); gap: 15px; margin-bottom: 40px; }
    
    .stat-box { 
        background: #1e1e1e; padding: 15px; border-radius: 8px; text-align: center; 
        border: 1px solid #333; 
    }
    .stat-box.pts { border-top: 3px solid var(--brand-red); background: linear-gradient(180deg, #1e1e1e, #151515); }
    .label { display: block; font-size: 0.8rem; color: #888; margin-bottom: 5px; }
    .val { font-size: 2rem; font-weight: bold; color: white; font-family: 'Oswald'; }

    /* TABLE (Dark Mode) */
    .table-wrapper { background: #1e1e1e; border-radius: 10px; overflow: hidden; border: 1px solid #333; }
    table { width: 100%; border-collapse: collapse; }
    th { text-align: left; background: #121212; padding: 15px; color: #888; font-size: 0.8rem; }
    td { padding: 15px; border-bottom: 1px solid #2a2a2a; color: #ccc; }
    tr:last-child td { border-bottom: none; }
    
    .highlight-stat { color: var(--brand-red); font-weight: bold; }
    .opp-cell { color: white; font-weight: bold; text-transform: uppercase; }
    .date-cell { font-family: monospace; color: #666; }

    .loading, .empty-state { text-align: center; color: #666; padding: 50px; }
</style>