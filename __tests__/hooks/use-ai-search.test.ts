import { renderHook, act } from '@testing-library/react'
import { useAiSearch } from '@/hooks/use-ai-search'
import { aiService } from '@/lib/ai-service'
import type { SearchResult } from '@/types'

jest.mock('@/lib/ai-service', () => ({
  aiService: {
    naturalLanguageSearch: jest.fn(),
  },
}))

const mockResult: SearchResult = {
  products: [],
  extracted_filters: { category: 'áo', min_price: 100000 },
  query_interpretation: 'áo thun nam',
}

describe('useAiSearch', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('starts with empty state', () => {
    const { result } = renderHook(() => useAiSearch())
    expect(result.current.query).toBe('')
    expect(result.current.results).toBeNull()
    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('sets loading true while searching', async () => {
    let resolveSearch!: (v: SearchResult) => void
    ;(aiService.naturalLanguageSearch as jest.Mock).mockReturnValue(
      new Promise<SearchResult>((res) => { resolveSearch = res })
    )

    const { result } = renderHook(() => useAiSearch())

    act(() => {
      result.current.search('laptop')
    })

    expect(result.current.loading).toBe(true)

    await act(async () => {
      resolveSearch(mockResult)
    })

    expect(result.current.loading).toBe(false)
  })

  it('sets results on successful search', async () => {
    ;(aiService.naturalLanguageSearch as jest.Mock).mockResolvedValue(mockResult)

    const { result } = renderHook(() => useAiSearch())

    await act(async () => {
      await result.current.search('áo thun')
    })

    expect(result.current.results).toEqual(mockResult)
    expect(result.current.query).toBe('áo thun')
    expect(result.current.error).toBeNull()
  })

  it('sets error on failed search', async () => {
    ;(aiService.naturalLanguageSearch as jest.Mock).mockRejectedValue(new Error('Network error'))

    const { result } = renderHook(() => useAiSearch())

    await act(async () => {
      await result.current.search('query')
    })

    expect(result.current.error).toBe('Network error')
    expect(result.current.results).toBeNull()
    expect(result.current.loading).toBe(false)
  })

  it('sets generic error message for non-Error rejections', async () => {
    ;(aiService.naturalLanguageSearch as jest.Mock).mockRejectedValue('unknown')

    const { result } = renderHook(() => useAiSearch())

    await act(async () => {
      await result.current.search('query')
    })

    expect(result.current.error).toBe('Tìm kiếm thất bại')
  })
})
