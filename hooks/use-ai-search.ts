'use client'
import { useState, useCallback } from 'react'
import { aiService } from '@/lib/ai-service'
import type { SearchResult } from '@/types'

export function useAiSearch() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const search = useCallback(async (q: string) => {
    setQuery(q)
    setLoading(true)
    setError(null)
    try {
      const data = await aiService.naturalLanguageSearch(q)
      setResults(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Tìm kiếm thất bại')
      setResults(null)
    } finally {
      setLoading(false)
    }
  }, [])

  return { query, results, loading, error, search }
}
