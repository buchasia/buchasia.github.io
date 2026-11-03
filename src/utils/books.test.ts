import { describe, expect, it } from 'vitest'
import books from '../../content/data/books.json'
import { getBookEntries, getBookIsbn, getBookProgress, getBookRating, getBookShelfGroups, getBookStatus, getBookYearSummaries } from './books'

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

describe('book ratings', () => {
  it('accepts quarter-star ratings only for finished books', () => {
    expect(getBookRating(book({ dateEnded: '2026-02-01', rating: 4.25 }))).toBe(4.25)
    expect(getBookRating(book({ dateEnded: '2026-02-01', rating: 4.2 }))).toBeUndefined()
    expect(getBookRating(book({ currentPage: 20, rating: 4.25 }))).toBeUndefined()
  })
})

describe('book ISBN routes', () => {
  it('normalizes separators while preserving leading zeros and ISBN-10 X', () => {
    expect(getBookIsbn(book({ isbn: '978-0-593-33483-6' }))).toBe('9780593334836')
    expect(getBookIsbn(book({ isbn: ' 0-8044-2957-x ' }))).toBe('080442957X')
    expect(getBookIsbn(book({ isbn: '978 1784706289' }))).toBe('9781784706289')
  })

  it.each([undefined, '', '123', '978/1784706289', '../9781784706289', 'XXXXXXXXXX'])('rejects unusable ISBN %s', (isbn) => {
    expect(() => getBookIsbn(book({ isbn }))).toThrow('needs a valid ISBN')
  })

  it('rejects duplicate normalized ISBNs', () => {
    expect(() => getBookEntries([
      book({ isbn: '978-0-593-33483-6' }),
      book({ isbn: '9780593334836', title: 'Duplicate' }),
    ])).toThrow('Duplicate book ISBN 9780593334836')
  })

  it('generates one unique route per recorded book without changing its data', () => {
    const entries = getBookEntries(books)
    expect(entries).toHaveLength(books.length)
    expect(new Set(entries.map((entry) => entry.isbn)).size).toBe(books.length)
    expect(entries[0].book).toBe(books[0])
  })
})

describe('book shelf groups', () => {
  it('separates remaining books into newest-first years without repeating reading books', () => {
    const reading = book({ title: 'Reading', dateStarted: '2026-10-31', currentPage: 22 })
    const older = book({ title: 'Older', yearRead: 2025, currentPage: 200 })
    const newer = book({ title: 'Newer', yearRead: 2026, currentPage: 200 })
    const alsoOlder = book({ title: 'Also older', yearRead: 2025, currentPage: 200 })
    const groups = getBookShelfGroups([older, reading, newer, alsoOlder])
    const years = getBookYearSummaries(groups.remaining).reverse()
    expect(groups.reading).toEqual([reading])
    expect(years.map((summary) => summary.year)).toEqual([2026, 2025])
    expect(years.map((summary) => summary.books)).toEqual([[newer], [older, alsoOlder]])
    expect(years.flatMap((summary) => summary.books)).not.toContain(reading)
    expect(getBookYearSummaries([])).toEqual([])
  })

  it('omits the reading group when all books are finished or not started', () => {
    const finished = book({ dateStarted: '2026-10-01', currentPage: 200 })
    const ended = book({ dateStarted: '2026-10-02', dateEnded: '2026-10-03', currentPage: 20 })
    const unread = book()
    expect(getBookShelfGroups([finished, ended, unread])).toEqual({ reading: [], remaining: [unread, ended, finished] })
    expect(getBookShelfGroups([])).toEqual({ reading: [], remaining: [] })
  })

  it('partitions multiple reading books without duplicates and preserves status/date ordering', () => {
    const readingBooks = Array.from({ length: 4 }, (_, index) => book({
      title: `Reading ${index}`, dateStarted: `2026-10-${10 + index}`, currentPage: 22,
    }))
    const finished = book({ title: 'Finished', dateEnded: '2026-10-01' })
    const unread = book({ title: 'Unread' })
    const input = [finished, ...readingBooks, unread]
    const groups = getBookShelfGroups(input)
    expect(groups.reading).toEqual([...readingBooks].reverse())
    expect(groups.remaining).toEqual([unread, finished])
    expect(new Set([...groups.reading, ...groups.remaining]).size).toBe(input.length)
    expect(input[0]).toBe(finished)
  })

  it('records Invisible Women as currently reading at page 22, started 31 October 2026', () => {
    const entry = getBookEntries(books).find((entry) => entry.isbn === '9781784706289')
    expect(entry?.book).toMatchObject({ title: 'Invisible Women', currentPage: 22, totalPages: 432, dateStarted: '2026-10-31' })
    expect(getBookShelfGroups(books).reading).toEqual([entry!.book])
    expect(getBookStatus(entry!.book)).toBe('reading')
    expect(getBookProgress(entry!.book)).toBe(5)
  })
})
