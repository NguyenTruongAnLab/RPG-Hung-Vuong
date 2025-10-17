import { test } from '@playwright/test';

test('Check setTimeout execution in battle', async ({ page }) => {
  const allLogs: string[] = [];
  
  page.on('console', msg => {
    const text = msg.text();
    allLogs.push(`[${msg.type()}] ${text}`);
  });
  
  page.on('pageerror', err => {
    console.log('PAGE ERROR:', err.message);
  });
  
  await page.goto('http://localhost:3000/demo.html');
  await page.waitForTimeout(3000);
  
  // Trigger battle
  await page.evaluate(() => {
    const eventBus = (window as any).EventBus?.getInstance?.();
    eventBus?.emit('encounter:trigger', { zone: 'test', enemyId: 'char001' });
  });
  
  await page.waitForTimeout(2000);
  
  // Test setTimeout directly
  const testTimeout = await page.evaluate(() => {
    return new Promise((resolve) => {
      console.log('Testing setTimeout...');
      setTimeout(() => {
        console.log('setTimeout executed!');
        resolve(true);
      }, 1000);
    });
  });
  
  console.log('setTimeout test result:', testTimeout);
  
  await page.waitForTimeout(5000);
  
  // Print all logs
  console.log('\n=== ALL LOGS ===');
  allLogs.forEach(log => console.log(log));
  
  // Check for specific battle logs
  const hasStartBattle = allLogs.some(log => log.includes('Battle Start'));
  const hasExecuteTurn = allLogs.some(log => log.includes('executeTurn'));
  const hasPlayerAttack = allLogs.some(log => log.includes('Player attacks'));
  
  console.log('\n=== BATTLE LOG CHECK ===');
  console.log('Has "Battle Start":', hasStartBattle);
  console.log('Has executeTurn log:', hasExecuteTurn);
  console.log('Has "Player attacks":', hasPlayerAttack);
});
