import { SupportTicketDetail } from '@/components/support/SupportTicketDetail'

export const metadata = {
  title: 'Chi tiết phiếu hỗ trợ',
  description: 'Xem chi tiết phiếu hỗ trợ',
}

interface TicketDetailPageProps {
  params: {
    id: string
  }
}

export default function TicketDetailPage({ params }: TicketDetailPageProps) {
  const ticketId = parseInt(params.id)

  return (
    <div className="container mx-auto px-4 py-8">
      <a href="/support" className="text-blue-600 hover:underline mb-4 inline-block">
        ← Quay lại
      </a>
      <SupportTicketDetail ticketId={ticketId} />
    </div>
  )
}
