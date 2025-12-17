<script>
    import { goto } from '$app/navigation';
    import { selectedTeam } from '$lib/stores/teamStore';
    import { onMount } from 'svelte';
    import { fly, fade } from 'svelte/transition';

    let opponent = "";
    let date = new Date().toISOString().split('T')[0];

    onMount(() => {
        if (!$selectedTeam) goto('/');
    });

    async function createGame() {
        if (!$selectedTeam) { alert("No team selected!"); return; }
        if (!opponent) { alert("Please enter an opponent name."); return; }

        const currentRoster = $selectedTeam.players.map(p => ({
            name: p.name,
            number: p.number, 
            points: 0, rebounds: 0, assists: 0, steals: 0, blocks: 0, minutes: 0, secondsPlayed: 0
        }));

        if (currentRoster.length === 0) {
            alert("Your team has no players! Add them in the Team Hub first.");
            return;
        }

        const gameData = {
            teamId: $selectedTeam._id,
            opponent,
            date,
            players: currentRoster
        };

        try {
            const response = await fetch('https://squad-stats-server.vercel.app/api/games', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(gameData)
            });

            if (!response.ok) throw new Error("Server Error");

            const result = await response.json();
            if (result.success) goto(`/tracker/${result.gameId}`);

        } catch (error) {
            console.error("Failed to create game:", error);
            alert("Error: " + error.message);
        }
    }
</script>

<main in:fade>
    <h2>SETUP <span class="highlight">NEW GAME</span></h2>
    
    {#if $selectedTeam}
        <p class="team-label">PLAYING AS: <span class="team-name">{$selectedTeam.name}</span></p>
    {/if}

    <div class="section">
        <label>OPPONENT TEAM</label>
        <input type="text" bind:value={opponent} placeholder="E.G. LAKERS">
        
        <label>GAME DATE</label>
        <input type="date" bind:value={date}>
    </div>

    <hr>

    <div class="section">
        <h3>STARTING LINEUP</h3>
        <p class="subtext">Players automatically pulled from active roster.</p>

        <ul class="player-list">
            {#if $selectedTeam && $selectedTeam.players}
                {#each $selectedTeam.players as player, i}
                    <li in:fly={{ y: 20, delay: i * 50 }}>
                        <span class="number">#{player.number}</span> 
                        <span class="name">{player.name}</span>
                        <span class="status">ACTIVE</span>
                    </li>
                {/each}
            {:else}
                <li style="color: red;">No players found on roster!</li>
            {/if}
        </ul>
    </div>

    <button class="start-btn" on:click={createGame}>START ANALYSIS</button>
</main>

<style>
    main { max-width: 600px; margin: 0 auto; padding: 40px 20px; font-family: sans-serif; }
    
    h2 { font-size: 2.5rem; margin-bottom: 10px; }
    .highlight { color: var(--brand-red); }
    
    .team-label { font-size: 1rem; color: #888; margin-bottom: 30px; letter-spacing: 1px; }
    .team-name { color: white; font-weight: bold; text-transform: uppercase; }
    
    /* INPUTS */
    .section { margin-bottom: 30px; }
    label { display: block; margin-bottom: 8px; font-weight: bold; color: var(--brand-red); font-size: 0.9rem; letter-spacing: 1px; }
    
    input { 
        padding: 15px; margin-bottom: 20px; width: 100%; box-sizing: border-box; 
        background: #1e1e1e; border: 1px solid #333; color: white; 
        border-radius: 5px; font-size: 1.1rem; outline: none;
    }
    input:focus { border-color: var(--brand-red); }
    
    /* DIVIDER */
    hr { border: 0; border-top: 1px solid #333; margin: 30px 0; }

    /* ROSTER LIST (Fixed Colors) */
    h3 { margin-bottom: 5px; color: white; }
    .subtext { font-size: 0.9rem; color: #666; margin-top: 0; margin-bottom: 20px; }

    .player-list { list-style: none; padding: 0; }
    
    .player-list li { 
        background: #1e1e1e; margin: 10px 0; padding: 15px; 
        border-left: 4px solid var(--brand-red); border-radius: 4px;
        display: flex; align-items: center; 
        color: white; /* Ensures text is visible */
        border: 1px solid #333;
    }
    
    .number { 
        font-weight: bold; margin-right: 15px; color: #111; 
        background: var(--brand-red); padding: 5px 10px; 
        border-radius: 4px; font-size: 1rem; font-family: 'Oswald';
    }
    
    .name { font-weight: bold; font-size: 1.1rem; flex-grow: 1; }
    .status { font-size: 0.8rem; color: #00ff66; font-weight: bold; letter-spacing: 1px; }

    /* BUTTON */
    .start-btn { 
        background-color: var(--brand-red); width: 100%; padding: 20px; 
        font-size: 1.3rem; margin-top: 20px; color: white; border: none; 
        cursor: pointer; border-radius: 5px; font-weight: bold; font-family: 'Oswald';
        transition: 0.2s;
    }
    .start-btn:hover { background-color: #ff003c; box-shadow: 0 0 20px rgba(255, 0, 60, 0.4); }
</style>