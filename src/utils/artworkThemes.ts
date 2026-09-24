export type ArtworkThemeId = 'paper' | 'night' | 'botanical'

export type ArtworkTheme = {
  id: ArtworkThemeId
  label: string
  background: string
  routeColor: string
  textColor: string
  statisticColor: string
  titleFontFamily: 'Source Serif 4'
  bodyFontFamily: 'DM Sans'
  titleFontWeight: 600
  backgroundStyle: 'solid'
}

export const ARTWORK_THEMES: Record<ArtworkThemeId, ArtworkTheme> = {
  paper: {
    id: 'paper', label: 'Paper', background: '#FFFFFF', routeColor: '#B91C1C', textColor: '#171717', statisticColor: '#171717',
    titleFontFamily: 'Source Serif 4', bodyFontFamily: 'DM Sans', titleFontWeight: 600, backgroundStyle: 'solid',
  },
  night: {
    id: 'night', label: 'Night', background: '#151719', routeColor: '#5EEAD4', textColor: '#F7F7F7', statisticColor: '#F7F7F7',
    titleFontFamily: 'Source Serif 4', bodyFontFamily: 'DM Sans', titleFontWeight: 600, backgroundStyle: 'solid',
  },
  botanical: {
    id: 'botanical', label: 'Botanical', background: '#F5FAF6', routeColor: '#276749', textColor: '#163B2B', statisticColor: '#163B2B',
    titleFontFamily: 'Source Serif 4', bodyFontFamily: 'DM Sans', titleFontWeight: 600, backgroundStyle: 'solid',
  },
}

export const DEFAULT_ARTWORK_THEME: ArtworkThemeId = 'paper'

export const getArtworkTheme = (id: ArtworkThemeId | string | undefined): ArtworkTheme => ARTWORK_THEMES[id as ArtworkThemeId] ?? ARTWORK_THEMES[DEFAULT_ARTWORK_THEME]

const hexChannel = (hex: string, offset: number) => Number.parseInt(hex.slice(offset, offset + 2), 16) / 255
const relativeLuminance = (hex: string) => {
  const channels = [hexChannel(hex, 1), hexChannel(hex, 3), hexChannel(hex, 5)].map(channel => channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4)
  return 0.2126 * channels[0]! + 0.7152 * channels[1]! + 0.0722 * channels[2]!
}

export const contrastRatio = (foreground: string, background: string) => {
  const light = Math.max(relativeLuminance(foreground), relativeLuminance(background))
  const dark = Math.min(relativeLuminance(foreground), relativeLuminance(background))
  return (light + 0.05) / (dark + 0.05)
}

export const hasReadableThemeContrast = (theme: ArtworkTheme) => contrastRatio(theme.textColor, theme.background) >= 4.5 && contrastRatio(theme.routeColor, theme.background) >= 3
