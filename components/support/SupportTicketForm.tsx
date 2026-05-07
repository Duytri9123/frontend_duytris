'use client'

import { useState } from 'react'
import { supportTicketApi } from '@/lib/api-client'
import { useToast } from '@/hooks/use-toast'

interface SupportTicketFormProps {
  onSuccess?: () => void
}

export function SupportTicketForm({ onSuccess }: SupportTicketFormProps) {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'support' as const,
    priority: 'medium' as const,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await supportTicketApi.createTicket(formData)
      toast({
        title: 'Thành công',
        description: 'Phiếu hỗ trợ đã được tạo',
      })
      setFormData({
        title: '',
        description: '',
        category: 'support',
        priority: 'medium',
      })
      onSuccess?.()
    } catch (error) {
      toast({
        title: 'Lỗi',
        description: 'Không thể tạo phiếu hỗ trợ',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg border">
      <div>
        <label className="block text-sm font-medium mb-1">Tiêu đề</label>
        <input
          type="text"
          required
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Nhập tiêu đề phiếu hỗ trợ"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Mô tả</label>
        <textarea
          required
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-32"
          placeholder="Mô tả chi tiết vấn đề của bạn"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Loại</label>
          <select
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="complaint">Phàn nàn</option>
            <option value="support">Hỗ trợ</option>
            <option value="report">Báo cáo</option>
            <option value="feedback">Phản hồi</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Độ ưu tiên</label>
          <select
            value={formData.priority}
            onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="low">Thấp</option>
            <option value="medium">Trung bình</option>
            <option value="high">Cao</option>
            <option value="urgent">Khẩn cấp</option>
          </select>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Đang tạo...' : 'Tạo phiếu hỗ trợ'}
      </button>
    </form>
  )
}
