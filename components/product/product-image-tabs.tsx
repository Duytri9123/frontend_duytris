'use client'
import { useState } from 'react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

function resolveUrl(url: string | undefined): string {
  if (!url) return ''
  if (url.startsWith('http://') || url.startsWith('https://')) return url
  if (url.startsWith('/')) return `${API_URL}${url}`
  return `${API_URL}/storage/${url}`
}

interface ImageItem {
  id: number
  url: string
}

interface ProductImageTabsProps {
  images: ImageItem[]
  productName: string
}

export default function ProductImageTabs({ images, productName }: ProductImageTabsProps) {
  const [activeIdx, setActiveIdx] = useState(0)

  return (
    <div className="space-y-3">
      {/* Main image */}
      <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-gray-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={resolveUrl(images[activeIdx]?.url)}
          alt={`${productName} - ảnh ${activeIdx + 1}`}
          className="h-full w-full object-cover transition-opacity duration-200"
        />
        {/* Image counter */}
        <div className="absolute bottom-3 right-3 rounded-full bg-black/50 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-sm">
          {activeIdx + 1} / {images.length}
        </div>
      </div>

      {/* Thumbnail strip */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {images.map((img, idx) => (
          <button
            key={img.id}
            onClick={() => setActiveIdx(idx)}
            className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 transition-all duration-150 ${
              idx === activeIdx
                ? 'border-indigo-500 shadow-sm'
                : 'border-gray-200 hover:border-gray-400 opacity-70 hover:opacity-100'
            }`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={resolveUrl(img.url)}
              alt={`${productName} thumbnail ${idx + 1}`}
              className="h-full w-full object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  )
}
