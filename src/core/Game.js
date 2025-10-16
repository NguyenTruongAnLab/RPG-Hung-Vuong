/**
 * Game - Main game controller
 */
import { Application, Container, Graphics, Text } from 'pixi.js';
import I18n from './I18n.js';
import { MONSTER_DATABASE } from '../data/MonsterDatabase.js';
import { BattleSystem } from '../systems/BattleSystem.js';
import { CaptureSystem } from '../systems/CaptureSystem.js';
import { MapExplorer } from '../systems/MapExplorer.js';

export class Game {
    constructor() {
        this.app = null;
        this.battleSystem = new BattleSystem();
        this.captureSystem = new CaptureSystem();
        this.mapExplorer = new MapExplorer();
        this.playerLevel = 1;
        this.currentState = 'menu'; // menu, explore, battle
    }

    async init() {
        // Load i18n
        await I18n.loadLanguage('vi');

        // Create PixiJS application
        this.app = new Application();
        await this.app.init({
            width: 1280,
            height: 720,
            backgroundColor: 0x1a1a2e
        });

        document.getElementById('game-container').appendChild(this.app.canvas);

        // Initialize game
        this.createMainMenu();
    }

    createMainMenu() {
        this.app.stage.removeChildren();
        this.currentState = 'menu';

        const container = new Container();

        // Title
        const title = new Text({
            text: I18n.t('game.title'),
            style: {
                fontSize: 64,
                fill: 0xffd700,
                fontWeight: 'bold'
            }
        });
        title.x = this.app.screen.width / 2 - title.width / 2;
        title.y = 100;
        container.addChild(title);

        // Subtitle
        const subtitle = new Text({
            text: I18n.t('game.subtitle'),
            style: {
                fontSize: 32,
                fill: 0xffffff
            }
        });
        subtitle.x = this.app.screen.width / 2 - subtitle.width / 2;
        subtitle.y = 200;
        container.addChild(subtitle);

        // Start button
        const startButton = this.createButton(I18n.t('game.start'), this.app.screen.width / 2, 350);
        startButton.on('pointerdown', () => this.startGame());
        container.addChild(startButton);

        // Info text
        const info = new Text({
            text: `200 Thần Thú | Ngũ Hành | ${I18n.t('battle.turn')} Based`,
            style: {
                fontSize: 24,
                fill: 0xaaaaaa
            }
        });
        info.x = this.app.screen.width / 2 - info.width / 2;
        info.y = 600;
        container.addChild(info);

        this.app.stage.addChild(container);
    }

    createButton(text, x, y) {
        const button = new Container();
        button.x = x;
        button.y = y;
        button.eventMode = 'static';
        button.cursor = 'pointer';

        const bg = new Graphics()
            .rect(-100, -25, 200, 50)
            .fill(0x16213e)
            .stroke({ width: 2, color: 0x0f3460 });
        
        const label = new Text({
            text: text,
            style: {
                fontSize: 28,
                fill: 0xffffff
            }
        });
        label.anchor = 0.5;

        button.addChild(bg);
        button.addChild(label);

        button.on('pointerover', () => {
            bg.clear().rect(-100, -25, 200, 50).fill(0x0f3460).stroke({ width: 2, color: 0xffd700 });
        });

        button.on('pointerout', () => {
            bg.clear().rect(-100, -25, 200, 50).fill(0x16213e).stroke({ width: 2, color: 0x0f3460 });
        });

        return button;
    }

    startGame() {
        // Give player a starter monster
        const starterMonster = {
            ...MONSTER_DATABASE['char001'],
            level: 5,
            experience: 0,
            currentHP: MONSTER_DATABASE['char001'].baseStats.hp,
            stats: { ...MONSTER_DATABASE['char001'].baseStats }
        };
        
        this.captureSystem.capturedMonsters.push(starterMonster);
        this.showExploreScreen();
    }

    showExploreScreen() {
        this.app.stage.removeChildren();
        this.currentState = 'explore';

        const container = new Container();

        // Location info
        const location = this.mapExplorer.getCurrentLocation();
        const locationText = new Text({
            text: location.name,
            style: {
                fontSize: 36,
                fill: 0xffd700,
                fontWeight: 'bold'
            }
        });
        locationText.x = 50;
        locationText.y = 50;
        container.addChild(locationText);

        const description = new Text({
            text: location.description,
            style: {
                fontSize: 20,
                fill: 0xffffff,
                wordWrap: true,
                wordWrapWidth: 600
            }
        });
        description.x = 50;
        description.y = 120;
        container.addChild(description);

        // Player info
        const playerInfo = new Text({
            text: `${I18n.t('battle.level')}: ${this.playerLevel} | ${I18n.t('monster.captured')}: ${this.captureSystem.getCapturedCount()}/200`,
            style: {
                fontSize: 22,
                fill: 0xffffff
            }
        });
        playerInfo.x = this.app.screen.width - playerInfo.width - 50;
        playerInfo.y = 50;
        container.addChild(playerInfo);

        // Battle button
        const battleBtn = this.createButton(I18n.t('map.battle'), this.app.screen.width / 2 - 150, 350);
        battleBtn.on('pointerdown', () => this.startBattle());
        container.addChild(battleBtn);

        // Explore button (move to different locations)
        const exploreBtn = this.createButton(I18n.t('map.explore'), this.app.screen.width / 2 + 150, 350);
        exploreBtn.on('pointerdown', () => this.showLocationSelect());
        container.addChild(exploreBtn);

        this.app.stage.addChild(container);
    }

    showLocationSelect() {
        const available = this.mapExplorer.getAvailableLocations();
        const container = new Container();

        const title = new Text({
            text: I18n.t('map.explore'),
            style: {
                fontSize: 32,
                fill: 0xffd700
            }
        });
        title.x = this.app.screen.width / 2 - title.width / 2;
        title.y = 100;
        container.addChild(title);

        available.forEach((loc, i) => {
            const btn = this.createButton(loc.name, this.app.screen.width / 2, 200 + i * 80);
            btn.on('pointerdown', () => {
                this.mapExplorer.moveTo(loc.id);
                this.showExploreScreen();
            });
            container.addChild(btn);
        });

        // Back button
        const backBtn = this.createButton('Quay lại', this.app.screen.width / 2, 200 + available.length * 80 + 50);
        backBtn.on('pointerdown', () => this.showExploreScreen());
        container.addChild(backBtn);

        this.app.stage.removeChildren();
        this.app.stage.addChild(container);
    }

    startBattle() {
        // Get random encounter
        const encounterId = this.mapExplorer.getRandomEncounter();
        if (!encounterId) {
            return;
        }

        const enemyMonster = {
            ...MONSTER_DATABASE[encounterId],
            level: Math.max(1, this.playerLevel - 2 + Math.floor(Math.random() * 5)),
            currentHP: MONSTER_DATABASE[encounterId].baseStats.hp,
            stats: { ...MONSTER_DATABASE[encounterId].baseStats }
        };

        const playerMonster = this.captureSystem.capturedMonsters[0];
        
        this.battleSystem.initializeBattle([playerMonster], [enemyMonster]);
        this.showBattleScreen(playerMonster, enemyMonster);
    }

    showBattleScreen(playerMonster, enemyMonster) {
        this.app.stage.removeChildren();
        this.currentState = 'battle';

        const container = new Container();

        // Turn counter
        const turnText = new Text({
            text: `${I18n.t('battle.turn')}: ${this.battleSystem.turn + 1}`,
            style: {
                fontSize: 24,
                fill: 0xffffff
            }
        });
        turnText.x = this.app.screen.width / 2 - turnText.width / 2;
        turnText.y = 30;
        container.addChild(turnText);

        // Player monster
        const playerInfo = this.createMonsterDisplay(playerMonster, 200, 300, true);
        container.addChild(playerInfo);

        // Enemy monster
        const enemyInfo = this.createMonsterDisplay(enemyMonster, this.app.screen.width - 300, 300, false);
        container.addChild(enemyInfo);

        // Battle actions
        const attackBtn = this.createButton(I18n.t('battle.attack'), this.app.screen.width / 2 - 200, 600);
        attackBtn.on('pointerdown', () => this.performAttack(playerMonster, enemyMonster));
        container.addChild(attackBtn);

        const captureBtn = this.createButton(I18n.t('battle.capture'), this.app.screen.width / 2, 600);
        captureBtn.on('pointerdown', () => this.attemptCapture(enemyMonster));
        container.addChild(captureBtn);

        const fleeBtn = this.createButton(I18n.t('battle.flee'), this.app.screen.width / 2 + 200, 600);
        fleeBtn.on('pointerdown', () => this.showExploreScreen());
        container.addChild(fleeBtn);

        this.app.stage.addChild(container);
    }

    createMonsterDisplay(monster, x, y, isPlayer) {
        const container = new Container();
        container.x = x;
        container.y = y;

        // Background
        const bg = new Graphics()
            .rect(-120, -100, 240, 200)
            .fill(isPlayer ? 0x0f3460 : 0x5a1a1a)
            .stroke({ width: 2, color: 0xffffff });
        container.addChild(bg);

        // Name
        const name = new Text({
            text: monster.name,
            style: {
                fontSize: 20,
                fill: 0xffffff,
                fontWeight: 'bold'
            }
        });
        name.anchor = 0.5;
        name.y = -70;
        container.addChild(name);

        // Element
        const element = new Text({
            text: I18n.t(`elements.${monster.element}`),
            style: {
                fontSize: 16,
                fill: 0xaaaaaa
            }
        });
        element.anchor = 0.5;
        element.y = -45;
        container.addChild(element);

        // HP bar
        const hpText = new Text({
            text: `${I18n.t('battle.hp')}: ${monster.currentHP}/${monster.stats.hp}`,
            style: {
                fontSize: 18,
                fill: 0xffffff
            }
        });
        hpText.anchor = 0.5;
        hpText.y = -10;
        container.addChild(hpText);

        const hpBarBg = new Graphics()
            .rect(-100, 10, 200, 20)
            .fill(0x333333);
        container.addChild(hpBarBg);

        const hpBarFill = new Graphics()
            .rect(-100, 10, 200 * (monster.currentHP / monster.stats.hp), 20)
            .fill(0x00ff00);
        container.addChild(hpBarFill);

        // Stats
        const stats = new Text({
            text: `ATK:${monster.stats.attack} DEF:${monster.stats.defense} SPD:${monster.stats.speed}`,
            style: {
                fontSize: 14,
                fill: 0xaaaaaa
            }
        });
        stats.anchor = 0.5;
        stats.y = 50;
        container.addChild(stats);

        return container;
    }

    performAttack(attacker, defender) {
        const result = this.battleSystem.attack(attacker, defender);
        
        // Check if battle is over
        if (this.battleSystem.isBattleOver()) {
            if (this.battleSystem.isPlayerWin()) {
                this.showVictory();
            } else {
                this.showDefeat();
            }
        } else {
            // Enemy counter-attack
            if (defender.currentHP > 0) {
                setTimeout(() => {
                    const counterResult = this.battleSystem.attack(defender, attacker);
                    if (this.battleSystem.isBattleOver()) {
                        if (this.battleSystem.isPlayerWin()) {
                            this.showVictory();
                        } else {
                            this.showDefeat();
                        }
                    } else {
                        this.battleSystem.nextTurn();
                        this.startBattle();
                    }
                }, 500);
            }
        }
    }

    attemptCapture(monster) {
        const result = this.captureSystem.attemptCapture(monster, this.playerLevel);
        
        if (result.success) {
            this.showCaptureSuccess(monster);
        } else {
            // Enemy counter-attack after failed capture
            const playerMonster = this.captureSystem.capturedMonsters[0];
            const counterResult = this.battleSystem.attack(monster, playerMonster);
            
            if (this.battleSystem.isBattleOver()) {
                this.showDefeat();
            } else {
                this.startBattle();
            }
        }
    }

    showVictory() {
        this.app.stage.removeChildren();
        const container = new Container();

        const victoryText = new Text({
            text: I18n.t('battle.victory'),
            style: {
                fontSize: 48,
                fill: 0x00ff00,
                fontWeight: 'bold'
            }
        });
        victoryText.x = this.app.screen.width / 2 - victoryText.width / 2;
        victoryText.y = this.app.screen.height / 2 - 100;
        container.addChild(victoryText);

        const continueBtn = this.createButton('Tiếp tục', this.app.screen.width / 2, this.app.screen.height / 2 + 50);
        continueBtn.on('pointerdown', () => {
            this.playerLevel++;
            this.showExploreScreen();
        });
        container.addChild(continueBtn);

        this.app.stage.addChild(container);
    }

    showDefeat() {
        this.app.stage.removeChildren();
        const container = new Container();

        const defeatText = new Text({
            text: I18n.t('battle.defeat'),
            style: {
                fontSize: 48,
                fill: 0xff0000,
                fontWeight: 'bold'
            }
        });
        defeatText.x = this.app.screen.width / 2 - defeatText.width / 2;
        defeatText.y = this.app.screen.height / 2 - 100;
        container.addChild(defeatText);

        const menuBtn = this.createButton('Menu', this.app.screen.width / 2, this.app.screen.height / 2 + 50);
        menuBtn.on('pointerdown', () => this.createMainMenu());
        container.addChild(menuBtn);

        this.app.stage.addChild(container);
    }

    showCaptureSuccess(monster) {
        this.app.stage.removeChildren();
        const container = new Container();

        const successText = new Text({
            text: I18n.t('battle.captureSuccess'),
            style: {
                fontSize: 48,
                fill: 0xffd700,
                fontWeight: 'bold'
            }
        });
        successText.x = this.app.screen.width / 2 - successText.width / 2;
        successText.y = this.app.screen.height / 2 - 150;
        container.addChild(successText);

        const monsterName = new Text({
            text: monster.name,
            style: {
                fontSize: 36,
                fill: 0xffffff
            }
        });
        monsterName.x = this.app.screen.width / 2 - monsterName.width / 2;
        monsterName.y = this.app.screen.height / 2 - 50;
        container.addChild(monsterName);

        const continueBtn = this.createButton('Tiếp tục', this.app.screen.width / 2, this.app.screen.height / 2 + 50);
        continueBtn.on('pointerdown', () => this.showExploreScreen());
        container.addChild(continueBtn);

        this.app.stage.addChild(container);
    }
}
