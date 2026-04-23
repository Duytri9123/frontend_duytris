'use client'

import { useState } from 'react'

export interface CheckoutFormData {
  full_name: string
  phone: string
  province: string
  district: string
  ward: string
  street: string
  payment_method: 'cod' | 'bank_transfer'
}

interface CheckoutFormProps {
  onSubmit: (data: CheckoutFormData) => void
  isLoading: boolean
}

export function CheckoutForm({ onSubmit, isLoading }: CheckoutFormProps) {
  const [form, setForm] = useState<CheckoutFormData>({
    full_name: '',
    phone: '',
    province: '',
    district: '',
    ward: '',
    street: '',
    payment_method: 'cod',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(form)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="mb-4 text-lg font-semibold">Địa chỉ giao hàng</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {[
            { name: 'full_name', label: 'Họ và tên', placeholder: 'Nguyễn Văn A' },
            { name: 'phone', label: 'Số điện thoại', placeholder: '0901234567' },
            { name: 'province', label: 'Tỉnh / Thành phố', placeholder: 'Hà Nội' },
            { name: 'district', label: 'Quận / Huyện', placeholder: 'Cầu Giấy' },
            { name: 'ward', label: 'Phường / Xã', placeholder: 'Dịch Vọng' },
            { name: 'street', label: 'Địa chỉ cụ thể', placeholder: 'Số 1, Đường ABC' },
          ].map((field) => (
            <div key={field.name}>
              <label className="mb-1 block text-sm font-medium">
                {field.label} <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                name={field.name}
                value={form[field.name as keyof CheckoutFormData]}
                onChange={handleChange}
                required
                placeholder={field.placeholder}
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="mb-4 text-lg font-semibold">Phương thức thanh toán</h2>
        <div className="space-y-3">
          {[
            { value: 'cod', label: 'Thanh toán khi nhận hàng (COD)', desc: 'Thanh toán bằng tiền mặt khi nhận hàng' },
            { value: 'bank_transfer', label: 'Chuyển khoản ngân hàng', desc: 'Chuyển khoản qua tài khoản ngân hàng' },
          ].map((opt) => (
            <label
              key={opt.value}
              className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted ${form.payment_method === opt.value ? 'border-primary bg-primary/5' : ''}`}
            >
              <input
                type="radio"
                name="payment_method"
                value={opt.value}
                checked={form.payment_method === opt.value}
                onChange={handleChange}
                className="h-4 w-4"
              />
              <div>
                <p className="text-sm font-medium">{opt.label}</p>
                <p className="text-xs text-muted-foreground">{opt.desc}</p>
              </div>
            </label>
          ))}
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full rounded-lg bg-primary px-6 py-3 font-semibold text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isLoading ? 'Đang xử lý...' : 'Đặt hàng'}
      </button>
    </form>
  )
}
