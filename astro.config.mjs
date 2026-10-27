// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';

import tailwindcss from '@tailwindcss/vite';

import node from '@astrojs/node';

// https://astro.build/config
export default defineConfig({
  output: 'server',
  
  integrations: [react()],

  server: {
    // Windows resuelve localhost a 127.0.0.1. Sin esto Astro queda solo en ::1
    // y el navegador no puede conectar.
    host: "0.0.0.0",
    port: 4321,
  },

  vite: {
    plugins: [tailwindcss()],
    server:{
      allowedHosts: [
        "feria.inginformatica.app",
        "feria.cimasoft.app",
      ]
    }
  },

  devToolbar: {enabled: false},

  adapter: node({
    mode: 'standalone'
  })
});