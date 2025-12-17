<script>
    import { selectedTeam } from '$lib/stores/teamStore';
    import { onMount, afterUpdate } from 'svelte';
    import { goto } from '$app/navigation';
    import { fade } from 'svelte/transition';

    // 1. SECURITY: If no team is selected, go Home
    onMount(() => {
        if (!$selectedTeam) {
            goto('/');
        }
    });

    let chatHistory = [
        { role: 'ai', text: `Hello Coach! I have analyzed the data for ${$selectedTeam?.name || 'your team'}. Ask me anything about player performance, best defenders, or offensive efficiency.` }
    ];
    let userInput = "";
    let isLoading = false;
    let chatContainer;

    // Auto-scroll to bottom
    afterUpdate(() => {
        if (chatContainer) chatContainer.scrollTop = chatContainer.scrollHeight;
    });

    async function sendMessage() {
        if (!userInput.trim()) return;

        const question = userInput;
        chatHistory = [...chatHistory, { role: 'user', text: question }];
        userInput = "";
        isLoading = true;

        try {
            const res = await fetch('http://localhost:3000/api/ai/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    teamId: $selectedTeam._id, 
                    userQuestion: question 
                })
            });

            const data = await res.json();

            if (data.error) {
                chatHistory = [...chatHistory, { role: 'ai', text: "⚠️ " + data.error }];
            } else {
                chatHistory = [...chatHistory, { role: 'ai', text: data.reply }];
            }
        } catch (error) {
            chatHistory = [...chatHistory, { role: 'ai', text: "⚠️ Connection Error. Ensure server is running." }];
        } finally {
            isLoading = false;
        }
    }

    // Helper for the quick buttons
    function quickAsk(query) {
        userInput = query;
        sendMessage();
    }
</script>

{#if $selectedTeam}
    <main in:fade>
        <div class="header">
            <button class="back-btn" on:click={() => goto('/dashboard')}>← DASHBOARD</button>
            <h1>AI <span class="highlight">ASSISTANT</span></h1>
            <p>Analyzing: <strong>{$selectedTeam.name}</strong></p>
        </div>

        <div class="chat-window" bind:this={chatContainer}>
            {#each chatHistory as msg}
                <div class="message-row {msg.role === 'user' ? 'user-row' : 'ai-row'}">
                    {#if msg.role === 'ai'}
                        <div class="avatar ai">🤖</div>
                    {/if}
                    
                    <div class="bubble {msg.role}">
                        {@html msg.text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>')}
                    </div>

                    {#if msg.role === 'user'}
                        <div class="avatar user">👤</div>
                    {/if}
                </div>
            {/each}

            {#if isLoading}
                <div class="message-row ai-row">
                    <div class="avatar ai">🤖</div>
                    <div class="bubble ai typing">Analyzing stats...</div>
                </div>
            {/if}
        </div>

        <div class="input-area">
            <input 
                type="text" 
                bind:value={userInput} 
                placeholder="Ask your assistant coach..." 
                on:keydown={(e) => e.key === 'Enter' && sendMessage()}
            >
            <button class="send-btn" on:click={sendMessage} disabled={isLoading}>SEND</button>
        </div>

        <div class="suggestions">
            <button on:click={() => quickAsk("Who is our most efficient offensive player?")}>
                🏀 Best Scorer
            </button>
            <button on:click={() => quickAsk("Who is our best defender based on steals/blocks?")}>
                🛡️ Best Defender
            </button>
            <button on:click={() => quickAsk("Give me a short summary of the team's overall performance.")}>
                📋 Team Summary
            </button>
        </div>

    </main>
{/if}

<style>
    main { max-width: 800px; margin: 0 auto; padding: 20px; height: 85vh; display: flex; flex-direction: column; }
    
    .header { text-align: center; margin-bottom: 20px; position: relative; }
    .back-btn { position: absolute; left: 0; top: 0; background: none; border: none; color: #888; cursor: pointer; font-weight: bold; }
    .back-btn:hover { color: white; }

    .highlight { color: #ff3e00; }
    strong { color: white; }

    /* CHAT WINDOW */
    .chat-window {
        flex-grow: 1; background: #1e1e1e; border: 1px solid #333; border-radius: 15px;
        padding: 20px; overflow-y: auto; margin-bottom: 20px;
        box-shadow: inset 0 0 20px rgba(0,0,0,0.5);
    }

    .message-row { display: flex; align-items: flex-end; margin-bottom: 20px; gap: 10px; }
    .user-row { justify-content: flex-end; }
    
    .avatar { width: 40px; height: 40px; border-radius: 50%; display: flex; justify-content: center; align-items: center; font-size: 1.2rem; }
    .ai { background: #ff3e00; color: white; border: 2px solid #000; }
    .user { background: #333; color: white; border: 2px solid #555; }

    .bubble { max-width: 70%; padding: 15px; border-radius: 15px; line-height: 1.5; font-size: 1rem; }
    .bubble.ai { background: #252525; color: #ddd; border-bottom-left-radius: 0; border: 1px solid #333; }
    .bubble.user { background: #ff3e00; color: white; border-bottom-right-radius: 0; }
    .typing { font-style: italic; color: #888; }

    /* INPUT */
    .input-area { display: flex; gap: 10px; margin-bottom: 15px; }
    input { flex-grow: 1; background: #121212; border: 1px solid #444; color: white; padding: 15px; border-radius: 30px; outline: none; }
    input:focus { border-color: #ff3e00; }
    
    .send-btn { background: #ff3e00; color: white; border: none; padding: 0 30px; border-radius: 30px; font-weight: bold; cursor: pointer; font-family: 'Oswald'; }
    .send-btn:disabled { background: #555; }

    /* QUICK SUGGESTIONS */
    .suggestions { display: flex; justify-content: center; gap: 10px; flex-wrap: wrap; }
    .suggestions button { 
        background: #333; font-size: 0.9rem; padding: 10px 15px; border-radius: 20px;
        border: 1px solid #444; color: #ccc; cursor: pointer; transition: 0.2s;
    }
    .suggestions button:hover { background: white; color: black; transform: translateY(-2px); }
</style>