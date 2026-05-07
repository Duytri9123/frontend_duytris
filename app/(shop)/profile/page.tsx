'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { useRouter } from 'next/navigation'
import { User, Mail, Lock, Package, Star, LogOut, Save, Eye, EyeOff } from 'lucide-react'
import { apiClient } from '@/lib/api-client'
import Link from 'next/link'

export default function ProfilePage() {
  const { user, isAuthenticated, logout } = useAuth()
  const router = useRouter()

  const [tab, setTab] = useState<'info' | 'password'>('info')
  const [form, setForm] = useState({ name: user?.name ?? '', email: user?.email ?? '' })
  const [pwForm, setPwForm] = useState({ current_password: '', password: '', password_confirmation: '' })
  const [showPw, setShowPw] = useState(false)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  if (!isAuthenticated) {
    router.push('/login')
    return null
  }

  const saveInfo = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true); setMsg(null)
    try {
      await apiClient.put('/api/user/profile', form)
      setMsg({ type: 'success', text: 'Cập nhật thông tin thành công!' })
    } catch (err: any) {
      setMsg({ type: 'error', text: err?.response?.data?.message ?? 'Cập nhật thất bại' })
    } finally { setSaving(false) }
  }

  const savePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (pwForm.password !== pwForm.password_confirmation) {
      setMsg({ type: 'error', text: 'Mật khẩu xác nhận không khớp' }); return
    }
    setSaving(true); setMsg(null)
    try {
      await apiClient.put('/api/user/password', pwForm)
      setMsg({ type: 'success', text: 'Đổi mật khẩu thành công!' })
      setPwForm({ current_password: '', password: '', password_confirmation: '' })
    } catch (err: any) {
      setMsg({ type: 'error', text: err?.response?.data?.message ?? 'Đổi mật khẩu thất bại' })
    } finally { setSaving(false) }
  }

  const inp = 'w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500'

  return (
    <div className="container mx-auto px-4 py-10 max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Tài khoản của tôi</h1>

      {/* User card */}
      <div className="mb-6 flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-100 text-2xl font-bold text-indigo-600">
          {user?.name?.[0]?.toUpperCase() ?? 'U'}
        </div>
        <div>
          <p className="text-lg font-bold text-gray-900">{user?.name}</p>
          <p className="text-sm text-gray-500">{user?.email}</p>
        </div>
      </div>

      {/* Quick links */}
      <div className="mb-6 grid grid-cols-2 gap-3">
        <Link href="/orders" className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 hover:border-indigo-300 hover:bg-indigo-50 transition-colors">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100">
            <Package size={18} className="text-green-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">Đơn hàng</p>
            <p className="text-xs text-gray-400">Xem lịch sử mua hàng</p>
          </div>
        </Link>
        <Link href="/products" className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 hover:border-indigo-300 hover:bg-indigo-50 transition-colors">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-100">
            <Star size={18} className="text-yellow-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">Sản phẩm</p>
            <p className="text-xs text-gray-400">Khám phá sản phẩm mới</p>
          </div>
        </Link>
      </div>

      {/* Tabs */}
      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="flex border-b border-gray-200">
          {[
            { key: 'info', label: 'Thông tin', icon: User },
            { key: 'password', label: 'Mật khẩu', icon: Lock },
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => { setTab(key as any); setMsg(null) }}
              className={`flex flex-1 items-center justify-center gap-2 py-3.5 text-sm font-medium transition-colors ${
                tab === key ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon size={15} /> {label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {msg && (
            <div className={`mb-4 rounded-xl px-4 py-3 text-sm font-medium ${msg.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
              {msg.text}
            </div>
          )}

          {tab === 'info' && (
            <form onSubmit={saveInfo} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Họ và tên</label>
                <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className={inp} placeholder="Nhập họ tên" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Email</label>
                <input value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} type="email" className={inp} placeholder="Nhập email" />
              </div>
              <button type="submit" disabled={saving}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60 transition-colors">
                <Save size={15} /> {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
              </button>
            </form>
          )}

          {tab === 'password' && (
            <form onSubmit={savePassword} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Mật khẩu hiện tại</label>
                <div className="relative">
                  <input value={pwForm.current_password} onChange={e => setPwForm(p => ({ ...p, current_password: e.target.value }))}
                    type={showPw ? 'text' : 'password'} className={inp} placeholder="Nhập mật khẩu hiện tại" />
                  <button type="button" onClick={() => setShowPw(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Mật khẩu mới</label>
                <input value={pwForm.password} onChange={e => setPwForm(p => ({ ...p, password: e.target.value }))}
                  type="password" className={inp} placeholder="Tối thiểu 8 ký tự" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Xác nhận mật khẩu mới</label>
                <input value={pwForm.password_confirmation} onChange={e => setPwForm(p => ({ ...p, password_confirmation: e.target.value }))}
                  type="password" className={inp} placeholder="Nhập lại mật khẩu mới" />
              </div>
              <button type="submit" disabled={saving}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60 transition-colors">
                <Lock size={15} /> {saving ? 'Đang lưu...' : 'Đổi mật khẩu'}
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Logout */}
      <button onClick={logout}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-red-300 bg-red-50 py-2.5 text-sm font-medium text-red-600 hover:bg-red-100 transition-colors">
        <LogOut size={15} /> Đăng xuất
      </button>
    </div>
  )
}
