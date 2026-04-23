'use client'
import { useState, useEffect, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { Search, X } from 'lucide-react'
import { useAiSearch } from '@/hooks/use-ai-search'

export function AiSearchBar() {
  const router = useRouter()
  const { results, loading, error, search } = useAiSearch()
  const [inputValue, setInputValue] = useState('')
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    if (!submitted || loading || !results) return
    setSubmitted(false)
    const params = new URLSearchParams({ search: inputValue.trim() })
    const f = results.extracted_filters
    if (f.category) params.set('category', f.category)
    if (f.brand) params.set('brand', f.brand)
    if (f.min_price != null) params.set('min_price', String(f.min_price))
    if (f.max_price != null) params.set('max_price', String(f.max_price))
    router.push(`/products?${params.toString()}`)
  }, [submitted, loading, results, inputValue, router])

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const q = inputValue.trim()
    if (!q) return
    setSubmitted(true)
    search(q)
  }

  const chips = results?.extracted_filters
    ? [
        results.extracted_filters.category && `Danh mục: ${results.extracted_filters.category}`,
        results.extracted_filters.brand && `Thương hiệu: ${results.extracted_filters.brand}`,
        results.extracted_filters.min_price != null && `Từ ${results.extracted_filters.min_price.toLocaleString()}đ`,
        results.extracted_filters.max_price != null && `Đến ${results.extracted_filters.max_price.toLocaleString()}đ`,
      ].filter(Boolean) as string[]
    : []

  return (
    <div className="w-full space-y-2">
      <div className="flex items-center gap-1 text-xs text-muted-foreground">
        <span>✨</span>
        <span>AI Search</span>
      </div>

      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ví dụ: áo thun nam dưới 300k màu trắng..."
            className="w-full rounded-md border bg-background py-2 pl-9 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary"
            disabled={loading}
          />
          {inputValue && (
            <button type="button" onClick={() => setInputValue('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
        <button type="submit" disabled={loading || !inputValue.trim()} className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
          {loading ? 'Đang tìm...' : 'Tìm AI'}
        </button>
      </form>

      {results?.query_interpretation && (
        <p className="text-xs italic text-muted-foreground">{results.query_interpretation}</p>
      )}

      {chips.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {chips.map((chip) => (
            <span key={chip} className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">{chip}</span>
          ))}
        </div>
      )}

      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}
