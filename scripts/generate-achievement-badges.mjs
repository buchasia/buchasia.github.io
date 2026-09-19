import fs from 'node:fs'

const LEVEL_COLORS = ['#4db7e8', '#72c98a', '#e8a865', '#b890e8', '#e8799b']
const TARGETS = [
  { period: 'year', metric: 'distance', step: 1_000_000 },
  { period: 'year', metric: 'duration', step: 360_000 },
  { period: 'year', metric: 'ascent', step: 10_000 },
  { period: 'month', metric: 'distance', step: 100_000 },
  { period: 'month', metric: 'duration', step: 36_000 },
  { period: 'month', metric: 'ascent', step: 2_000 },
]
const CUSTOM_BADGE_ASSET_IDS = new Set([
  'month-distance-100000',
  'month-distance-200000',
  'month-distance-300000',
  'month-ascent-2000',
  'month-ascent-4000',
  'month-duration-36000',
  'month-duration-72000',
  'month-duration-108000',
  'year-distance-1000000',
  'year-distance-2000000',
  'year-distance-3000000',
  'year-ascent-10000',
  'year-ascent-20000',
  'year-ascent-30000',
  'year-duration-360000',
  'year-duration-720000',
  'year-duration-1080000',
])

const getValue = (run, metric) => metric === 'distance'
  ? Number(run.distance) || 0
  : metric === 'duration'
    ? Number(run.duration) || 0
    : Number(run.totalAscent) || 0

const getPeriodKey = (date, period) => {
  const year = date.getUTCFullYear().toString()
  return period === 'year' ? year : `${year}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`
}

const getBadgeValue = (metric, target) => {
  if (metric === 'distance') return `${target / 1000} KM`
  if (metric === 'duration') return `${target / 3600} H`
  return `${target} M`
}

const getShortBadgeValue = (metric, target) => {
  if (metric === 'distance') return `${target / 1000}K`
  if (metric === 'duration') return `${target / 3600}H`
  return `${target}M`
}

const getBadgeAssetId = milestone => `${milestone.period}-${milestone.metric}-${milestone.target}`

const metricMark = {
  distance: '↗',
  duration: '◷',
  ascent: '▲',
}

const getRuns = input => (Array.isArray(input) ? input : []).map(run => ({
  ...run,
  date: new Date(run.date),
}))

const getEarnedMilestones = runs => {
  const totals = new Map()
  const milestones = []
  const sortedRuns = [...runs].sort((a, b) => a.date - b.date)

  for (const run of sortedRuns) {
    for (const target of TARGETS) {
      const periodKey = getPeriodKey(run.date, target.period)
      const key = `${target.period}:${periodKey}:${target.metric}`
      const before = totals.get(key) ?? 0
      const after = before + getValue(run, target.metric)
      const firstTarget = (Math.floor(before / target.step) + 1) * target.step
      const lastTarget = Math.floor(after / target.step) * target.step

      for (let value = firstTarget; value <= lastTarget; value += target.step) {
        milestones.push({
          id: `${target.period}-${periodKey}-${target.metric}-${value}`,
          period: target.period,
          periodKey,
          metric: target.metric,
          target: value,
          level: value / target.step,
          achievedOn: run.date,
          locked: false,
        })
      }

      totals.set(key, after)
    }
  }

  return milestones
}

const getLatestYear = runs => {
  const latest = runs.reduce((current, run) => !current || run.date > current ? run.date : current, null)
  return latest ? latest.getUTCFullYear().toString() : new Date().getUTCFullYear().toString()
}

const getLockedMilestones = runs => {
  const year = getLatestYear(runs)
  const yearlyTotals = Object.fromEntries(['distance', 'duration', 'ascent'].map(metric => [metric, 0]))

  for (const run of runs) {
    if (run.date.getUTCFullYear().toString() !== year) continue
    for (const metric of Object.keys(yearlyTotals)) yearlyTotals[metric] += getValue(run, metric)
  }

  return TARGETS
    .filter(target => target.period === 'year')
    .map(target => {
      const level = Math.floor(yearlyTotals[target.metric] / target.step) + 1
      const value = level * target.step
      return {
        id: `locked-year-${year}-${target.metric}-${value}`,
        period: 'year',
        periodKey: year,
        metric: target.metric,
        target: value,
        level,
        locked: true,
      }
    })
}

const badgeSvg = milestone => {
  const color = LEVEL_COLORS[Math.min(Math.max(milestone.level, 1), LEVEL_COLORS.length) - 1]
  const value = getBadgeValue(milestone.metric, milestone.target)
  const shortValue = getShortBadgeValue(milestone.metric, milestone.target)

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" role="img" aria-label="${value} L${milestone.level}">
  <title id="title">${value} L${milestone.level}</title>
  <path d="M100 10c12 0 18 12 30 12s18-12 29-4c11 7 6 20 17 26 11 6 23 0 27 12 4 12-8 18-5 30 3 12 16 16 11 28-5 12-19 8-25 19-6 11 1 23-10 30-11 7-21-4-31 2-10 6-8 20-21 22-13 2-17-13-29-13s-16 15-29 11c-13-4-8-18-19-24-11-6-23 3-30-8-7-11 5-21 0-32-5-11-20-11-19-24 1-13 16-13 20-24 4-11-7-22 3-31 10-9 21 1 31-5 10-6 8-21 21-24 13-3 17 11 29 11z" fill="#092b2b" stroke="#f4f7f2" stroke-width="3" stroke-linejoin="round" />
  <path d="M100 20c12 0 18 12 30 12s18-12 29-4c11 7 6 20 17 26 11 6 23 0 27 12" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round" />
  <path d="M27 24c-15 14-20 29-10 41 8 10 23 3 29 12 7 10 0 22 10 30" fill="none" stroke="#ff5a0a" stroke-width="4" stroke-linecap="round" />
  <path d="M27 24c-15 14-20 29-10 41 8 10 23 3 29 12 7 10 0 22 10 30" fill="none" stroke="#f4f7f2" stroke-width="7" stroke-linecap="round" stroke-opacity=".95" />
  <path d="M27 24c-15 14-20 29-10 41 8 10 23 3 29 12 7 10 0 22 10 30" fill="none" stroke="#ff5a0a" stroke-width="3" stroke-linecap="round" />
  <circle cx="36" cy="36" r="28" fill="${color}" stroke="#f4f7f2" stroke-width="3" />
  <text x="36" y="45" fill="#fff" font-family="Arial,sans-serif" font-size="28" font-weight="700" text-anchor="middle">${metricMark[milestone.metric]}</text>
  <circle cx="100" cy="98" r="43" fill="#071f20" stroke="${color}" stroke-width="2.5" />
  <text x="100" y="120" fill="#fff" font-family="Arial,sans-serif" font-size="36" font-weight="700" text-anchor="middle">${metricMark[milestone.metric]}</text>
  <text x="100" y="148" fill="#f4f7f2" font-family="Arial,sans-serif" font-size="10" font-weight="700" letter-spacing="1px" text-anchor="middle">L${milestone.level}</text>
  <ellipse cx="145" cy="171" rx="51" ry="25" fill="#050707" stroke="#f4f7f2" stroke-width="3" />
  <text x="145" y="180" fill="#fff" font-family="Arial,sans-serif" font-size="21" font-weight="800" text-anchor="middle">${shortValue}</text>
</svg>
`
}

export function getAchievementBadgeRecords(input) {
  const runs = getRuns(input)
  return [...getEarnedMilestones(runs), ...getLockedMilestones(runs)]
}

export function generateAchievementBadgeAssets(input, outputDirectory = 'public/images/achievements/milestones') {
  const records = getAchievementBadgeRecords(input)
  fs.mkdirSync(outputDirectory, { recursive: true })
  const assets = new Map(records.map(record => [getBadgeAssetId(record), record]))

  for (const [assetId, record] of assets) {
    if (CUSTOM_BADGE_ASSET_IDS.has(assetId)) continue
    fs.writeFileSync(`${outputDirectory}/${assetId}.svg`, badgeSvg(record))
  }

  return { records, assets }
}

if (process.argv[1]?.endsWith('generate-achievement-badges.mjs')) {
  const inputPath = process.argv[2] ?? 'content/data/runs.json'
  const outputDirectory = process.argv[3] ?? 'public/images/achievements/milestones'
  const runs = JSON.parse(fs.readFileSync(inputPath, 'utf8'))
  const { records, assets } = generateAchievementBadgeAssets(runs, outputDirectory)
  const earned = records.filter(record => !record.locked).length
  const locked = records.filter(record => record.locked).length
  console.log(`Generated ${assets.size} reusable badge images from ${earned} earned and ${locked} locked milestones in ${outputDirectory}`)
}
