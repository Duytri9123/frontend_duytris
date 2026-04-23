'use client'

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)

  return (
    <div className="flex items-center justify-center gap-1">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="rounded-md border px-3 py-1.5 text-sm disabled:opacity-40 hover:bg-muted"
      >
        ‹ Trước
      </button>

      {pages.map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`rounded-md border px-3 py-1.5 text-sm ${
            page === currentPage
              ? 'bg-primary text-primary-foreground border-primary'
              : 'hover:bg-muted'
          }`}
        >
          {page}
        </button>
      ))}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="rounded-md border px-3 py-1.5 text-sm disabled:opacity-40 hover:bg-muted"
      >
        Sau ›
      </button>
    </div>
  )
}
