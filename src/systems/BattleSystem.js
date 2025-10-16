/**
 * BattleSystem - Turn-based combat with Ngũ Hành advantages
 */
import { ELEMENT_ADVANTAGES } from '../data/MonsterDatabase.js';

export class BattleSystem {
    constructor() {
        this.turn = 0;
        this.participants = [];
        this.isPlayerTurn = true;
    }

    initializeBattle(playerMonsters, enemyMonsters) {
        this.participants = [
            ...playerMonsters.map(m => ({ ...m, isPlayer: true })),
            ...enemyMonsters.map(m => ({ ...m, isPlayer: false }))
        ];
        
        // Sort by speed for turn order
        this.participants.sort((a, b) => b.stats.speed - a.stats.speed);
        this.turn = 0;
    }

    calculateDamage(attacker, defender, skill) {
        let baseDamage = attacker.stats.attack + (skill ? skill.power : 0);
        
        // Apply element advantage
        const advantage = this.getElementAdvantage(attacker.element, defender.element);
        baseDamage *= advantage;
        
        // Apply defense
        const finalDamage = Math.max(1, Math.floor(baseDamage - defender.stats.defense / 2));
        
        return {
            damage: finalDamage,
            advantage: advantage,
            isCritical: Math.random() < 0.1
        };
    }

    getElementAdvantage(attackerElement, defenderElement) {
        if (ELEMENT_ADVANTAGES[attackerElement] === defenderElement) {
            return 1.5; // Super effective
        } else if (ELEMENT_ADVANTAGES[defenderElement] === attackerElement) {
            return 0.5; // Not very effective
        }
        return 1.0; // Normal damage
    }

    attack(attacker, defender, skill = null) {
        const result = this.calculateDamage(attacker, defender, skill);
        defender.currentHP = Math.max(0, defender.currentHP - result.damage);
        
        return {
            ...result,
            remainingHP: defender.currentHP,
            isKO: defender.currentHP === 0
        };
    }

    nextTurn() {
        this.turn++;
    }

    isPlayerWin() {
        return this.participants.filter(p => !p.isPlayer).every(p => p.currentHP === 0);
    }

    isEnemyWin() {
        return this.participants.filter(p => p.isPlayer).every(p => p.currentHP === 0);
    }

    isBattleOver() {
        return this.isPlayerWin() || this.isEnemyWin();
    }
}
