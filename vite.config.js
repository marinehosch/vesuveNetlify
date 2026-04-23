import { defineConfig } from 'vite'
import dsv from '@rollup/plugin-dsv'

export default defineConfig({
  plugins: [
    dsv(),
  ],
  resolve: {
    alias: {
      // Dit à Vite d'utiliser la version pré-compilée de proj4
      'proj4': 'proj4/dist/proj4.js' 
    }
  }
})
