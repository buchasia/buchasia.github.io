import type { TemplateLayout } from './artworkTemplateDefinition'

export type PosterLayout = {
  routePadding: number
  headerY: number
  headerRuleY: number
  statisticsY: number
  statisticsRowHeight: number
  statisticsRuleY: number
  primaryStatisticY: number
}

type PosterLayoutOptions = {
  height: number
  hasTitle: boolean
  statisticCount: number
  layout: TemplateLayout
}

export const getPosterLayout = ({ height, hasTitle, statisticCount, layout }: PosterLayoutOptions): PosterLayout => {
  const headerY = Math.round(height * (hasTitle ? layout.header.title.yRatio : layout.header.rule.yWithoutTitleRatio))
  const headerRuleY = Math.round(height * (hasTitle ? layout.header.rule.yWithTitleRatio : layout.header.rule.yWithoutTitleRatio))
  const statisticsRowHeight = Math.max(Math.round(height * layout.statistics.rowHeightRatio), layout.statistics.minRowHeight)
  const statisticsColumns = Math.max(1, Math.floor(layout.statistics.columns))
  const statisticsRows = statisticCount ? Math.ceil(statisticCount / statisticsColumns) : 0
  const primaryStatisticHeight = layout.statistics.primaryMetric && statisticCount ? Math.round(height * layout.statistics.primary.valueYOffsetRatio) : 0
  const statisticsBlockHeight = statisticCount ? layout.statistics.blockTopPadding + primaryStatisticHeight + statisticsRows * statisticsRowHeight : 0
  const statisticsRuleY = Math.round(height - statisticsBlockHeight - height * layout.statistics.bottomPaddingRatio)
  const bottomPadding = height - statisticsRuleY
  const topPadding = headerRuleY + height * layout.header.routeTopPaddingRatio

  return {
    routePadding: Math.max(layout.routePadding, Math.round(topPadding), Math.round(bottomPadding)),
    headerY,
    headerRuleY,
    statisticsY: statisticsRuleY + layout.statistics.supporting.startOffset,
    statisticsRowHeight,
    statisticsRuleY,
    primaryStatisticY: statisticsRuleY + layout.statistics.blockTopPadding,
  }
}
