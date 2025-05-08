import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // Escucha en todas las interfaces
    port: 3000, // Puerto que usa Vite
    strictPort: true, // Falla si el puerto ya está en uso
    watch: {
      usePolling: true, // Necesario para entornos Docker
    },
  },
});
