'use client'

interface StatusBadgeProps {
  status: 'open' | 'in_progress' | 'resolved' | 'closed'
  size?: 'sm' | 'md'
}

const statusConfig = {
  open: { label: 'Mở', color: 'bg-blue-100 text-blue-800' },
  in_progress: { label: 'Đang xử lý', color: 'bg-yellow-100 text-yellow-800' },
  resolved: { label: 'Đã giải quyết', color: 'bg-green-100 text-green-800' },
  closed: { label: 'Đã đóng', color: 'bg-gray-100 text-gray-800' },
}

const priorityConfig = {
  low: { label: 'Thấp', color: 'bg-gray-100 text-gray-800' },
  medium: { label: 'Trung bình', color: 'bg-blue-100 text-blue-800' },
  high: { label: 'Cao', color: 'bg-orange-100 text-orange-800' },
  urgent: { label: 'Khẩn cấp', color: 'bg-red-100 text-red-800' },
}

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const config = statusConfig[status]
  const sizeClass = size === 'sm' ? 'px-2 py-1 text-xs' : 'px-3 py-1 text-sm'
  
  return (
    <span className={`inline-block rounded-full font-medium ${config.color} ${sizeClass}`}>
      {config.label}
    </span>
  )
}

export function PriorityBadge({ priority, size = 'md' }: { priority: string; size?: 'sm' | 'md' }) {
  const config = priorityConfig[priority as keyof typeof priorityConfig]
  const sizeClass = size === 'sm' ? 'px-2 py-1 text-xs' : 'px-3 py-1 text-sm'
  
  return (
    <span className={`inline-block rounded-full font-medium ${config.color} ${sizeClass}`}>
      {config.label}
    </span>
  )
}

export function CategoryBadge({ category, size = 'md' }: { category: string; size?: 'sm' | 'md' }) {
  const categoryConfig = {
    complaint: { label: 'Phàn nàn', color: 'bg-red-100 text-red-800' },
    support: { label: 'Hỗ trợ', color: 'bg-blue-100 text-blue-800' },
    report: { label: 'Báo cáo', color: 'bg-purple-100 text-purple-800' },
    feedback: { label: 'Phản hồi', color: 'bg-green-100 text-green-800' },
  }
  
  const config = categoryConfig[category as keyof typeof categoryConfig]
  const sizeClass = size === 'sm' ? 'px-2 py-1 text-xs' : 'px-3 py-1 text-sm'
  
  return (
    <span className={`inline-block rounded-full font-medium ${config.color} ${sizeClass}`}>
      {config.label}
    </span>
  )
}
