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
  noteEn: string
  noteDe: string
}

export type BookStatus = 'finished' | 'reading' | 'notStarted'

export type BookYearSummary = {
  year: number
  books: Book[]
  finishedCount: number
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
    }
  })
}
