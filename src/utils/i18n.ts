export type Lang = 'en' | 'de'

export const DEFAULT_LANG: Lang = 'en'
export const LANGS: Lang[] = ['en', 'de']

// Builds a locale-aware href; English (default locale) stays un-prefixed.
export const localizedPath = (lang: Lang, path: string) => (lang === DEFAULT_LANG ? path : `/de${path}`)

const dictionaries = {
  en: {
    nav: { posts: 'Posts', about: 'About', tags: 'Tags', search: 'Search' },
    footer: (year: number) => `Copyright © ${year} | All rights reserved.`,
    langSwitch: { label: 'DE', ariaLabel: 'Auf Deutsch lesen' },
    translationNotice: '',
    home: {
      title: 'Cogito Ergo Sum',
      intro1: 'Hello and welcome to my blog.',
      intro2:
        'A father, wanderer, lifelong learner, runner, and software engineer writing about technology, data, mathematics, and the spaces between them.',
      currentInterests: 'Current interests',
      interests: 'Fabric · Power BI · Running · Numbers · AI · Mathematics',
      recentPosts: 'Recent posts',
    },
    about: {
      eyebrow: 'About',
      title: 'Cogito Ergo Sum',
      p1: 'I am Dr. Chhitiz Buchasia, a father, wanderer, lifelong learner, runner, and software engineer.',
      p2: 'This is where I write about Fabric, Power BI, running, numbers, AI, mathematics, and whatever else earns a place in my notebook.',
      p3Prefix: 'Find me on',
    },
    tagsPage: { eyebrow: 'Topics', title: 'Tags', intro: 'Browse the ideas I have been writing about.' },
    tagPage: { eyebrow: 'Topic' },
    postsPage: { eyebrow: 'Archive', title: 'All posts', titlePage: (page: number) => `Posts - Page ${page}` },
    search: {
      eyebrow: 'Find a post',
      title: 'Search',
      label: 'Search posts',
      placeholder: 'Try mathematics, data, or a title',
      showingAllTemplate: 'Showing all {n} posts.',
      matchingSingularTemplate: '{n} matching post.',
      matchingPluralTemplate: '{n} matching posts.',
    },
    article: { eyebrow: 'Essay' },
    pagination: { previous: 'Previous', next: 'Next', pageOf: (c: number, t: number) => `Page ${c} of ${t}` },
    dateLocale: 'en-US',
  },
  de: {
    nav: { posts: 'Beiträge', about: 'Über mich', tags: 'Schlagwörter', search: 'Suche' },
    footer: (year: number) => `Copyright © ${year} | Alle Rechte vorbehalten.`,
    langSwitch: { label: 'EN', ariaLabel: 'Read in English' },
    translationNotice:
      'Diese Seite wurde mit Hilfe von KI aus dem Englischen übersetzt und kann Fehler enthalten.',
    home: {
      title: 'Cogito Ergo Sum',
      intro1: 'Hallo und herzlich willkommen auf meinem Blog.',
      intro2:
        'Vater, Wanderer, lebenslanger Lernender, Läufer und Software-Ingenieur, der über Technologie, Daten, Mathematik und die Räume dazwischen schreibt.',
      currentInterests: 'Aktuelle Interessen',
      interests: 'Fabric · Power BI · Laufen · Zahlen · KI · Mathematik',
      recentPosts: 'Neueste Beiträge',
    },
    about: {
      eyebrow: 'Über mich',
      title: 'Cogito Ergo Sum',
      p1: 'Ich bin Dr. Chhitiz Buchasia, Vater, Wanderer, lebenslanger Lernender, Läufer und Software-Ingenieur.',
      p2: 'Hier schreibe ich über Fabric, Power BI, Laufen, Zahlen, KI, Mathematik und alles andere, das einen Platz in meinem Notizbuch verdient.',
      p3Prefix: 'Ihr findet mich auf',
    },
    tagsPage: { eyebrow: 'Themen', title: 'Schlagwörter', intro: 'Stöbert durch die Ideen, über die ich geschrieben habe.' },
    tagPage: { eyebrow: 'Thema' },
    postsPage: { eyebrow: 'Archiv', title: 'Alle Beiträge', titlePage: (page: number) => `Beiträge - Seite ${page}` },
    search: {
      eyebrow: 'Beitrag finden',
      title: 'Suche',
      label: 'Beiträge durchsuchen',
      placeholder: 'Versuche Mathematik, Daten oder einen Titel',
      showingAllTemplate: 'Zeige alle {n} Beiträge.',
      matchingSingularTemplate: '{n} passender Beitrag.',
      matchingPluralTemplate: '{n} passende Beiträge.',
    },
    article: { eyebrow: 'Essay' },
    pagination: { previous: 'Zurück', next: 'Weiter', pageOf: (c: number, t: number) => `Seite ${c} von ${t}` },
    dateLocale: 'de-DE',
  },
} as const

export const t = (lang: Lang) => dictionaries[lang]
