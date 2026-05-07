import Link from 'next/link'
import { Calendar, ArrowRight, FileText } from 'lucide-react'

interface Post {
  id: number
  title: string
  slug: string
  excerpt?: string
  thumbnail_url?: string
  category?: string
  created_at: string
}

interface PostsSectionProps {
  posts: Post[]
}

export function PostsSection({ posts }: PostsSectionProps) {
  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Tin tức & Bài viết</h2>
        <Link href="/posts" className="flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-700">
          Xem tất cả <ArrowRight size={14} />
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <Link
            key={post.id}
            href={`/posts/${post.slug}`}
            className="group flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5"
          >
            {/* Thumbnail */}
            <div className="relative h-44 overflow-hidden bg-gray-100">
              {post.thumbnail_url ? (
                <img
                  src={post.thumbnail_url}
                  alt={post.title}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <FileText size={36} className="text-gray-300" />
                </div>
              )}
              {post.category && (
                <span className="absolute left-3 top-3 rounded-full bg-indigo-600 px-2.5 py-0.5 text-[10px] font-semibold text-white">
                  {post.category}
                </span>
              )}
            </div>

            {/* Content */}
            <div className="flex flex-1 flex-col p-4">
              <h3 className="line-clamp-2 text-sm font-semibold text-gray-900 leading-snug group-hover:text-indigo-600 transition-colors">
                {post.title}
              </h3>
              {post.excerpt && (
                <p className="mt-1.5 line-clamp-2 text-xs text-gray-500 leading-relaxed">{post.excerpt}</p>
              )}
              <div className="mt-auto pt-3 flex items-center gap-1.5 text-[10px] text-gray-400">
                <Calendar size={10} />
                {new Date(post.created_at).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
