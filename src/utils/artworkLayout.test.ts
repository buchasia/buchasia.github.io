import { describe, expect, it } from 'vitest'
import { getPosterLayout } from './artworkLayout'

describe('poster layout', () => {
  it('keeps the route clear of the header and statistics block', () => {
    const layout = getPosterLayout({ width: 2480, height: 3508, routePadding: 180, hasTitle: true, statisticCount: 8, statisticColumns: 2, composition: 'classic' })

    expect(layout.routePadding).toBeGreaterThan(600)
    expect(layout.headerRuleY).toBeLessThan(layout.routePadding)
    expect(layout.routePadding).toBeLessThan(layout.statisticsRuleY)
    expect(layout.statisticsY).toBeLessThan(3508)
  })

  it('adapts the footer when fewer statistics are visible', () => {
    const full = getPosterLayout({ width: 2480, height: 3508, routePadding: 180, hasTitle: true, statisticCount: 8, statisticColumns: 2, composition: 'classic' })
    const compact = getPosterLayout({ width: 2480, height: 3508, routePadding: 180, hasTitle: true, statisticCount: 2, statisticColumns: 2, composition: 'classic' })

    expect(compact.statisticsRuleY).toBeGreaterThan(full.statisticsRuleY)
    expect(compact.statisticsRowHeight).toBe(full.statisticsRowHeight)
  })

  it('reserves additional space for the metric-led composition', () => {
    const classic = getPosterLayout({ width: 2480, height: 3508, routePadding: 180, hasTitle: true, statisticCount: 4, statisticColumns: 2, composition: 'classic' })
    const stats = getPosterLayout({ width: 2480, height: 3508, routePadding: 180, hasTitle: true, statisticCount: 4, statisticColumns: 2, composition: 'stats' })

    expect(stats.routePadding).toBeGreaterThan(classic.routePadding)
    expect(stats.primaryStatisticY).toBeGreaterThan(stats.statisticsRuleY)
  })
})
