import fs from 'node:fs/promises'
import path from 'node:path'

const contentRoot = path.resolve('content/blog')
const sourceLocale = 'en'
const targetLocale = 'de'
const dryRun = process.argv.includes('--check')

const postDirectories = await fs.readdir(path.join(contentRoot, targetLocale), { withFileTypes: true })
const changes = []

for (const entry of postDirectories) {
  if (!entry.isDirectory()) continue

  const targetDirectory = path.join(contentRoot, targetLocale, entry.name)
  const sourceDirectory = path.join(contentRoot, sourceLocale, entry.name)
  const markdownPath = path.join(targetDirectory, 'index.md')
  let markdown

  try {
    markdown = await fs.readFile(markdownPath, 'utf8')
  } catch {
    continue
  }

  const imageNames = new Set()
  const updatedMarkdown = markdown.replace(/!\[[^\]]*\]\(([^)]+)\)/g, (match, reference) => {
    if (reference.includes('/') || reference.includes('#') || reference.includes('?')) return match

    imageNames.add(reference)
    return match.replace(`(${reference})`, `(../../${sourceLocale}/${entry.name}/${reference})`)
  })

  for (const imageName of imageNames) {
    const sourceImage = path.join(sourceDirectory, imageName)
    const targetImage = path.join(targetDirectory, imageName)

    try {
      await fs.access(sourceImage)
    } catch {
      throw new Error(`Missing English image for ${targetLocale}/${entry.name}/${imageName}`)
    }

    try {
      await fs.access(targetImage)
    } catch {
      continue
    }

    changes.push(`${targetLocale}/${entry.name}/${imageName}`)
    if (!dryRun) await fs.rm(targetImage)
  }

  if (updatedMarkdown !== markdown) {
    changes.push(`${targetLocale}/${entry.name}/index.md`)
    if (!dryRun) await fs.writeFile(markdownPath, updatedMarkdown)
  }
}

console.log(`${dryRun ? 'Would update' : 'Updated'} ${changes.length} file(s):`)
for (const change of changes) console.log(`- ${change}`)