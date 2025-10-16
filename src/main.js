/**
 * Main entry point for Thần Thú Văn Lang
 */
import { Game } from './core/Game.js';

// Initialize and start the game
const game = new Game();
game.init().then(() => {
    console.log('Thần Thú Văn Lang - Game started!');
    console.log('200 Divine Beasts | Ngũ Hành System | Turn-based Combat');
}).catch(error => {
    console.error('Failed to initialize game:', error);
});

// Make game accessible globally for debugging
window.game = game;
