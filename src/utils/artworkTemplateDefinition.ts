export const TEMPLATE_SCHEMA = 'run-template-definition/v1' as const
export const TEMPLATE_VERSION = 1 as const

export type LocalizedText = string | { en: string; de: string }
export type ArtworkShadowTarget = 'route' | 'title' | 'statistics' | 'scale' | 'footer'

export type ArtworkGradientStop = { color: string; position: number }
export type ArtworkBackground = string | { kind: 'linear-gradient'; angle: number; stops: ArtworkGradientStop[] }
export type ArtworkAppearance = {
  background: ArtworkBackground
  routeColor: string
  textColor: string
  statisticColor: string
  footerColor: string
  titleFontFamily: 'Source Serif 4'
  bodyFontFamily: 'DM Sans'
  titleFontWeight: 600 | 700
  bodyFontWeight: 400 | 500 | 600 | 700
  statisticLabelWeight: 400 | 500 | 600 | 700
  statisticValueWeight: 400 | 500 | 600 | 700
  scaleWeight: 400 | 500 | 600 | 700
}

export type ArtworkShadow = {
  enabled: boolean
  color: string
  blur: number
  offsetX: number
  offsetY: number
  opacity: number
}

export type TemplateEditorControl =
  | { id: string; type: 'text'; path: string; label: LocalizedText; maxLength: number }
  | { id: string; type: 'metric'; path: string; label: LocalizedText }
  | { id: string; type: 'metric-slots'; path: string; label: LocalizedText; minItems: number; maxItems: number; allowCustomLabels: boolean }
  | { id: string; type: 'color'; path: string; label: LocalizedText }
  | { id: string; type: 'linear-gradient'; path: string; label: LocalizedText; minStops: number; maxStops: number; allowAngle: boolean }

export type TemplateLayout = {
  routePadding: number
  route: { strokeWidthRatio: number; minStrokeWidth: number; linecap: 'round' | 'butt' | 'square'; linejoin: 'round' | 'bevel' | 'miter' }
  header: {
    title: { xRatio: number; yRatio: number; sizeRatio: number; weight: 400 | 500 | 600 | 700; anchor: 'start' | 'middle' }
    rule: { x1Ratio: number; x2Ratio: number; yWithTitleRatio: number; yWithoutTitleRatio: number; strokeWidthRatio: number; opacity: number }
    routeTopPaddingRatio: number
  }
  statistics: {
    columns: number
    rowHeightRatio: number
    minRowHeight: number
    blockTopPadding: number
    bottomPaddingRatio: number
    rule: { x1Ratio: number; x2Ratio: number; strokeWidthRatio: number; opacity: number }
    panel: { enabled: boolean; xRatio: number; widthRatio: number; yOffset: number; bottomOffset: number; opacity: number }
    primaryMetric: string | null
    primary: { labelSizeRatio: number; valueSizeRatio: number; valueYOffsetRatio: number; supportingOffsetRatio: number }
    supporting: { startOffset: number; columnXRatios: number[]; labelSizeRatio: number; valueSizeRatio: number }
  }
  scale: { enabled: boolean; xRatio: number; yOffset: number; widthRatio: number; strokeWidthRatio: number; minStrokeWidth: number; labelOffset: number; labelSizeRatio: number }
}

export type ArtworkTemplateDefinition = {
  $schema: typeof TEMPLATE_SCHEMA
  version: typeof TEMPLATE_VERSION
  id: string
  name: LocalizedText
  description: LocalizedText
  layout: TemplateLayout
  appearance: ArtworkAppearance
  settings: { shadows: Partial<Record<ArtworkShadowTarget, ArtworkShadow>> }
  editor: TemplateEditorControl[]
}

const colorPattern = /^#[0-9a-f]{6}$/i
const allowedPaths = new Set([
  'content.headerText', 'content.footerText', 'content.headerMetaMetric', 'content.metricSlots',
  'appearance.background', 'appearance.routeColor', 'appearance.textColor', 'appearance.statisticColor', 'appearance.footerColor',
])
const targets = new Set<ArtworkShadowTarget>(['route', 'title', 'statistics', 'scale', 'footer'])
const isRecord = (value: unknown): value is Record<string, unknown> => Boolean(value) && typeof value === 'object' && !Array.isArray(value)
const isLocalizedText = (value: unknown): value is LocalizedText => typeof value === 'string' || (isRecord(value) && typeof value.en === 'string' && typeof value.de === 'string')
const isFiniteNumber = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value)
const isColor = (value: unknown): value is string => typeof value === 'string' && colorPattern.test(value)
const isGradient = (value: unknown): value is ArtworkBackground => isRecord(value)
  && value.kind === 'linear-gradient'
  && isFiniteNumber(value.angle) && value.angle >= 0 && value.angle < 360
  && Array.isArray(value.stops) && value.stops.length >= 2 && value.stops.length <= 8
  && value.stops.every(stop => isRecord(stop) && isColor(stop.color) && isFiniteNumber(stop.position) && stop.position >= 0 && stop.position <= 100)

const validateShadow = (value: unknown): value is ArtworkShadow => isRecord(value)
  && typeof value.enabled === 'boolean'
  && isColor(value.color)
  && isFiniteNumber(value.blur) && value.blur >= 0 && value.blur <= 200
  && isFiniteNumber(value.offsetX) && value.offsetX >= -200 && value.offsetX <= 200
  && isFiniteNumber(value.offsetY) && value.offsetY >= -200 && value.offsetY <= 200
  && isFiniteNumber(value.opacity) && value.opacity >= 0 && value.opacity <= 1

const isRatio = (value: unknown) => isFiniteNumber(value) && value >= 0 && value <= 1
const isPositiveNumber = (value: unknown) => isFiniteNumber(value) && value > 0
const isLayout = (value: unknown): value is TemplateLayout => {
  if (!isRecord(value) || !isPositiveNumber(value.routePadding) || !isRecord(value.route) || !isRatio(value.route.strokeWidthRatio) || !isPositiveNumber(value.route.minStrokeWidth) || !['round', 'butt', 'square'].includes(String(value.route.linecap)) || !['round', 'bevel', 'miter'].includes(String(value.route.linejoin))) return false
  if (!isRecord(value.header) || !isRecord(value.header.title) || !isRatio(value.header.title.xRatio) || !isRatio(value.header.title.yRatio) || !isRatio(value.header.title.sizeRatio) || ![400, 500, 600, 700].includes(Number(value.header.title.weight)) || !['start', 'middle'].includes(String(value.header.title.anchor)) || !isRecord(value.header.rule) || !isRatio(value.header.rule.x1Ratio) || !isRatio(value.header.rule.x2Ratio) || !isRatio(value.header.rule.yWithTitleRatio) || !isRatio(value.header.rule.yWithoutTitleRatio) || !isRatio(value.header.rule.strokeWidthRatio) || !isRatio(value.header.rule.opacity) || !isRatio(value.header.routeTopPaddingRatio)) return false
  if (!isRecord(value.statistics) || !isPositiveNumber(value.statistics.columns) || !isRatio(value.statistics.rowHeightRatio) || !isPositiveNumber(value.statistics.minRowHeight) || !isFiniteNumber(value.statistics.blockTopPadding) || value.statistics.blockTopPadding < 0 || !isRatio(value.statistics.bottomPaddingRatio)) return false
  if (!isRecord(value.statistics.rule) || !isRatio(value.statistics.rule.x1Ratio) || !isRatio(value.statistics.rule.x2Ratio) || !isRatio(value.statistics.rule.strokeWidthRatio) || !isRatio(value.statistics.rule.opacity)) return false
  if (!isRecord(value.statistics.panel) || typeof value.statistics.panel.enabled !== 'boolean' || !isRatio(value.statistics.panel.xRatio) || !isRatio(value.statistics.panel.widthRatio) || !isFiniteNumber(value.statistics.panel.yOffset) || value.statistics.panel.yOffset < 0 || !isFiniteNumber(value.statistics.panel.bottomOffset) || value.statistics.panel.bottomOffset < 0 || !isRatio(value.statistics.panel.opacity)) return false
  if (!(value.statistics.primaryMetric === null || typeof value.statistics.primaryMetric === 'string') || !isRecord(value.statistics.primary) || !isRatio(value.statistics.primary.labelSizeRatio) || !isRatio(value.statistics.primary.valueSizeRatio) || !isRatio(value.statistics.primary.valueYOffsetRatio) || !isRatio(value.statistics.primary.supportingOffsetRatio)) return false
  if (!isRecord(value.statistics.supporting) || !isFiniteNumber(value.statistics.supporting.startOffset) || value.statistics.supporting.startOffset < 0 || !Array.isArray(value.statistics.supporting.columnXRatios) || value.statistics.supporting.columnXRatios.length < 1 || !value.statistics.supporting.columnXRatios.every(isRatio) || !isRatio(value.statistics.supporting.labelSizeRatio) || !isRatio(value.statistics.supporting.valueSizeRatio)) return false
  if (!isRecord(value.scale) || typeof value.scale.enabled !== 'boolean' || !isRatio(value.scale.xRatio) || !isFiniteNumber(value.scale.yOffset) || value.scale.yOffset < 0 || !isRatio(value.scale.widthRatio) || !isRatio(value.scale.strokeWidthRatio) || !isPositiveNumber(value.scale.minStrokeWidth) || !isFiniteNumber(value.scale.labelOffset) || value.scale.labelOffset < 0 || !isRatio(value.scale.labelSizeRatio)) return false
  return true
}

export const validateArtworkTemplateDefinition = (value: unknown): value is ArtworkTemplateDefinition => {
  if (!isRecord(value) || value.$schema !== TEMPLATE_SCHEMA || value.version !== TEMPLATE_VERSION) return false
  if (typeof value.id !== 'string' || !/^[a-z0-9-]+$/.test(value.id) || !isLocalizedText(value.name) || !isLocalizedText(value.description)) return false
  if (!isLayout(value.layout)) return false
  if (!isRecord(value.appearance) || !(isColor(value.appearance.background) || isGradient(value.appearance.background)) || !isColor(value.appearance.routeColor) || !isColor(value.appearance.textColor) || !isColor(value.appearance.statisticColor) || !isColor(value.appearance.footerColor) || value.appearance.titleFontFamily !== 'Source Serif 4' || value.appearance.bodyFontFamily !== 'DM Sans' || ![600, 700].includes(Number(value.appearance.titleFontWeight)) || ![400, 500, 600, 700].includes(Number(value.appearance.bodyFontWeight)) || ![400, 500, 600, 700].includes(Number(value.appearance.statisticLabelWeight)) || ![400, 500, 600, 700].includes(Number(value.appearance.statisticValueWeight)) || ![400, 500, 600, 700].includes(Number(value.appearance.scaleWeight))) return false
  if (!isRecord(value.settings) || !isRecord(value.settings.shadows) || !Array.isArray(value.editor)) return false
  for (const [target, shadow] of Object.entries(value.settings.shadows)) if (!targets.has(target as ArtworkShadowTarget) || !validateShadow(shadow)) return false
  const ids = new Set<string>()
  return value.editor.every((control) => {
    if (!isRecord(control) || typeof control.id !== 'string' || ids.has(control.id) || !isLocalizedText(control.label) || typeof control.path !== 'string' || !allowedPaths.has(control.path)) return false
    ids.add(control.id)
    if (control.type === 'text') return isFiniteNumber(control.maxLength) && control.maxLength >= 1 && control.maxLength <= 1000
    if (control.type === 'metric' || control.type === 'color') return true
    if (control.type === 'metric-slots') return isFiniteNumber(control.minItems) && isFiniteNumber(control.maxItems) && control.minItems >= 1 && control.maxItems >= control.minItems && control.maxItems <= 8 && typeof control.allowCustomLabels === 'boolean'
    if (control.type === 'linear-gradient') return isFiniteNumber(control.minStops) && isFiniteNumber(control.maxStops) && control.minStops >= 2 && control.maxStops >= control.minStops && control.maxStops <= 8 && typeof control.allowAngle === 'boolean'
    return false
  })
}

export const localizeTemplateText = (value: LocalizedText, locale: 'en' | 'de') => typeof value === 'string' ? value : value[locale]
