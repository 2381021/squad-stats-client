<script>
    import { fly } from 'svelte/transition';
</script>

<nav in:fly={{ y: -50, duration: 800 }}>
    <div class="logo">
        <a href="/">SQUAD<span class="highlight">STATS</span> 🏀</a>
    </div>
</nav>

<div class="container">
    <slot />
</div>

<style>
    /* GLOBAL THEME VARIABLES */
    :global(:root) {
        --bg-color: #121212;
        --card-bg: #1e1e1e;
        --brand-red: #ff3e00;
        --brand-glow: #ff003c;
    }

    :global(body) {
        margin: 0;
        font-family: 'Roboto', sans-serif;
        background-color: var(--bg-color);
        color: white;
    }

    :global(h1), :global(h2), :global(h3) {
        font-family: 'Oswald', sans-serif;
        text-transform: uppercase;
    }

    /* NAVIGATION */
    nav {
        background: rgba(30, 30, 30, 0.95);
        border-bottom: 2px solid var(--brand-red);
        padding: 20px 30px;
        display: flex;
        justify-content: center; /* Centered Logo */
        align-items: center;
        box-shadow: 0 5px 20px rgba(255, 62, 0, 0.1);
    }

    .logo a {
        font-family: 'Oswald', sans-serif;
        font-weight: 700;
        font-size: 2rem;
        color: white;
        text-decoration: none;
        letter-spacing: 2px;
    }

    .highlight { color: var(--brand-red); text-shadow: 0 0 15px var(--brand-red); }

    .container { max-width: 1200px; margin: 0 auto; padding: 30px 20px; }
</style>