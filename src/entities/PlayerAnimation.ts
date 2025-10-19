export class PlayerAnimation {
  private armatureDisplay: any = null;

  constructor(armatureDisplay?: any) {
    if (armatureDisplay) this.armatureDisplay = armatureDisplay;
  }

  // Play animation safely, guarding against missing armature display
  play(name: string, loop: boolean = true) {
    if (!this.armatureDisplay) {
      console.warn('Cannot play animation: armature display not set');
      return;
    }

    try {
      if (typeof this.armatureDisplay.animation?.play === 'function') {
        this.armatureDisplay.animation.play(name, loop);
      } else if (typeof this.armatureDisplay.play === 'function') {
        this.armatureDisplay.play(name, loop);
      } else {
        console.warn('Armature display does not support play()', this.armatureDisplay);
      }
    } catch (e) {
      console.error('Error while playing animation', e);
    }
  }
}