import { test } from '@playwright/test';

test('Test battle system execution', async ({ page }) => {
  const logs: string[] = [];
  
  page.on('console', msg => {
    const text = msg.text();
    logs.push(text);
    if (text.includes('Battle') || text.includes('attack') || text.includes('damage') || text.includes('victory') || text.includes('defeat')) {
      console.log('[BATTLE]', text);
    }
  });
  
  await page.goto('http://localhost:3000/demo.html');
  await page.waitForTimeout(3000);
  
  console.log('\n=== TRIGGERING BATTLE ===');
  
  // Trigger encounter
  await page.evaluate(() => {
    const eventBus = (window as any).EventBus?.getInstance?.();
    eventBus?.emit('encounter:trigger', { zone: 'test', enemyId: 'char001' });
  });
  
  // Wait for transition and battle to start
  await page.waitForTimeout(2000);
  
  // Check battle state
  const battleState = await page.evaluate(() => {
    const sceneManager = (window as any).sceneManager;
    const scene = sceneManager?.currentScene;
    
    if (scene?.constructor?.name !== 'BattleSceneV2') {
      return { isBattle: false };
    }
    
    return {
      isBattle: true,
      sceneType: scene.constructor.name,
      turn: (scene as any).turn,
      isPlayerTurn: (scene as any).isPlayerTurn,
      battleActive: (scene as any).battleActive,
      hasPlayerMonster: !!(scene as any).playerMonster,
      hasEnemyMonster: !!(scene as any).enemyMonster,
    };
  });
  
  console.log('\n=== BATTLE STATE ===');
  console.log(JSON.stringify(battleState, null, 2));
  
  // Wait for battle to execute (auto-battle)
  // Battle starts after 1s, each turn takes 1.5s, usually 3-10 turns (15 seconds)
  await page.waitForTimeout(20000);
  
  // Check if battle ended
  const afterBattle = await page.evaluate(() => {
    const sceneManager = (window as any).sceneManager;
    const scene = sceneManager?.currentScene;
    
    return {
      sceneType: scene?.constructor?.name,
      isBattleScene: scene?.constructor?.name === 'BattleSceneV2',
      isOverworldScene: scene?.constructor?.name === 'OverworldScene',
    };
  });
  
  console.log('\n=== AFTER BATTLE ===');
  console.log(JSON.stringify(afterBattle, null, 2));
  
  // Check for battle-related logs
  const hasDamageLog = logs.some(log => log.includes('damage') || log.includes('attack'));
  const hasEndLog = logs.some(log => log.includes('victory') || log.includes('defeat') || log.includes('Battle ended'));
  
  console.log('\n=== BATTLE LOG ANALYSIS ===');
  console.log('Has damage/attack log:', hasDamageLog);
  console.log('Has end log:', hasEndLog);
  console.log('Returned to overworld:', afterBattle.isOverworldScene);
  
  // Print battle-related logs
  console.log('\n=== BATTLE LOGS ===');
  logs.filter(log => 
    log.toLowerCase().includes('battle') || 
    log.toLowerCase().includes('attack') ||
    log.toLowerCase().includes('damage') ||
    log.toLowerCase().includes('victory') ||
    log.toLowerCase().includes('defeat')
  ).forEach(log => console.log(log));
  
  await page.screenshot({ path: '/tmp/battle-complete.png', fullPage: true });
});
