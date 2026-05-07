import { SupportTicketForm } from '@/components/support/SupportTicketForm'
import { SupportTicketList } from '@/components/support/SupportTicketList'

export const metadata = {
  title: 'Hỗ trợ',
  description: 'Quản lý phiếu hỗ trợ của bạn',
}

export default function SupportPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Trung tâm hỗ trợ</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <SupportTicketForm />
        </div>

        <div className="lg:col-span-2">
          <h2 className="text-2xl font-bold mb-4">Phiếu hỗ trợ của bạn</h2>
          <SupportTicketList />
        </div>
      </div>
    </div>
  )
}
