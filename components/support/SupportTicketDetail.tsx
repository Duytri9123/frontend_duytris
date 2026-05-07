'use client'

import { useEffect, useState } from 'react'
import { supportTicketApi } from '@/lib/api-client'
import { StatusBadge, PriorityBadge, CategoryBadge } from './SupportTicketStatusBadge'
import { SupportTicketReplyThread } from './SupportTicketReplyThread'

interface Ticket {
  id: number
  title: string
  description: string
  category: string
  priority: string
  status: string
  user: {
    id: number
    name: string
    email: string
  }
  replies: any[]
  created_at: string
  resolved_at?: string
}

interface TicketDetailProps {
  ticketId: number
}

export function SupportTicketDetail({ ticketId }: TicketDetailProps) {
  const [ticket, setTicket] = useState<Ticket | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadTicket()
  }, [ticketId])

  const loadTicket = async () => {
    setLoading(true)
    try {
      const response = await supportTicketApi.getTicketDetail(ticketId)
      setTicket(response.data.data)
    } catch (error) {
      console.error('Failed to load ticket:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="text-center py-8">Đang tải...</div>
  if (!ticket) return <div className="text-center py-8">Không tìm thấy phiếu hỗ trợ</div>

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg border">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-2xl font-bold mb-2">{ticket.title}</h1>
            <div className="flex gap-2">
              <StatusBadge status={ticket.status as any} />
              <CategoryBadge category={ticket.category} />
              <PriorityBadge priority={ticket.priority} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
          <div>
            <p className="text-gray-500">Người tạo</p>
            <p className="font-semibold">{ticket.user.name}</p>
          </div>
          <div>
            <p className="text-gray-500">Ngày tạo</p>
            <p className="font-semibold">{new Date(ticket.created_at).toLocaleDateString('vi-VN')}</p>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-gray-700 whitespace-pre-wrap">{ticket.description}</p>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold mb-4">Phản hồi ({ticket.replies.length})</h2>
        <SupportTicketReplyThread
          ticketId={ticket.id}
          replies={ticket.replies}
          onReplyAdded={loadTicket}
        />
      </div>
    </div>
  )
}
