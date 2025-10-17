/**
 * ParticleSystem - Visual effects particle system
 * 
 * Emits and manages particle effects for combat and
 * environmental feedback.
 * 
 * @example
 * ```typescript
 * const particles = new ParticleSystem();
 * scene.addChild(particles);
 * particles.emit(x, y, 20, 0xFF6600);
 * 
 * // In update loop
 * particles.update(delta);
 * ```
 */
import * as PIXI from 'pixi.js';

interface Particle extends PIXI.Graphics {
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
}

export class ParticleSystem extends PIXI.Container {
  private particles: Particle[] = [];
  
  /**
   * Emit particles at position
   * 
   * @param x - X position
   * @param y - Y position
   * @param count - Number of particles to emit
   * @param color - Particle color (hex)
   * @param options - Additional options
   * 
   * @example
   * ```typescript
   * particles.emit(400, 300, 20, 0xFF6600, { speed: 8, size: 4 });
   * ```
   */
  emit(
    x: number, 
    y: number, 
    count: number, 
    color: number,
    options: {
      speed?: number;
      size?: number;
      gravity?: number;
      spread?: number;
    } = {}
  ): void {
    const {
      speed = 6,
      size = 3,
      gravity = 0.3,
      spread = 1
    } = options;

    for (let i = 0; i < count; i++) {
      const particle = new PIXI.Graphics() as Particle;
      particle.beginFill(color);
      particle.drawCircle(0, 0, Math.random() * size + 1);
      particle.endFill();
      
      particle.position.set(x, y);
      particle.alpha = 1;
      
      // Random velocity with spread
      const angle = Math.random() * Math.PI * 2;
      const velocity = Math.random() * speed;
      particle.vx = Math.cos(angle) * velocity * spread;
      particle.vy = Math.sin(angle) * velocity * spread - Math.random() * 3;
      
      particle.life = 1;
      particle.maxLife = 1;
      
      this.particles.push(particle);
      this.addChild(particle);
    }
  }
  
  /**
   * Emit directional particles (e.g., attack direction)
   * 
   * @param x - X position
   * @param y - Y position
   * @param count - Number of particles
   * @param color - Particle color
   * @param angle - Direction angle in radians
   * @param spread - Spread angle in radians
   */
  emitDirectional(
    x: number,
    y: number,
    count: number,
    color: number,
    angle: number,
    spread: number = 0.5
  ): void {
    for (let i = 0; i < count; i++) {
      const particle = new PIXI.Graphics() as Particle;
      particle.beginFill(color);
      particle.drawCircle(0, 0, Math.random() * 3 + 2);
      particle.endFill();
      
      particle.position.set(x, y);
      particle.alpha = 1;
      
      // Directional velocity with spread
      const particleAngle = angle + (Math.random() - 0.5) * spread;
      const velocity = Math.random() * 8 + 4;
      particle.vx = Math.cos(particleAngle) * velocity;
      particle.vy = Math.sin(particleAngle) * velocity;
      
      particle.life = 1;
      particle.maxLife = 1;
      
      this.particles.push(particle);
      this.addChild(particle);
    }
  }
  
  /**
   * Emit explosion particles
   * 
   * @param x - X position
   * @param y - Y position
   * @param count - Number of particles
   * @param colors - Array of colors to use
   */
  emitExplosion(
    x: number,
    y: number,
    count: number,
    colors: number[] = [0xFF6600, 0xFF9900, 0xFFCC00]
  ): void {
    for (let i = 0; i < count; i++) {
      const particle = new PIXI.Graphics() as Particle;
      const color = colors[Math.floor(Math.random() * colors.length)];
      
      particle.beginFill(color);
      particle.drawCircle(0, 0, Math.random() * 4 + 2);
      particle.endFill();
      
      particle.position.set(x, y);
      particle.alpha = 1;
      
      // Explosive velocity
      const angle = Math.random() * Math.PI * 2;
      const velocity = Math.random() * 12 + 8;
      particle.vx = Math.cos(angle) * velocity;
      particle.vy = Math.sin(angle) * velocity;
      
      particle.life = 1;
      particle.maxLife = 1;
      
      this.particles.push(particle);
      this.addChild(particle);
    }
  }
  
  /**
   * Update particle system
   * 
   * @param delta - Delta time (typically 1 for 60fps)
   */
  update(delta: number): void {
    this.particles = this.particles.filter(p => {
      // Apply gravity
      p.vy += 0.5 * delta;
      
      // Move particle
      p.x += p.vx * delta;
      p.y += p.vy * delta;
      
      // Decrease life
      p.life -= 0.03 * delta;
      p.alpha = p.life;
      
      // Remove if dead
      if (p.life <= 0) {
        this.removeChild(p);
        p.destroy();
        return false;
      }
      
      return true;
    });
  }
  
  /**
   * Clear all particles
   */
  clear(): void {
    this.particles.forEach(p => {
      this.removeChild(p);
      p.destroy();
    });
    this.particles = [];
  }
  
  /**
   * Get particle count
   */
  getParticleCount(): number {
    return this.particles.length;
  }
  
  /**
   * Cleanup
   */
  destroy(): void {
    this.clear();
    super.destroy();
  }
}
