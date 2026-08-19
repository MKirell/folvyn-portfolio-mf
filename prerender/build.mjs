import { cpSync, mkdirSync, rmSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { build } from 'esbuild'

const here = dirname(fileURLToPath(import.meta.url))
const root = resolve(here, '..')
const out = resolve(root, 'dist-prerender')
const require = createRequire(import.meta.url)
rmSync(out, { recursive: true, force: true })
mkdirSync(out, { recursive: true })

await build({
  entryPoints: [resolve(here, 'handler.ts')],
  bundle: true,
  platform: 'node',
  target: 'node22',
  format: 'cjs',
  outfile: resolve(out, 'index.js'),
  alias: { '@': resolve(root, 'src') },
  external: [],
  logLevel: 'info',
})

cpSync(resolve(here, 'image', 'fonts'), resolve(out, 'fonts'), { recursive: true })
cpSync(resolve(root, 'src', 'style.css'), resolve(out, 'style.css'))
cpSync(require.resolve('@resvg/resvg-wasm/index_bg.wasm'), resolve(out, 'resvg.wasm'))
