/**
 * Converts all referenced portfolio/content images to optimised WebP.
 * Logos stay as PNG (transparency + text = lossless is better).
 * Run once: node scripts/convert-to-webp.mjs
 */
import sharp from 'sharp'
import { existsSync } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const imgDir = path.join(__dirname, '..', 'public', 'images')

// Each entry: source filename, output filename, max width in px, quality
const images = [
  // Homepage portfolio (displayed at ~25vw = ~300px, but 2× for retina = 600px)
  { src: 'tile-backsplash-portfolio.jpeg',       out: 'tile-backsplash-portfolio.webp',       maxW: 900,  q: 82 },
  { src: 'tile-floor-portfolio.JPG',             out: 'tile-floor-portfolio.webp',             maxW: 900,  q: 82 },
  { src: 'fine-woodwork-portfolio.JPG',          out: 'fine-woodwork-portfolio.webp',          maxW: 900,  q: 82 },
  { src: 'kitchen-lighting-install-portfolio.JPG', out: 'kitchen-lighting-install-portfolio.webp', maxW: 900, q: 82 },

  // Service page hero images (displayed at ~50vw ≤ 576px, 2× = 1152px)
  { src: 'vynil-kitchen-floor-portfolio.JPG',    out: 'vynil-kitchen-floor-portfolio.webp',    maxW: 1200, q: 82 },
  { src: 'shower-tile-portfolio.jpeg',           out: 'shower-tile-portfolio.webp',            maxW: 1200, q: 82 },
  { src: 'vanity-lighting-portfolio.jpeg',       out: 'vanity-lighting-portfolio.webp',        maxW: 1200, q: 82 },
  { src: 'kitchen-flooring-portfolio.JPG',       out: 'kitchen-flooring-portfolio.webp',       maxW: 1200, q: 82 },
  { src: 'tile-backsplash-gray-portfolio.JPG',   out: 'tile-backsplash-gray-portfolio.webp',   maxW: 1200, q: 82 },

  // About page owner photo (displayed at max 384px, 2× = 768px)
  { src: 'Chad-arkhandyman-about.jpg',           out: 'Chad-arkhandyman-about.webp',           maxW: 800,  q: 84 },
]

let saved = 0
for (const { src, out, maxW, q } of images) {
  const input = path.join(imgDir, src)
  const output = path.join(imgDir, out)
  if (!existsSync(input)) { console.warn(`  SKIP (not found): ${src}`); continue }

  const { size: before } = await import('fs').then(m => m.promises.stat(input))
  await sharp(input).resize({ width: maxW, withoutEnlargement: true }).webp({ quality: q }).toFile(output)
  const { size: after } = await import('fs').then(m => m.promises.stat(output))

  const pct = Math.round((1 - after / before) * 100)
  saved += before - after
  console.log(`  ${src.padEnd(48)} ${(before/1024).toFixed(0).padStart(5)}KB → ${(after/1024).toFixed(0).padStart(4)}KB  (-${pct}%)`)
}

console.log(`\nTotal saved: ${(saved / 1024 / 1024).toFixed(1)} MB`)
