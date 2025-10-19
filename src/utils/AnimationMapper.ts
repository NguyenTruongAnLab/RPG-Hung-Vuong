/**
 * AnimationMapper - Intelligent animation name detection and mapping
 * 
 * With 200+ DragonBones assets having different animation naming schemes,
 * this utility intelligently maps requested animations (idle, walk, attack, damage)
 * to available animations using keyword matching and fallback strategies.
 * 
 * @example
 * ```typescript
 * const mapper = new AnimationMapper(['Idle', 'Run', 'Attack1', 'Attack2', 'Hurt']);
 * 
 * // Intelligent mapping
 * mapper.getAnimation('idle')      // Returns 'Idle'
 * mapper.getAnimation('walk')      // Returns 'Idle' (neutral pose for movement)
 * mapper.getAnimation('attack')    // Returns 'Attack1'
 * mapper.getAnimation('damage')    // Returns 'Hurt'
 * ```
 */

/**
 * Categories of animations for mapping
 */
export type AnimationCategory = 'idle' | 'walk' | 'attack' | 'damage';

/**
 * Mapping result
 */
export interface AnimationMappingResult {
  /** The mapped animation name */
  animationName: string;
  /** Whether this was an exact match or a fallback */
  isExact: boolean;
  /** The category this was mapped to */
  category: AnimationCategory;
}

export class AnimationMapper {
  private availableAnimations: string[] = [];
  private cache: Map<string, AnimationMappingResult> = new Map();

  constructor(availableAnimations: string[] = []) {
    this.availableAnimations = availableAnimations;
  }

  /**
   * Updates available animations
   */
  setAvailableAnimations(animations: string[]): void {
    this.availableAnimations = animations;
    this.cache.clear();
  }

  /**
   * Gets the best animation match for a requested animation
   * Uses intelligent keyword matching with fallback strategy
   * 
   * @param requestedAnimation - The animation name requested (e.g., 'Walk', 'Attack')
   * @returns Mapping result with animation name and metadata
   */
  getAnimation(requestedAnimation: string): AnimationMappingResult {
    // Check cache first
    const cacheKey = requestedAnimation.toLowerCase();
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    const result = this.findBestMatch(requestedAnimation);
    this.cache.set(cacheKey, result);
    
    // Log mapping for debugging
    if (!result.isExact) {
      console.debug(`AnimationMapper: "${requestedAnimation}" → "${result.animationName}" (${result.category})`);
    }
    
    return result;
  }

  /**
   * Gets all animations matching a category
   */
  getAnimationsByCategory(category: AnimationCategory): string[] {
    const keywords = this.getCategoryKeywords(category);
    return this.availableAnimations.filter(anim => 
      keywords.some(kw => anim.toLowerCase().includes(kw))
    );
  }

  /**
   * Internal: Find best match using intelligent keyword matching
   */
  private findBestMatch(requestedAnimation: string): AnimationMappingResult {
    const requested = requestedAnimation.toLowerCase();
    const category = this.inferCategory(requested);

    // Try exact match first
    const exactMatch = this.findExactMatch(requested);
    if (exactMatch) {
      return { animationName: exactMatch, isExact: true, category };
    }

    // Try keyword matching
    const keywordMatch = this.findKeywordMatch(requested, category);
    if (keywordMatch) {
      return { animationName: keywordMatch, isExact: false, category };
    }

    // Use structured fallback based on category
    const fallback = this.getFallback(category);
    return { animationName: fallback, isExact: false, category };
  }

  /**
   * Infer the animation category from the requested name
   */
  private inferCategory(requested: string): AnimationCategory {
    if (requested.includes('attack') || requested.includes('strike') || requested.includes('swing')) {
      return 'attack';
    }
    if (requested.includes('damage') || requested.includes('hurt') || requested.includes('pain') || requested.includes('knocked')) {
      return 'damage';
    }
    if (requested.includes('walk') || requested.includes('move') || requested.includes('run')) {
      return 'walk';
    }
    return 'idle'; // Default
  }

  /**
   * Find exact case-insensitive match
   */
  private findExactMatch(requested: string): string | null {
    return this.availableAnimations.find(anim => anim.toLowerCase() === requested) || null;
  }

  /**
   * Find match using keywords specific to category
   */
  private findKeywordMatch(requested: string, category: AnimationCategory): string | null {
    const keywords = this.getCategoryKeywords(category);

    // Primary keywords (highest priority)
    for (const keyword of keywords) {
      const match = this.availableAnimations.find(anim =>
        anim.toLowerCase().includes(keyword)
      );
      if (match) return match;
    }

    // Secondary fallback: if walk requested, try idle animations
    if (category === 'walk') {
      const idleMatch = this.availableAnimations.find(anim =>
        anim.toLowerCase().includes('idle')
      );
      if (idleMatch) return idleMatch;
    }

    return null;
  }

  /**
   * Get keywords for a category
   */
  private getCategoryKeywords(category: AnimationCategory): string[] {
    switch (category) {
      case 'idle':
        return ['idle', 'stand', 'rest', 'stance', 'pose'];
      case 'walk':
        return ['walk', 'move', 'run', 'step', 'stride'];
      case 'attack':
        return ['attack', 'strike', 'swing', 'punch', 'slash', 'hit', 'action'];
      case 'damage':
        return ['damage', 'hurt', 'pain', 'knocked', 'react', 'flinch', 'stagger'];
      default:
        return [];
    }
  }

  /**
   * Get structured fallback based on animation count
   * Assumes animations are organized: [idle/neutral, walk/movement, damage, attack1, attack2, attack3...]
   * 
   * Handles various asset animation patterns:
   * - Single animation: use for everything
   * - 2 animations: [idle/neutral, attack]
   * - 3+ animations: [attack1, attack2, damage] or [idle, walk, attack, damage]
   * - 5 animations (Absolution): [attack A, attack B, attack C, attack D, damage]
   */
  private getFallback(category: AnimationCategory): string {
    if (this.availableAnimations.length === 0) {
      throw new Error('No animations available for fallback');
    }

    // If we only have 1 animation, use it for everything
    if (this.availableAnimations.length === 1) {
      return this.availableAnimations[0];
    }

    // For 2-5 animations, use intelligent mapping
    const animCount = this.availableAnimations.length;
    
    switch (category) {
      case 'idle':
      case 'walk':
        // For idle/walk, prefer first animation (often neutral/idle pose)
        // For Absolution (Attack A, B, C, D, Damage), use Attack A (index 0)
        return this.availableAnimations[0];
        
      case 'damage':
        // For damage, look for "damage" keyword first
        const damageAnim = this.availableAnimations.find(a => 
          a.toLowerCase().includes('damage') || 
          a.toLowerCase().includes('hurt') ||
          a.toLowerCase().includes('react')
        );
        if (damageAnim) return damageAnim;
        
        // Fallback: use middle-ish animation (often damage/reaction)
        if (animCount === 2) return this.availableAnimations[1]; // Use second
        if (animCount <= 5) return this.availableAnimations[animCount - 1]; // Use last (Damage for Absolution)
        return this.availableAnimations[Math.floor(animCount / 2)]; // Use middle for larger sets
        
      case 'attack':
        // For attack, prefer attack keywords
        const attackAnim = this.availableAnimations.find(a =>
          a.toLowerCase().includes('attack') ||
          a.toLowerCase().includes('strike') ||
          a.toLowerCase().includes('swing')
        );
        if (attackAnim) return attackAnim;
        
        // Fallback: use last animations (usually attacks)
        return this.availableAnimations[this.availableAnimations.length - 1];
        
      default:
        return this.availableAnimations[0];
    }
  }
}
