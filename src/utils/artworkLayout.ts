export type PosterLayout = {
  routePadding: number
  headerY: number
  headerRuleY: number
  statisticsY: number
  statisticsRowHeight: number
  statisticsRuleY: number
}

type PosterLayoutOptions = {
  width: number
  height: number
  routePadding: number
  hasTitle: boolean
  statisticCount: number
  statisticColumns: 1 | 2
}

export const getPosterLayout = ({ width, height, routePadding, hasTitle, statisticCount, statisticColumns }: PosterLayoutOptions): PosterLayout => {
  const headerY = Math.round(height * (hasTitle ? 0.105 : 0.08))
  const headerRuleY = Math.round(height * (hasTitle ? 0.145 : 0.11))
  const statisticsRowHeight = Math.max(Math.round(height * 0.038), 88)
  const statisticsRows = Math.ceil(statisticCount / statisticColumns)
  const statisticsBlockHeight = statisticCount ? 70 + statisticsRows * statisticsRowHeight : 0
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
  }
}
