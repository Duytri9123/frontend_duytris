import { NextRequest, NextResponse } from 'next/server'
import type { SearchResult } from '@/types'

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions'

export async function POST(req: NextRequest) {
  const { query } = await req.json()
  if (!query || typeof query !== 'string') {
    return NextResponse.json({ error: 'query is required' }, { status: 400 })
  }

  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    return NextResponse.json({ products: [], extracted_filters: {}, query_interpretation: query } as SearchResult)
  }

  try {
    const prompt = `Phân tích câu tìm kiếm sản phẩm sau và trích xuất các bộ lọc:
"${query}"

Trả về JSON với format:
{
  "extracted_filters": { "category": "tên danh mục nếu có", "brand": "tên thương hiệu nếu có", "min_price": số nếu có, "max_price": số nếu có, "attributes": {} },
  "query_interpretation": "diễn giải ngắn gọn"
}

Chỉ trả về JSON.`

    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({ model: 'gpt-4o-mini', messages: [{ role: 'user', content: prompt }], response_format: { type: 'json_object' }, temperature: 0.2 }),
    })

    if (!response.ok) throw new Error(`OpenAI error: ${response.status}`)
    const data = await response.json()
    const parsed = JSON.parse(data.choices?.[0]?.message?.content ?? '{}')
    return NextResponse.json({ products: [], extracted_filters: parsed.extracted_filters ?? {}, query_interpretation: parsed.query_interpretation ?? query } as SearchResult)
  } catch {
    return NextResponse.json({ products: [], extracted_filters: {}, query_interpretation: query } as SearchResult)
  }
}
