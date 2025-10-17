# Troubleshooting - Debug Guide

Common errors and how to fix them.

---

## 🚨 Build Errors

### Error: "Cannot find module 'pixi.js'"

**Cause**: Dependencies not installed

**Fix**:
```bash
npm install
```

### Error: "Module not found: Can't resolve '../core/Manager'"

**Cause**: Incorrect import path or file doesn't exist

**Fix**:
1. Check file exists: `ls src/core/Manager.ts`
2. Check import path is correct
3. Check file extension (.ts not needed in imports)

```typescript
// ❌ BAD
import { Manager } from '../core/Manager.ts';

// ✅ GOOD
import { Manager } from '../core/Manager';
```

### Error: "Vite build fails with out of memory"

**Cause**: Large bundle size or memory leak

**Fix**:
```bash
# Increase Node memory
NODE_OPTIONS="--max-old-space-size=4096" npm run build
```

---

## 🔴 TypeScript Errors

### Error: "Property 'x' does not exist on type 'Y'"

**Cause**: Type mismatch or missing property

**Fix**:
1. Check type definitions
2. Add property to interface
3. Use type assertion if necessary

```typescript
// Option 1: Fix type
interface Position {
  x: number;
  y: number;
}

// Option 2: Type assertion (use sparingly)
const pos = obj as Position;
```

### Error: "Cannot find name 'Matter'"

**Cause**: Missing type definitions

**Fix**:
```bash
npm install -D @types/matter-js
```

### Error: "Type 'undefined' is not assignable"

**Cause**: Strict null checks enabled

**Fix**:
```typescript
// Option 1: Use optional chaining
const value = obj?.property ?? defaultValue;

// Option 2: Type guard
if (obj !== undefined) {
  const value = obj.property;
}

// Option 3: Non-null assertion (use carefully)
const value = obj!.property;
```

---

## ❌ Test Failures

### Error: "ReferenceError: document is not defined"

**Cause**: Using browser API in Node test environment

**Fix**: Mock the browser API or use jsdom

```typescript
// vitest.config.ts
export default {
  test: {
    environment: 'jsdom'
  }
};
```

### Error: "Expected 5 but received 4.99999"

**Cause**: Floating point precision

**Fix**: Use approximate comparison
```typescript
// ❌ BAD
expect(result).toBe(5);

// ✅ GOOD
expect(result).toBeCloseTo(5, 2); // 2 decimal places
```

### Error: "Test timeout exceeded"

**Cause**: Async operation not completing

**Fix**:
```typescript
// Increase timeout
it('slow test', async () => {
  // ...
}, { timeout: 10000 }); // 10 seconds
```

---

## 🎮 Game Runtime Errors

### Error: "Cannot read property 'x' of null"

**Cause**: Accessing property of null/undefined object

**Debug**:
```typescript
// Add null checks
if (player !== null) {
  console.log(player.x);
}

// Or use optional chaining
console.log(player?.x ?? 0);
```

### Error: "Maximum call stack size exceeded"

**Cause**: Infinite recursion or circular reference

**Debug**:
1. Check for circular event listeners
2. Check for recursive function calls
3. Use browser debugger to find call stack

```typescript
// Example circular reference
eventBus.on('update', () => {
  eventBus.emit('update'); // ❌ Infinite loop!
});
```

### Error: "WebGL context lost"

**Cause**: GPU driver crash or too many WebGL contexts

**Fix**:
```typescript
// Handle context loss
app.renderer.on('context', (gl) => {
  console.log('WebGL context restored');
  // Reload textures
});
```

---

## 🔧 Matter.js Issues

### Issue: Bodies pass through walls

**Cause**: Velocity too high or body too small

**Fix**:
```typescript
// Option 1: Reduce max velocity
Matter.Body.setVelocity(body, {
  x: Math.max(-5, Math.min(5, body.velocity.x)),
  y: Math.max(-5, Math.min(5, body.velocity.y))
});

// Option 2: Enable CCD (Continuous Collision Detection)
const body = Matter.Bodies.circle(x, y, radius, {
  isBullet: true // Enable CCD
});

// Option 3: Increase wall thickness
const wall = Matter.Bodies.rectangle(x, y, width + 10, height, {
  isStatic: true
});
```

### Issue: Bodies move on their own

**Cause**: Gravity enabled

**Fix**:
```typescript
// Disable gravity for top-down game
const engine = Matter.Engine.create({
  gravity: { x: 0, y: 0 }
});
```

### Issue: Performance drops with many bodies

**Fix**:
```typescript
// Use static bodies for non-moving objects
const wall = Matter.Bodies.rectangle(x, y, w, h, {
  isStatic: true // No physics calculations
});

// Use compound bodies
const compound = Matter.Body.create({
  parts: [body1, body2, body3]
});

// Reduce engine accuracy for performance
Matter.Engine.update(engine, delta, 1); // 1 correction step
```

---

## 🎨 PixiJS Issues

### Issue: Sprites not appearing

**Debug**:
```typescript
// Check sprite is added to stage
console.log(app.stage.children.includes(sprite)); // Should be true

// Check sprite is visible
console.log(sprite.visible); // Should be true

// Check sprite position
console.log(sprite.position); // Should be in viewport

// Check sprite alpha
console.log(sprite.alpha); // Should be > 0

// Check sprite scale
console.log(sprite.scale); // Should be > 0
```

### Issue: Low FPS

**Causes & Fixes**:

1. **Too many draw calls**
```typescript
// Use texture atlas
const sheet = PIXI.Spritesheet.from('/assets/atlas.json');

// Use ParticleContainer for many sprites
const particles = new PIXI.ParticleContainer(10000);
```

2. **Large textures**
```typescript
// Compress textures
// Use appropriate sizes (power of 2)
```

3. **Too many entities**
```typescript
// Implement object pooling
// Cull off-screen entities
if (entity.x < camera.x - 100 || entity.x > camera.x + width + 100) {
  entity.visible = false;
}
```

### Issue: Texture loaded but shows white square

**Cause**: CORS or wrong texture key

**Debug**:
```typescript
// Check texture loaded
console.log(PIXI.Assets.cache.has('texture-key'));

// Check texture valid
const texture = PIXI.Texture.from('texture-key');
console.log(texture.valid); // Should be true

// Check texture size
console.log(texture.width, texture.height); // Should not be 0
```

---

## 🎬 GSAP Issues

### Issue: Animation not working

**Debug**:
```typescript
// Check target exists
console.log(sprite); // Should not be null

// Check property is animatable
gsap.to(sprite, {
  x: 100, // ✅ Direct property
  position: { x: 100 } // ❌ Nested properties don't work
});

// Check duration
gsap.to(sprite, {
  x: 100,
  duration: 0.5 // Must specify duration
});
```

### Issue: Animation jumps to end immediately

**Cause**: Missing duration

**Fix**:
```typescript
// ❌ BAD: No duration
gsap.to(sprite, { x: 100 });

// ✅ GOOD: With duration
gsap.to(sprite, { x: 100, duration: 0.5 });
```

---

## 📦 Asset Loading Issues

### Issue: 404 - Asset not found

**Debug**:
```bash
# Check file exists
ls public/assets/image.png

# Check path is correct (case-sensitive!)
# ❌ /Assets/Image.PNG
# ✅ /assets/image.png
```

### Issue: Asset loads in dev but not production

**Cause**: Path doesn't account for base URL

**Fix**:
```typescript
// ❌ BAD: Absolute path
PIXI.Texture.from('/assets/image.png');

// ✅ GOOD: Relative to base
import.meta.env.BASE_URL + 'assets/image.png'

// Or use Vite's public directory
PIXI.Texture.from('./assets/image.png');
```

---

## 🐛 General Debugging Tips

### Enable Debug Mode
```typescript
// Add to main.ts
if (import.meta.env.DEV) {
  window.DEBUG = true;
  
  // Expose globals for debugging
  window.game = game;
  window.physics = PhysicsManager.getInstance();
}
```

### Use Browser DevTools
```typescript
// Breakpoints
debugger; // Execution stops here

// Performance profiling
console.time('expensive-operation');
expensiveOperation();
console.timeEnd('expensive-operation');

// Watch expressions
console.log({ player, enemy, damage });
```

### Matter.js Debug Rendering
```typescript
// Enable wireframe rendering
import Matter from 'matter-js';

const render = Matter.Render.create({
  element: document.body,
  engine: physics.engine,
  options: {
    width: 800,
    height: 600,
    wireframes: true,
    showVelocity: true,
    showCollisions: true
  }
});

Matter.Render.run(render);
```

### PixiJS Debug
```typescript
// Enable stats
app.ticker.add(() => {
  console.log('FPS:', app.ticker.FPS);
  console.log('Delta:', app.ticker.deltaMS);
});

// Inspector (Chrome extension)
window.__PIXI_APP__ = app;
```

---

## 📝 Getting More Help

### Check Documentation
- **PixiJS**: https://pixijs.com/docs
- **Matter.js**: https://brm.io/matter-js/docs/
- **GSAP**: https://greensock.com/docs/
- **Vitest**: https://vitest.dev/guide/

### Search for Similar Issues
```bash
# Search GitHub issues
# Format: "[library] [error message]"
"Matter.js bodies pass through walls"
"PixiJS sprite not showing"
"GSAP animation not working"
```

### Common Search Queries
- "PixiJS + [issue]"
- "Matter.js physics [problem]"
- "GSAP tween not animating"
- "Vitest mock [feature]"

---

**Last Updated**: 2025-10-17  
**Version**: 1.0.0
