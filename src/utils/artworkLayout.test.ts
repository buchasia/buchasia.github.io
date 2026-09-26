import { describe, expect, it } from 'vitest'
import { getPosterLayout } from './artworkLayout'
import { ARTWORK_TEMPLATES } from './artworkTemplates'

describe('poster layout', () => {
  it('uses each template layout without composition-specific branches', () => {
    Object.values(ARTWORK_TEMPLATES).forEach(template => {
      const layout = getPosterLayout({ height: 3508, hasTitle: true, statisticCount: 8, layout: template.definition.layout })
      expect(layout.headerRuleY).toBeLessThan(layout.routePadding)
      expect(layout.routePadding).toBeLessThan(layout.statisticsRuleY)
      expect(layout.statisticsY).toBeLessThan(3508)
    })
  })

  it('adapts the statistics block to the selected count', () => {
    const templateLayout = ARTWORK_TEMPLATES.classic.definition.layout
    const full = getPosterLayout({ height: 3508, hasTitle: true, statisticCount: 8, layout: templateLayout })
    const compact = getPosterLayout({ height: 3508, hasTitle: true, statisticCount: 2, layout: templateLayout })
    expect(compact.statisticsRuleY).toBeGreaterThan(full.statisticsRuleY)
    expect(compact.statisticsRowHeight).toBe(full.statisticsRowHeight)
  })
})
