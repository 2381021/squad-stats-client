
<script>

    import { onMount } from 'svelte';
    import { selectedTeam } from '$lib/stores/teamStore';
    import { goto } from '$app/navigation';
    import { fly, fade, scale } from 'svelte/transition';
    import { elasticOut, cubicInOut } from 'svelte/easing';

    // --- STATE ---
    let teams = [];
    let newTeamName = "";
    let loaded = false;
    
    // 1. Welcome Screen State
    let showWelcome = true; 

    // 2. Hover Interaction State
    let ignoredTeamId = null; 

    onMount(async () => {
        const res = await fetch('http://localhost:3000/api/teams');
        teams = await res.json();
        loaded = true;
    });

    async function createTeam() {
        if (!newTeamName) return;
        const res = await fetch('http://localhost:3000/api/teams', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ name: newTeamName })
        });
        const team = await res.json();
        teams = [...teams, team];
        newTeamName = "";
    }

    // --- ACTIONS ---

    function enterApp() {
        showWelcome = false;
    }

    function proceedToDashboard(team) {
        selectedTeam.set(team);
        goto('/dashboard');
    }

    function cancelHover(e, teamId) {
        e.stopPropagation(); 
        ignoredTeamId = teamId; // Hides the overlay for this specific session
    }

    function resetHover(teamId) {
        // When mouse leaves, reset so the effect works again next time
        if (ignoredTeamId === teamId) {
            ignoredTeamId = null;
        }
    }
</script>

<div class="page-container">

    {#if showWelcome}
        <div 
            class="welcome-overlay" 
            out:fly={{ y: -1000, duration: 800, easing: cubicInOut }}
        >
            <div class="content-wrapper">
                <div class="ball-container" in:scale={{ duration: 1000, start: 0, easing: elasticOut }}>
                    <div class="basketball"><div class="lines"></div></div>
                    <div class="shadow"></div>
                </div>

                <h1 in:fly={{ y: -300, duration: 1200, delay: 200, easing: elasticOut }}>
                    SQUAD<span class="highlight">STATS</span>
                </h1>

                <p class="subtitle" in:fly={{ y: 50, duration: 800, delay: 800 }}>
                    PRECISION ANALYTICS. EFFORTLESS MANAGEMENT.
                </p>

                <button 
                    class="enter-btn" 
                    on:click={enterApp}
                    in:scale={{ duration: 500, delay: 1200, start: 0.5 }}
                >
                    ENTER ARENA
                </button>
            </div>
        </div>

    {:else}
        <main in:fly={{ y: 200, duration: 800, delay: 200 }}>
            <h1 class="title">SELECT <span class="highlight">ROSTER</span></h1>

            <div class="create-box">
                <input type="text" bind:value={newTeamName} placeholder="NEW TEAM NAME">
                <button on:click={createTeam}>CREATE TEAM</button>
            </div>

            <div class="team-grid">
                {#if loaded}
                    {#each teams as team, i}
                        <div 
                            class="team-card-wrapper" 
                            in:fly={{ y: 50, duration: 600, delay: i * 100 }}
                            on:mouseleave={() => resetHover(team._id)}
                        >
                            <div class="team-card">
                                <div class="card-content">
                                    <h2>{team.name}</h2>
                                    <p class="count">{team.players.length} PLAYERS</p>
                                </div>

                                <div class="overlay {ignoredTeamId === team._id ? 'hidden' : ''}">
                                    <div class="overlay-text">MANAGE SQUAD?</div>
                                    <div class="actions">
                                        <button class="btn-check" on:click={() => proceedToDashboard(team)}>✓</button>
                                        <button class="btn-cancel" on:click={(e) => cancelHover(e, team._id)}>✕</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    {/each}
                {/if}
            </div>
        </main>
    {/if}
</div>

<style>
    /* --- GLOBAL LAYOUT --- */
    .page-container { position: relative; min-height: 80vh; overflow: hidden; }
    
    /* --- WELCOME SCREEN STYLES --- */
    .welcome-overlay {
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: radial-gradient(circle at center, #1e1e1e 0%, #000000 100%);
        display: flex; justify-content: center; align-items: center; text-align: center;
        z-index: 2000;
    }
    .content-wrapper { position: relative; z-index: 2; }
    
    h1 { font-size: 5rem; margin: 20px 0; letter-spacing: 5px; text-shadow: 0 10px 30px rgba(0,0,0,0.8); line-height: 1; }
    .highlight { color: var(--brand-red); text-shadow: 0 0 30px var(--brand-red); }
    .subtitle { color: #ccc; font-size: 1.2rem; margin-bottom: 50px; letter-spacing: 2px; font-weight: bold; }
    
    .enter-btn {
        background: transparent; border: 2px solid var(--brand-red); color: white;
        padding: 20px 50px; font-size: 1.5rem; letter-spacing: 3px; cursor: pointer;
        transition: all 0.3s; position: relative; overflow: hidden; font-family: 'Oswald';
    }
    .enter-btn:hover { background: var(--brand-red); box-shadow: 0 0 50px var(--brand-red); color: black; }

    /* BALL ANIMATION */
    .ball-container { margin: 0 auto; width: 100px; height: 120px; position: relative; }
    .basketball {
        width: 80px; height: 80px; background: #ff4500; border-radius: 50%;
        border: 2px solid #000; position: relative; overflow: hidden;
        margin: 0 auto; animation: bounce 1.5s infinite ease-in-out;
        box-shadow: inset -10px -10px 20px rgba(0,0,0,0.5); z-index: 10;
    }
    .lines { position: absolute; width: 100%; height: 100%; border: 2px solid #222; border-radius: 50%; top: 0; left: 0; }
    .lines::before { content: ''; position: absolute; width: 100%; height: 2px; background: #222; top: 50%; transform: translateY(-50%); }
    .lines::after { content: ''; position: absolute; height: 100%; width: 2px; background: #222; left: 50%; transform: translateX(-50%); }
    .shadow {
        width: 60px; height: 10px; background: rgba(0,0,0,0.5); border-radius: 50%;
        margin: 0 auto; margin-top: 10px; animation: shadowScale 1.5s infinite ease-in-out;
    }
    @keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-20px); } }
    @keyframes shadowScale { 0%, 100% { transform: scale(1); opacity: 0.5; } 50% { transform: scale(0.8); opacity: 0.2; } }

    /* --- TEAM SELECTOR STYLES --- */
    main { text-align: center; padding-top: 40px; }
    .title { font-size: 3.5rem; margin-bottom: 50px; }
    
    .create-box { margin-bottom: 60px; display: inline-flex; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
    input { 
        padding: 15px 25px; font-size: 1.2rem; background: #2a2a2a; 
        border: 2px solid #333; color: white; width: 300px; outline: none; font-family: 'Oswald';
    }
    input:focus { border-color: var(--brand-red); }
    .create-box button { 
        padding: 15px 30px; background: var(--brand-red); color: white; border: none; 
        font-size: 1.2rem; cursor: pointer; font-weight: bold;
    }
    .create-box button:hover { background: var(--brand-glow); }

    /* GRID & CARDS */
    .team-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 30px; max-width: 1200px; margin: 0 auto; padding: 20px; }
    .team-card-wrapper { perspective: 1000px; }
    
    .team-card {
        background: #1e1e1e; height: 220px; border-radius: 15px; border: 1px solid #333;
        position: relative; overflow: hidden; transition: 0.3s;
        box-shadow: 0 10px 20px rgba(0,0,0,0.3);
    }
    .team-card:hover { border-color: var(--brand-red); transform: translateY(-5px); }
    
    .card-content { height: 100%; display: flex; flex-direction: column; justify-content: center; align-items: center; }
    h2 { font-size: 2rem; margin: 0; color: white; }
    .count { color: #888; letter-spacing: 1px; margin-top: 5px; }

    /* HOVER OVERLAY */
    .overlay {
        position: absolute; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0, 0, 0, 0.9);
        display: flex; flex-direction: column; justify-content: center; align-items: center;
        transform: translateY(100%);
        transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }
    .team-card:hover .overlay { transform: translateY(0); }
    .overlay.hidden { transform: translateY(100%) !important; }

    .overlay-text { font-family: 'Oswald'; font-size: 1.5rem; color: white; margin-bottom: 20px; letter-spacing: 1px; }
    .actions { display: flex; gap: 20px; }
    
    button.btn-check, button.btn-cancel {
        width: 60px; height: 60px; border-radius: 50%; border: none; font-size: 1.5rem;
        cursor: pointer; transition: 0.2s; display: flex; justify-content: center; align-items: center; font-weight: bold;
    }
    .btn-check { background: #00ff66; color: black; }
    .btn-check:hover { transform: scale(1.1); box-shadow: 0 0 20px #00ff66; }
    .btn-cancel { background: #ff003c; color: white; }
    .btn-cancel:hover { transform: scale(1.1); box-shadow: 0 0 20px #ff003c; }
</style>