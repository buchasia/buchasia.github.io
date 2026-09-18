import fs from 'node:fs'

const input = process.argv[2] ?? '../../Downloads/Activities.csv'
const output = process.argv[3] ?? 'content/data/runs.json'

function parseCsvLine(line) {
  const cells = []
  let cell = ''
  let quoted = false
  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    if (char === '"' && line[i + 1] === '"') { cell += '"'; i++; continue }
    if (char === '"') { quoted = !quoted; continue }
    if (char === ',' && !quoted) { cells.push(cell); cell = ''; continue }
    cell += char
  }
  cells.push(cell)
  return cells
}

function number(value) {
  if (!value || value === '--' || value.includes('NaN')) return undefined
  const parsed = Number(value.replaceAll(',', '').replace(/^'/, ''))
  return Number.isFinite(parsed) ? parsed : undefined
}

function duration(value) {
  if (!value || value === '--' || value.includes('NaN')) return undefined
  const parts = value.split(':').map(Number)
  if (parts.length !== 3 || parts.some(part => !Number.isFinite(part))) return undefined
  return parts[0] * 3600 + parts[1] * 60 + parts[2]
}

function pace(value) {
  if (!value || value === '--' || value.includes('NaN')) return undefined
  const parts = value.split(':').map(Number)
  if (parts.length !== 2 || parts.some(part => !Number.isFinite(part))) return undefined
  return parts[0] * 60 + parts[1]
}

function slug(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

const rows = fs.readFileSync(input, 'utf8').trim().split(/\r?\n/).map(parseCsvLine)
const headers = rows.shift()
const index = Object.fromEntries(headers.map((header, i) => [header, i]))
const get = (row, header) => row[index[header]] ?? ''
const ids = new Map()

const runs = rows
  .filter(row => get(row, 'Activity Type').toLowerCase().includes('running'))
  .map(row => {
    const type = get(row, 'Activity Type')
    const date = get(row, 'Date')
    const title = get(row, 'Title')
    const baseId = `garmin-${date.slice(0, 10)}`
    const occurrence = (ids.get(baseId) ?? 0) + 1
    ids.set(baseId, occurrence)
    const totalAscent = number(get(row, 'Total Ascent')) ?? 0
    const run = {
      id: occurrence === 1 ? baseId : `${baseId}-${occurrence}`,
      date: date.slice(0, 10),
      activityType: type,
      distance: Math.round(number(get(row, 'Distance')) * 1000),
      duration: duration(get(row, 'Time')) ?? 0,
      totalAscent,
    }
    return run
  })

fs.writeFileSync(output, `[\n${runs.map(run => `  ${JSON.stringify(run)}`).join(',\n')}\n]\n`)
console.log(`Imported ${runs.length} running activities into ${output}`)
