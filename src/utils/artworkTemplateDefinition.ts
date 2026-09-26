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

export type ArtworkTemplateDefinition = {
  $schema: typeof TEMPLATE_SCHEMA
  version: typeof TEMPLATE_VERSION
  id: string
  name: LocalizedText
  description: LocalizedText
  composition: 'classic' | 'minimal' | 'stats'
  layout: { routePadding: number; statisticsColumns: 1 | 2 }
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

export const validateArtworkTemplateDefinition = (value: unknown): value is ArtworkTemplateDefinition => {
  if (!isRecord(value) || value.$schema !== TEMPLATE_SCHEMA || value.version !== TEMPLATE_VERSION) return false
  if (typeof value.id !== 'string' || !/^[a-z0-9-]+$/.test(value.id) || !isLocalizedText(value.name) || !isLocalizedText(value.description)) return false
  if (!['classic', 'minimal', 'stats'].includes(String(value.composition))) return false
  if (!isRecord(value.layout) || !isFiniteNumber(value.layout.routePadding) || value.layout.routePadding < 0 || value.layout.routePadding > 2000 || ![1, 2].includes(Number(value.layout.statisticsColumns))) return false
  if (!isRecord(value.appearance) || !(isColor(value.appearance.background) || isGradient(value.appearance.background)) || !isColor(value.appearance.routeColor) || !isColor(value.appearance.textColor) || !isColor(value.appearance.statisticColor) || !isColor(value.appearance.footerColor) || value.appearance.titleFontFamily !== 'Source Serif 4' || value.appearance.bodyFontFamily !== 'DM Sans' || (value.appearance.titleFontWeight !== 600 && value.appearance.titleFontWeight !== 700)) return false
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
