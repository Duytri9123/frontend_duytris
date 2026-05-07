'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supportTicketApi } from '@/lib/api-client'
import { StatusBadge, PriorityBadge, CategoryBadge } from './SupportTicketStatusBadge'

interface Ticket {
  id: number
  title: string
  category: string
  priority: string
  status: string
  created_at: string
  replies_count: number
}

export function SupportTicketList() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    status: '',
    category: '',
    priority: '',
    search: '',
  })

  useEffect(() => {
    loadTickets()
  }, [filters])

  const loadTickets = async () => {
    setLoading(true)
    try {
      const response = await supportTicketApi.getTickets({
        status: filters.status || undefined,
        category: filters.category || undefined,
        priority: filters.priority || undefined,
        search: filters.search || undefined,
      })
      setTickets(response.data.data)
    } catch (error) {
      console.error('Failed to load tickets:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-white p-4 rounded-lg border">
        <input
          type="text"
          placeholder="Tìm kiếm..."
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Tất cả trạng thái</option>
          <option value="open">Mở</option>
          <option value="in_progress">Đang xử lý</option>
          <option value="resolved">Đã giải quyết</option>
          <option value="closed">Đã đóng</option>
        </select>
        <select
          value={filters.category}
          onChange={(e) => setFilters({ ...filters, category: e.target.value })}
          className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Tất cả loại</option>
          <option value="complaint">Phàn nàn</option>
          <option value="support">Hỗ trợ</option>
          <option value="report">Báo cáo</option>
          <option value="feedback">Phản hồi</option>
        </select>
        <select
          value={filters.priority}
          onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
          className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Tất cả độ ưu tiên</option>
          <option value="low">Thấp</option>
          <option value="medium">Trung bình</option>
          <option value="high">Cao</option>
          <option value="urgent">Khẩn cấp</option>
        </select>
      </div>

      {loading ? (
        <div className="text-center py-8">Đang tải...</div>
      ) : tickets.length === 0 ? (
        <div className="text-center py-8 text-gray-500">Không có phiếu hỗ trợ nào</div>
      ) : (
        <div className="space-y-3">
          {tickets.map((ticket) => (
            <Link
              key={ticket.id}
              href={`/support/${ticket.id}`}
              className="block bg-white p-4 rounded-lg border hover:border-blue-500 transition"
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-lg">{ticket.title}</h3>
                <StatusBadge status={ticket.status as any} size="sm" />
              </div>
              <div className="flex gap-2 mb-2">
                <CategoryBadge category={ticket.category} size="sm" />
                <PriorityBadge priority={ticket.priority} size="sm" />
              </div>
              <div className="flex justify-between text-sm text-gray-500">
                <span>{new Date(ticket.created_at).toLocaleDateString('vi-VN')}</span>
                <span>{ticket.replies_count} phản hồi</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
