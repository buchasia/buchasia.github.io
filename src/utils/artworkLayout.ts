import type { ArtworkTemplateComposition } from './artworkTemplates'

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
  width: number
  height: number
  routePadding: number
  hasTitle: boolean
  statisticCount: number
  statisticColumns: 1 | 2
  composition: ArtworkTemplateComposition
}

export const getPosterLayout = ({ height, routePadding, hasTitle, statisticCount, statisticColumns, composition }: PosterLayoutOptions): PosterLayout => {
  const headerY = Math.round(height * (hasTitle ? (composition === 'minimal' ? 0.11 : 0.105) : 0.08))
  const headerRuleY = Math.round(height * (hasTitle ? (composition === 'minimal' ? 0.135 : 0.15) : 0.11))
  const statisticsRowHeight = Math.max(Math.round(height * (composition === 'minimal' ? 0.032 : 0.045)), composition === 'minimal' ? 76 : 104)
  const statisticsRows = Math.ceil(statisticCount / statisticColumns)
  const primaryStatisticHeight = composition === 'stats' && statisticCount ? Math.round(height * 0.115) : 0
  const statisticsBlockHeight = statisticCount ? 70 + primaryStatisticHeight + statisticsRows * statisticsRowHeight : 0
  const statisticsRuleY = Math.round(height - statisticsBlockHeight - height * 0.07)
  const bottomPadding = height - statisticsRuleY
  const topPadding = headerRuleY + height * 0.025

  return {
    routePadding: Math.max(routePadding, Math.round(topPadding), Math.round(bottomPadding)),
    headerY,
    headerRuleY,
    statisticsY: statisticsRuleY + 58,
    statisticsRowHeight,
    statisticsRuleY,
    primaryStatisticY: statisticsRuleY + 70,
  }
}
