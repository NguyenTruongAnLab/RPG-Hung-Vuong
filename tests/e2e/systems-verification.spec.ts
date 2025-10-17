import { test } from '@playwright/test';

test('Verify game systems are working', async ({ page }) => {
  await page.goto('http://localhost:3000/demo.html');
  await page.waitForTimeout(3000);
  
  // Check complete game state
  const state = await page.evaluate(() => {
    const app = (window as any).app;
    const scene = (window as any).scene;
    
    // Check physics bodies
    const physics = (window as any).PhysicsManager?.getInstance?.();
    const world = physics?.getWorld?.();
    const bodies = world?.bodies || [];
    
    // Check input manager
    const input = (window as any).InputManager?.getInstance?.();
    
    // Find player body
    const playerBody = bodies.find((b: any) => b.label === 'player');
    
    return {
      app: {
        running: !!app?.ticker?.started,
        stageChildren: app?.stage?.children?.length || 0,
      },
      scene: {
        type: scene?.constructor?.name,
        childrenCount: scene?.children?.length || 0,
      },
      physics: {
        exists: !!physics,
        bodyCount: bodies.length,
        playerBody: playerBody ? {
          position: { x: playerBody.position.x, y: playerBody.position.y },
          velocity: { x: playerBody.velocity.x, y: playerBody.velocity.y },
        } : null,
      },
      input: {
        exists: !!input,
      },
    };
  });
  
  console.log('\n=== COMPLETE GAME STATE ===');
  console.log(JSON.stringify(state, null, 2));
  
  // Test movement
  if (state.physics.playerBody) {
    console.log('\n=== TESTING MOVEMENT ===');
    console.log('Initial position:', state.physics.playerBody.position);
    
    // Hold down W key
    await page.keyboard.down('w');
    await page.waitForTimeout(300);
    await page.keyboard.up('w');
    await page.waitForTimeout(200);
    
    const afterMove = await page.evaluate(() => {
      const physics = (window as any).PhysicsManager?.getInstance?.();
      const world = physics?.getWorld?.();
      const bodies = world?.bodies || [];
      const playerBody = bodies.find((b: any) => b.label === 'player');
      
      return playerBody ? {
        position: { x: playerBody.position.x, y: playerBody.position.y },
        velocity: { x: playerBody.velocity.x, y: playerBody.velocity.y },
      } : null;
    });
    
    console.log('After W press:', afterMove);
    
    if (afterMove) {
      const moved = afterMove.position.y < state.physics.playerBody.position.y;
      console.log('Player moved UP:', moved);
    }
  }
  
  await page.screenshot({ path: '/tmp/systems-verification.png', fullPage: true });
  
  console.log('\n=== CONCLUSION ===');
  console.log('✅ App running:', state.app.running);
  console.log('✅ Scene loaded:', state.scene.type === 'OverworldScene');
  console.log('✅ Physics active:', state.physics.bodyCount > 0);
  console.log('✅ Player exists:', !!state.physics.playerBody);
  console.log('✅ Input manager:', state.input.exists);
});
