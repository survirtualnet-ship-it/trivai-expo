import { readFileSync, writeFileSync } from 'fs'
import { join } from 'path'

const distHtml = join(process.cwd(), 'dist', 'index.html')
let html = readFileSync(distHtml, 'utf8')

const pwaHead = `
  <link rel="manifest" href="/manifest.json" />
  <meta name="theme-color" content="#6D28FF" />
  <meta name="mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-status-bar-style" content="default" />
  <meta name="apple-mobile-web-app-title" content="Trivai" />
  <link rel="apple-touch-icon" href="/apple-touch-icon.png" />`

html = html.replace('</head>', pwaHead + '\n</head>')
writeFileSync(distHtml, html, 'utf8')
console.log('PWA meta tags injected into dist/index.html')
