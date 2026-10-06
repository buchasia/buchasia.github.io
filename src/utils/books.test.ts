import { describe, expect, it } from 'vitest'
import { getBookProgress, getBookStatus } from './books'

const book = (overrides: Partial<Parameters<typeof getBookProgress>[0]> = {}) => ({
  title: 'Example', author: 'Author', yearRead: 2026, genre: 'fiction', format: 'novel', language: 'English',
  totalPages: 200, currentPage: 0, noteEn: '', noteDe: '', ...overrides,
})

describe('book progress', () => {
  it('calculates and caps progress', () => {
    expect(getBookProgress(book({ currentPage: 50 }))).toBe(25)
    expect(getBookProgress(book({ currentPage: 300 }))).toBe(100)
  })

  it('classifies finished, reading, and not-started books', () => {
    expect(getBookStatus(book({ dateEnded: '2026-02-01', currentPage: 180 }))).toBe('finished')
    expect(getBookStatus(book({ dateStarted: '2026-02-01', currentPage: 20 }))).toBe('reading')
    expect(getBookStatus(book())).toBe('notStarted')
  })
})
