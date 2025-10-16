/**
 * CaptureSystem - System for capturing wild monsters after battle
 */

export class CaptureSystem {
    constructor() {
        this.capturedMonsters = [];
    }

    /**
     * Attempt to capture a monster
     * Success rate based on monster's capture rate, current HP, and player level
     */
    attemptCapture(monster, playerLevel = 1) {
        const hpFactor = 1 - (monster.currentHP / monster.stats.hp);
        const levelFactor = Math.min(1.5, 1 + (playerLevel * 0.05));
        
        // Base capture rate from monster data
        const baseCaptureRate = monster.captureRate || 30;
        
        // Calculate final capture chance (0-100)
        const captureChance = Math.min(95, baseCaptureRate * hpFactor * levelFactor);
        
        const roll = Math.random() * 100;
        const success = roll < captureChance;
        
        if (success) {
            this.capturedMonsters.push({
                ...monster,
                captureDate: Date.now(),
                currentHP: monster.stats.hp // Restore HP after capture
            });
        }
        
        return {
            success,
            captureChance: Math.floor(captureChance),
            roll: Math.floor(roll)
        };
    }

    getCapturedMonsters() {
        return [...this.capturedMonsters];
    }

    getCapturedCount() {
        return this.capturedMonsters.length;
    }

    hasCaptured(monsterId) {
        return this.capturedMonsters.some(m => m.id === monsterId);
    }

    /**
     * Check if monster can evolve
     */
    canEvolve(monster) {
        return monster.evolveTo !== null && monster.level >= (monster.tier * 10);
    }

    /**
     * Evolve a captured monster
     */
    evolveMonster(monster, monsterDatabase) {
        if (!this.canEvolve(monster)) {
            return null;
        }

        const evolvedForm = monsterDatabase[monster.evolveTo];
        if (!evolvedForm) {
            return null;
        }

        // Find and replace the monster in captured list
        const index = this.capturedMonsters.findIndex(m => m.id === monster.id);
        if (index !== -1) {
            this.capturedMonsters[index] = {
                ...evolvedForm,
                level: monster.level,
                experience: monster.experience,
                captureDate: monster.captureDate
            };
            return this.capturedMonsters[index];
        }

        return null;
    }
}
