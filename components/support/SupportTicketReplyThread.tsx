'use client'

import { useState } from 'react'
import { supportTicketApi } from '@/lib/api-client'
import { useToast } from '@/hooks/use-toast'

interface Reply {
  id: number
  user: {
    id: number
    name: string
    email: string
    isAdmin: boolean
  }
  message: string
  attachment_url?: string
  created_at: string
}

interface ReplyThreadProps {
  ticketId: number
  replies: Reply[]
  onReplyAdded?: () => void
}

export function SupportTicketReplyThread({ ticketId, replies, onReplyAdded }: ReplyThreadProps) {
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleAddReply = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!message.trim()) return

    setLoading(true)
    try {
      await supportTicketApi.addReply(ticketId, { message })
      toast({
        title: 'Thành công',
        description: 'Phản hồi đã được thêm',
      })
      setMessage('')
      onReplyAdded?.()
    } catch (error) {
      toast({
        title: 'Lỗi',
        description: 'Không thể thêm phản hồi',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {replies.map((reply) => (
          <div key={reply.id} className="bg-gray-50 p-4 rounded-lg border">
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="font-semibold">{reply.user.name}</p>
                <p className="text-sm text-gray-500">{reply.user.email}</p>
              </div>
              {reply.user.isAdmin && (
                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">Admin</span>
              )}
            </div>
            <p className="text-gray-700 whitespace-pre-wrap">{reply.message}</p>
            <p className="text-xs text-gray-500 mt-2">
              {new Date(reply.created_at).toLocaleString('vi-VN')}
            </p>
          </div>
        ))}
      </div>

      <form onSubmit={handleAddReply} className="bg-white p-4 rounded-lg border space-y-3">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Nhập phản hồi của bạn..."
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-24"
        />
        <button
          type="submit"
          disabled={loading || !message.trim()}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Đang gửi...' : 'Gửi phản hồi'}
        </button>
      </form>
    </div>
  )
}
