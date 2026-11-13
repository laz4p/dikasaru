import {build} from 'esbuild';
await build({entryPoints:['components/site.jsx'],bundle:true,minify:true,outfile:'assets/site-effects.js',format:'iife',jsx:'automatic',define:{'process.env.NODE_ENV':'"production"'}});
await build({entryPoints:['assets/theme-entry.css'],bundle:true,minify:true,outfile:'assets/styles.css',external:['*.woff2','*.svg','*.png','*.ttf']});
await build({entryPoints:['assets/runtime-entry.js'],bundle:true,minify:true,outfile:'assets/site-runtime.js',format:'iife'});
