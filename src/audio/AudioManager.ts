// Add a user interaction listener to resume AudioContext
window.addEventListener('click', () => {
  if (Howler.ctx && Howler.ctx.state === 'suspended') {
    Howler.ctx.resume().then(() => {
      console.log('AudioContext resumed after user interaction');
    });
  }
});