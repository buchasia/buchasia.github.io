import fs from 'node:fs/promises'
import path from 'node:path'

const inputPath = process.argv[2]
const outputPath = process.argv[3] ?? 'content/data/library.json'

if (!inputPath) {
  throw new Error('Usage: node scripts/import-library.mjs <json-or-csv-path> [output-path]')
}

const normalizeIsbn = (value = '') => String(value).replace(/[-\s]/g, '').toUpperCase()
const isValidIsbn = (value) => /^(?:\d{13}|\d{9}[\dX])$/.test(value)

const parseCsv = (text) => {
  const rows = []
  let row = []
  let field = ''
  let quoted = false
  for (let index = 0; index < text.length; index++) {
    const char = text[index]
    if (char === '"') {
      if (quoted && text[index + 1] === '"') {
        field += '"'
        index++
      } else {
        quoted = !quoted
      }
    } else if (char === ',' && !quoted) {
      row.push(field)
      field = ''
    } else if ((char === '\n' || char === '\r') && !quoted) {
      if (char === '\r' && text[index + 1] === '\n') index++
      row.push(field)
      field = ''
      if (row.some((value) => value !== '')) rows.push(row)
      row = []
    } else {
      field += char
    }
  }
  if (field || row.length) {
    row.push(field)
    if (row.some((value) => value !== '')) rows.push(row)
  }
  if (!rows.length) return []
  const headers = rows.shift().map((header) => header.trim())
  return rows.map((values) => Object.fromEntries(headers.map((header, index) => [header, values[index]?.trim() ?? ''])))
}

const source = await fs.readFile(path.resolve(inputPath), 'utf8')
const records = inputPath.toLowerCase().endsWith('.csv') ? parseCsv(source) : JSON.parse(source)
if (!Array.isArray(records)) throw new Error('Library input must contain an array of records.')

const imported = new Map()
for (const record of records) {
  const isbn = normalizeIsbn(record.isbn)
  if (!isValidIsbn(isbn)) throw new Error(`Invalid ISBN for "${record.title ?? 'untitled book'}": "${record.isbn ?? ''}"`)
  if (imported.has(isbn)) throw new Error(`Duplicate ISBN ${isbn}: "${record.title ?? 'untitled book'}"`)
  if (typeof record.title !== 'string' || record.title.trim() === '') throw new Error(`Missing title for ISBN ${isbn}`)
  if (typeof record.author !== 'string' || record.author.trim() === '') throw new Error(`Missing author for ISBN ${isbn}`)
  imported.set(isbn, {
    title: record.title,
    author: record.author,
    isbn,
    ...(record.genre ? { genre: record.genre } : {}),
    ...(record.format ? { format: record.format } : {}),
    ...(record.language ? { language: record.language } : {}),
    ...(record.edition ? { edition: record.edition } : {}),
    ...(record.coverUrl ? { coverUrl: record.coverUrl } : {}),
    ...(record.numberOfPages ? { numberOfPages: Number(record.numberOfPages) } : {}),
  })
}

const resolvedOutput = path.resolve(outputPath)
let existing = []
try {
  existing = JSON.parse(await fs.readFile(resolvedOutput, 'utf8'))
} catch (error) {
  if (error.code !== 'ENOENT') throw error
}

const merged = new Map(existing.map((book) => [normalizeIsbn(book.isbn), book]))
for (const [isbn, book] of imported) merged.set(isbn, book)
const output = [...merged.values()].sort((a, b) => a.title.localeCompare(b.title))
await fs.mkdir(path.dirname(resolvedOutput), { recursive: true })
await fs.writeFile(resolvedOutput, `${JSON.stringify(output, null, 2)}\n`)
console.log(`Imported ${imported.size} records into ${outputPath}; library now has ${output.length} books.`)
