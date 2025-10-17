import { test } from '@playwright/test';

test('Test encounter and battle transition', async ({ page }) => {
  const logs: string[] = [];
  
  page.on('console', msg => {
    const text = msg.text();
    logs.push(text);
    if (text.includes('Encounter') || text.includes('Battle') || text.includes('transition')) {
      console.log('[GAME]', text);
    }
  });
  
  await page.goto('http://localhost:3000/demo.html');
  await page.waitForTimeout(3000);
  
  console.log('\n=== TESTING ENCOUNTER SYSTEM ===');
  
  // Get map info
  const mapInfo = await page.evaluate(() => {
    const scene = (window as any).scene;
    // Try to access the private encounters field through the instance
    return {
      sceneType: scene?.constructor?.name,
      hasEncounters: !!(scene as any).encounters,
    };
  });
  
  console.log('Map info:', mapInfo);
  
  // Try to trigger encounter manually
  console.log('\n=== MANUALLY TRIGGERING ENCOUNTER ===');
  
  const encounterTriggered = await page.evaluate(() => {
    try {
      const eventBus = (window as any).EventBus?.getInstance?.();
      if (eventBus) {
        eventBus.emit('encounter:trigger', { zone: 'test', enemyId: 'char001' });
        return true;
      }
      return false;
    } catch (err: any) {
      console.error('Error triggering encounter:', err.message);
      return false;
    }
  });
  
  console.log('Encounter manually triggered:', encounterTriggered);
  
  // Wait for transition
  await page.waitForTimeout(2000);
  
  // Check if battle scene loaded
  const afterEncounter = await page.evaluate(() => {
    const sceneManager = (window as any).sceneManager;
    const currentScene = sceneManager?.currentScene;
    
    return {
      sceneType: currentScene?.constructor?.name,
      isBattleScene: currentScene?.constructor?.name === 'BattleSceneV2',
    };
  });
  
  console.log('\n=== AFTER ENCOUNTER ===');
  console.log('Current scene:', afterEncounter.sceneType);
  console.log('Is battle scene:', afterEncounter.isBattleScene);
  
  // Check for specific logs
  const hasEncounterLog = logs.some(log => log.includes('Encounter triggered'));
  const hasBattleLog = logs.some(log => log.includes('Battle') || log.includes('battle'));
  
  console.log('\n=== LOG ANALYSIS ===');
  console.log('Has encounter log:', hasEncounterLog);
  console.log('Has battle log:', hasBattleLog);
  
  await page.screenshot({ path: '/tmp/encounter-test.png', fullPage: true });
  
  // Test walking to encounter zone (center of map)
  console.log('\n=== TESTING WALK TO ENCOUNTER ZONE ===');
  
  // Reset by reloading
  await page.reload();
  await page.waitForTimeout(3000);
  
  // Walk to center (encounter zone is vertical strip at x=10-12 tiles = 320-384 pixels)
  // Player starts at 320, 240 so we're already in the zone
  // Just need to walk enough steps
  
  for (let i = 0; i < 15; i++) {
    await page.keyboard.press('w');
    await page.waitForTimeout(100);
  }
  
  await page.waitForTimeout(1000);
  
  const afterWalking = await page.evaluate(() => {
    const sceneManager = (window as any).sceneManager;
    const currentScene = sceneManager?.currentScene;
    
    return {
      sceneType: currentScene?.constructor?.name,
      isBattleScene: currentScene?.constructor?.name === 'BattleSceneV2',
    };
  });
  
  console.log('After walking:', afterWalking);
  
  await page.screenshot({ path: '/tmp/after-walking.png', fullPage: true });
  
  console.log('\n=== TEST COMPLETE ===');
});
