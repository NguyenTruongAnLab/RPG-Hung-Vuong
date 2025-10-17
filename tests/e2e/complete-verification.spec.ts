import { test } from '@playwright/test';

test('Complete feature verification', async ({ page }) => {
  const logs: string[] = [];
  
  page.on('console', msg => {
    logs.push(`[${msg.type()}] ${msg.text()}`);
  });
  
  await page.goto('http://localhost:3000/demo.html');
  await page.waitForTimeout(3000);
  
  // Get complete game state
  const gameState = await page.evaluate(() => {
    const app = (window as any).app;
    const scene = (window as any).scene;
    const sceneManager = (window as any).sceneManager;
    
    // Find player in scene
    let player = null;
    if (scene && scene.children) {
      for (const child of scene.children) {
        if (child.label === 'player' || child.constructor.name === 'Player') {
          player = child;
          break;
        }
      }
    }
    
    return {
      app: {
        exists: !!app,
        hasStage: !!app?.stage,
        stageChildren: app?.stage?.children?.length || 0,
        ticker: !!app?.ticker,
      },
      scene: {
        exists: !!scene,
        type: scene?.constructor?.name,
        childrenCount: scene?.children?.length || 0,
        childrenTypes: scene?.children?.map((c: any) => c.constructor?.name || c.label || 'unknown') || [],
      },
      player: {
        exists: !!player,
        position: player ? { x: player.x, y: player.y } : null,
        visible: player?.visible,
        type: player?.constructor?.name,
      },
      sceneManager: {
        exists: !!sceneManager,
        currentScene: sceneManager?.currentScene?.constructor?.name,
      }
    };
  });
  
  console.log('\n=== GAME STATE ===');
  console.log(JSON.stringify(gameState, null, 2));
  
  // Test movement
  console.log('\n=== TESTING MOVEMENT ===');
  const beforeMove = await page.evaluate(() => {
    const scene = (window as any).scene;
    let player = null;
    if (scene?.children) {
      for (const child of scene.children) {
        if (child.label === 'player' || child.constructor.name === 'Player') {
          player = child;
          break;
        }
      }
    }
    return player ? { x: player.x, y: player.y } : null;
  });
  
  console.log('Position before move:', beforeMove);
  
  // Press W key
  await page.keyboard.press('w');
  await page.waitForTimeout(500);
  
  const afterMove = await page.evaluate(() => {
    const scene = (window as any).scene;
    let player = null;
    if (scene?.children) {
      for (const child of scene.children) {
        if (child.label === 'player' || child.constructor.name === 'Player') {
          player = child;
          break;
        }
      }
    }
    return player ? { x: player.x, y: player.y } : null;
  });
  
  console.log('Position after move:', afterMove);
  console.log('Movement detected:', beforeMove && afterMove && (beforeMove.y !== afterMove.y || beforeMove.x !== afterMove.x));
  
  // Check for specific systems
  const systems = await page.evaluate(() => {
    return {
      physics: typeof (window as any).PhysicsManager !== 'undefined',
      input: typeof (window as any).InputManager !== 'undefined',
      eventBus: typeof (window as any).EventBus !== 'undefined',
    };
  });
  
  console.log('\n=== SYSTEMS ===');
  console.log(JSON.stringify(systems, null, 2));
  
  // Count animation warnings
  const animationWarnings = logs.filter(log => log.includes('Cannot play animation')).length;
  console.log('\n=== WARNINGS ===');
  console.log(`Animation warnings: ${animationWarnings}`);
  
  await page.screenshot({ path: '/tmp/complete-verification.png', fullPage: true });
});
