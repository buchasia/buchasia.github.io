import { describe, expect, it } from 'vitest'
import { getPosterLayout } from './artworkLayout'

describe('poster layout', () => {
  it('keeps the route clear of the header and statistics block', () => {
    const layout = getPosterLayout({ width: 2480, height: 3508, routePadding: 180, hasTitle: true, statisticCount: 8, statisticColumns: 2 })

    expect(layout.routePadding).toBeGreaterThan(600)
    expect(layout.headerRuleY).toBeLessThan(layout.routePadding)
    expect(layout.routePadding).toBeLessThan(layout.statisticsRuleY)
    expect(layout.statisticsY).toBeLessThan(3508)
  })

  it('adapts the footer when fewer statistics are visible', () => {
    const full = getPosterLayout({ width: 2480, height: 3508, routePadding: 180, hasTitle: true, statisticCount: 8, statisticColumns: 2 })
    const compact = getPosterLayout({ width: 2480, height: 3508, routePadding: 180, hasTitle: true, statisticCount: 2, statisticColumns: 2 })

    expect(compact.statisticsRuleY).toBeGreaterThan(full.statisticsRuleY)
    expect(compact.statisticsRowHeight).toBe(full.statisticsRowHeight)
  })
})
