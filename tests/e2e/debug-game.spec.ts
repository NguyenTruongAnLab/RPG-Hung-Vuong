import { test } from '@playwright/test';

test('Debug game initialization', async ({ page }) => {
  const logs: string[] = [];
  const errors: string[] = [];
  
  page.on('console', msg => {
    const text = msg.text();
    logs.push(`[${msg.type()}] ${text}`);
    if (msg.type() === 'error') {
      errors.push(text);
    }
  });
  
  page.on('pageerror', err => {
    errors.push(`PAGE ERROR: ${err.message}`);
    console.log('PAGE ERROR:', err.message);
    console.log('Stack:', err.stack);
  });
  
  await page.goto('http://localhost:3000/demo.html');
  await page.waitForTimeout(5000);
  
  console.log('\n=== ALL CONSOLE LOGS ===');
  logs.forEach(log => console.log(log));
  
  console.log('\n=== ERRORS ===');
  if (errors.length > 0) {
    errors.forEach(err => console.log(err));
  } else {
    console.log('No errors found');
  }
  
  // Try to get window.app
  const appInfo = await page.evaluate(() => {
    // @ts-ignore
    return {
      hasApp: typeof window.app !== 'undefined',
      appType: typeof window.app,
      hasStage: !!(window as any).app?.stage,
      stageChildren: (window as any).app?.stage?.children?.length || 0,
      error: (window as any).gameError || null
    };
  });
  
  console.log('\n=== APP INFO ===');
  console.log(JSON.stringify(appInfo, null, 2));
  
  await page.screenshot({ path: '/tmp/debug-screenshot.png', fullPage: true });
});
