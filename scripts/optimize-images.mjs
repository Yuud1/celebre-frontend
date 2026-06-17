import fs from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'

const root = path.resolve(import.meta.dirname, '..')
const publicDir = path.join(root, 'public')

/** @type {{ input: string; maxWidth?: number; quality?: number; keepPng?: boolean }[]} */
const targets = [
  { input: 'img-01.png', maxWidth: 1280, quality: 90 },
  { input: 'img02.png', maxWidth: 1280, quality: 90 },
  { input: 'img03.png', maxWidth: 1280, quality: 90 },
  { input: 'img04.png', maxWidth: 1280, quality: 90 },
  { input: 'img05.png', maxWidth: 1280, quality: 90 },
  { input: 'img06.png', maxWidth: 1280, quality: 90 },
  { input: 'img07.png', maxWidth: 1280, quality: 90 },
  { input: 'img08.png', maxWidth: 1280, quality: 90 },
  { input: 'login-bg.png', maxWidth: 1280, quality: 90 },
  { input: 'chatbot.png', maxWidth: 96, quality: 92 },
  { input: 'logo-html.png', keepPng: true },
  { input: 'casais/casal-01.png', maxWidth: 256, quality: 92 },
  { input: 'casais/casal-02.png', maxWidth: 256, quality: 92 },
  { input: 'casais/casal-03.png', maxWidth: 256, quality: 92 },
  { input: 'casais/casal-04.png', maxWidth: 256, quality: 92 },
  { input: 'casais/casal-05.png', maxWidth: 256, quality: 92 },
  { input: 'casais/casal-06.png', maxWidth: 256, quality: 92 },
  { input: 'casais/casal-07.png', maxWidth: 256, quality: 92 },
]

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

async function optimizeOne({ input, maxWidth, quality = 90, keepPng = false }) {
  const sourcePath = path.join(publicDir, input)
  const before = (await fs.stat(sourcePath)).size

  let pipeline = sharp(sourcePath).rotate()

  if (maxWidth) {
    pipeline = pipeline.resize({
      width: maxWidth,
      withoutEnlargement: true,
      fit: 'inside',
    })
  }

  if (keepPng) {
    const tmpPath = `${sourcePath}.tmp`
    await pipeline
      .png({ compressionLevel: 9, effort: 10, palette: true })
      .toFile(tmpPath)
    await fs.rename(tmpPath, sourcePath)
    const after = (await fs.stat(sourcePath)).size
    return { input, format: 'png', before, after }
  }

  const webpPath = sourcePath.replace(/\.png$/i, '.webp')
  await pipeline
    .webp({
      quality,
      effort: 6,
      smartSubsample: true,
    })
    .toFile(webpPath)

  const after = (await fs.stat(webpPath)).size
  await fs.unlink(sourcePath)

  return { input, format: 'webp', before, after }
}

const results = []
for (const target of targets) {
  results.push(await optimizeOne(target))
}

let saved = 0
for (const row of results) {
  saved += row.before - row.after
  const pct = ((1 - row.after / row.before) * 100).toFixed(1)
  console.log(
    `${row.input.padEnd(24)} ${formatBytes(row.before).padStart(8)} → ${formatBytes(row.after).padStart(8)}  (-${pct}%)`,
  )
}

console.log(`\nTotal economizado: ${formatBytes(saved)}`)
