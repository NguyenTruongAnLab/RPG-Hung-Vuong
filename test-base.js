import { defineConfig } from 'vite';

const config = defineConfig(({ command, mode }) => {
  console.log('Command:', command);
  console.log('Mode:', mode);
  return {
    base: command === 'build' ? '/RPG-Hung-Vuong/' : './',
  };
});

console.log('Config:', config);
