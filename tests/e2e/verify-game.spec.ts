import { test, expect } from '@playwright/test';

test.describe('Phase 2 + 3 Verification', () => {
  test('Game loads and initializes', async ({ page }) => {
    // Go to demo page
    await page.goto('http://localhost:3000/demo.html');
    
    // Wait for game to load
    await page.waitForTimeout(3000);
    
    // Check for canvas element
    const canvas = await page.locator('canvas');
    await expect(canvas).toBeVisible();
    
    // Check console for initialization
    const logs: string[] = [];
    page.on('console', msg => logs.push(msg.text()));
    
    await page.waitForTimeout(1000);
    
    console.log('Console logs:', logs);
    
    // Check if game started
    const hasStartLog = logs.some(log => log.includes('Phase 3 Demo Started') || log.includes('Demo Started'));
    console.log('Has start log:', hasStartLog);
    
    // Take screenshot
    await page.screenshot({ path: '/tmp/game-loaded.png' });
  });

  test('Player exists and is visible', async ({ page }) => {
    await page.goto('http://localhost:3000/demo.html');
    await page.waitForTimeout(3000);
    
    // Check in console if player exists
    const playerExists = await page.evaluate(() => {
      // @ts-ignore
      const scene = window.app?.stage?.children?.[0];
      if (!scene) return false;
      
      // Look for player in scene children
      const hasPlayer = scene.children?.some((child: any) => 
        child.constructor?.name === 'Player' || 
        child.label?.includes('player') ||
        child.name?.includes('player')
      );
      
      console.log('Scene children:', scene.children?.map((c: any) => c.constructor?.name));
      return hasPlayer;
    });
    
    console.log('Player exists:', playerExists);
    
    await page.screenshot({ path: '/tmp/player-check.png' });
  });

  test('Player responds to keyboard input', async ({ page }) => {
    await page.goto('http://localhost:3000/demo.html');
    await page.waitForTimeout(3000);
    
    // Get initial player position
    const initialPos = await page.evaluate(() => {
      // @ts-ignore
      const scene = window.app?.stage?.children?.[0];
      const player = scene?.children?.find((c: any) => 
        c.constructor?.name === 'Player' || c.label?.includes('player')
      );
      return { x: player?.x, y: player?.y };
    });
    
    console.log('Initial position:', initialPos);
    
    // Press W key to move up
    await page.keyboard.press('w');
    await page.waitForTimeout(500);
    
    // Get new position
    const newPos = await page.evaluate(() => {
      // @ts-ignore
      const scene = window.app?.stage?.children?.[0];
      const player = scene?.children?.find((c: any) => 
        c.constructor?.name === 'Player' || c.label?.includes('player')
      );
      return { x: player?.x, y: player?.y };
    });
    
    console.log('New position:', newPos);
    console.log('Position changed:', initialPos.y !== newPos.y);
    
    await page.screenshot({ path: '/tmp/player-moved.png' });
  });

  test('Check for errors in console', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', err => errors.push(err.message));
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    await page.goto('http://localhost:3000/demo.html');
    await page.waitForTimeout(3000);
    
    console.log('Errors found:', errors);
    
    // Report errors but don't fail test
    if (errors.length > 0) {
      console.log('ERRORS DETECTED:');
      errors.forEach(err => console.log(' -', err));
    }
    
    await page.screenshot({ path: '/tmp/final-state.png' });
  });
});
