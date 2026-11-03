export type Book = {
  title: string
  author: string
  isbn?: string
  yearRead: number
  genre: string
  format: string
  language: string
  coverUrl?: string
  dateStarted?: string
  dateEnded?: string
  totalPages: number
  currentPage: number
  readingMinutes?: number
  rating?: number
  noteEn: string
  noteDe: string
}

export type BookStatus = 'finished' | 'reading' | 'notStarted'

export const getBookIsbn = (book: Book): string => {
  const isbn = (book.isbn ?? '').replace(/[-\s]/g, '').toUpperCase()
  if (!/^(?:\d{13}|\d{9}[\dX])$/.test(isbn)) {
    throw new Error(`Book "${book.title}" needs a valid ISBN-10 or ISBN-13 for its detail page.`)
  }
  return isbn
}

export const getBookEntries = (books: Book[]) => {
  const seen = new Set<string>()
  return books.map((book) => {
    const isbn = getBookIsbn(book)
    if (seen.has(isbn)) throw new Error(`Duplicate book ISBN ${isbn}: "${book.title}".`)
    seen.add(isbn)
    return { isbn, book }
  })
}

export type BookYearSummary = {
  year: number
  books: Book[]
  finishedCount: number
  readingMinutes: number
}

export const getBookProgress = (book: Book) =>
  book.totalPages > 0
    ? Math.min(100, Math.max(0, Math.round((book.currentPage / book.totalPages) * 100)))
    : 0

export const getBookStatus = (book: Book): BookStatus => {
  if (book.dateEnded || getBookProgress(book) >= 100) return 'finished'
  if (book.currentPage > 0 || book.dateStarted) return 'reading'
  return 'notStarted'
}

export const getBookRating = (book: Book): number | undefined => {
  if (getBookStatus(book) !== 'finished' || typeof book.rating !== 'number') return undefined
  if (!Number.isFinite(book.rating) || book.rating <= 0 || book.rating > 5) return undefined
  return Number.isInteger(book.rating * 4) ? book.rating : undefined
}

export const sortBooks = (books: Book[]) => [...books].sort((a, b) => {
  const statusOrder = { reading: 0, notStarted: 1, finished: 2 } as const
  const statusDifference = statusOrder[getBookStatus(a)] - statusOrder[getBookStatus(b)]
  if (statusDifference !== 0) return statusDifference
  return (b.dateStarted || `${b.yearRead}-01-01`).localeCompare(a.dateStarted || `${a.yearRead}-01-01`)
})

export const getBookYearSummaries = (books: Book[]): BookYearSummary[] => {
  const sortedBooks = sortBooks(books)
  const years = [...new Set(sortedBooks.map((book) => book.yearRead))].sort((a, b) => a - b)

  return years.map((year) => {
    const yearBooks = sortedBooks.filter((book) => book.yearRead === year)
    return {
      year,
      books: yearBooks,
      finishedCount: yearBooks.filter((book) => getBookStatus(book) === 'finished').length,
      readingMinutes: yearBooks.reduce((total, book) => total + (book.readingMinutes ?? 0), 0),
    }
  })
}

export const getBookShelfGroups = (books: Book[]) => {
  const reading: Book[] = []
  const remaining: Book[] = []
  sortBooks(books).forEach((book) => {
    if (getBookStatus(book) === 'reading') reading.push(book)
    else remaining.push(book)
  })
  return { reading, remaining }
}
