import type { SearchResult, Product } from '@/types'

// Frontend AI service - calls Next.js API Routes (API keys stay server-side)
export const aiService = {
  // Tìm kiếm bằng ngôn ngữ tự nhiên
  async naturalLanguageSearch(query: string): Promise<SearchResult> {
    const res = await fetch('/api/ai/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    })
    if (!res.ok) throw new Error(`AI search failed: ${res.statusText}`)
    return res.json()
  },

  // Gợi ý sản phẩm thông minh
  async getRecommendations(context: {
    productId?: number
    userId?: number
    viewHistory?: number[]
  }): Promise<Product[]> {
    const res = await fetch('/api/ai/recommendations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(context),
    })
    if (!res.ok) throw new Error(`AI recommendations failed: ${res.statusText}`)
    return res.json()
  },
}
