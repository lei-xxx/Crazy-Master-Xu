import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

const root = process.cwd()
const distDir = path.join(root, 'dist')
const indexPath = path.join(distDir, 'index.html')
const projectsPath = path.join(root, 'src/data/projects.ts')

const indexHtml = await readFile(indexPath, 'utf8')
const projectsSource = await readFile(projectsPath, 'utf8')
const projectSlugs = [...projectsSource.matchAll(/slug:\s*'([^']+)'/g)].map((match) => match[1])

const routes = [
  '404.html',
  'privacy/index.html',
  'terms/index.html',
  'pricing/index.html',
  'process/index.html',
  ...projectSlugs.map((slug) => `portfolio/${slug}/index.html`),
]

await Promise.all(
  routes.map(async (route) => {
    const outputPath = path.join(distDir, route)
    await mkdir(path.dirname(outputPath), { recursive: true })
    await writeFile(outputPath, indexHtml)
  }),
)
