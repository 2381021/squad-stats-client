import { writable } from 'svelte/store';
import { browser } from '$app/environment';

// Try to load from localStorage so the app remembers your team if you refresh
const storedTeam = browser ? JSON.parse(localStorage.getItem('selectedTeam')) : null;

export const selectedTeam = writable(storedTeam);

// Anytime this store changes, save it to localStorage
if (browser) {
    selectedTeam.subscribe(value => {
        localStorage.setItem('selectedTeam', JSON.stringify(value));
    });
}