'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import {
  Bot, X, Send, Loader2, Mic, MicOff, Search, Star,
  ArrowLeftRight, ShoppingBag, ChevronDown, Copy, Check,
  Minimize2, Maximize2, Trash2, Camera, Square, Clock
} from 'lucide-react'
import { apiClient } from '@/lib/api-client'

interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: string
  imageUrl?: string
}

const QUICK_ACTIONS = [
  { icon: Search,         label: 'Tìm sản phẩm',     prompt: 'Tôi muốn tìm sản phẩm ' },
  { icon: Star,           label: 'Review sản phẩm',   prompt: 'Hãy review và đánh giá sản phẩm ' },
  { icon: ArrowLeftRight, label: 'So sánh 2 SP',      prompt: 'So sánh 2 sản phẩm: ' },
  { icon: ShoppingBag,    label: 'Tìm trên sàn TMĐT', prompt: 'Tìm sản phẩm tương tự trên Shopee, Lazada, Tiki: ' },
]

function fmtTime(ts: string) {
  return new Date(ts).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
}

function renderContent(text: string) {
  const lines = text.split('\n')
  return lines.map((line, i) => {
    const parts = line.split(/(\*\*[^*]+\*\*)/g)
    const rendered = parts.map((p, j) =>
      p.startsWith('**') && p.endsWith('**') ? <strong key={j}>{p.slice(2, -2)}</strong> : <span key={j}>{p}</span>
    )
    return <span key={i}>{rendered}{i < lines.length - 1 && <br />}</span>
  })
}

export function FloatingAiChat() {
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const [posReady, setPosReady] = useState(false)
  const [dragging, setDragging] = useState(false)
  const dragOffset = useRef({ x: 0, y: 0 })
  const hasDragged = useRef(false)

  const [open, setOpen] = useState(false)
  const [minimized, setMinimized] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const abortRef = useRef<AbortController | null>(null)
  const [convId, setConvId] = useState<number | null>(null)
  const [copied, setCopied] = useState<number | null>(null)
  const [showActions, setShowActions] = useState(true)
  const [listening, setListening] = useState(false)
  const [voiceSupported, setVoiceSupported] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imageBase64, setImageBase64] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const recognitionRef = useRef<any>(null)
  const imgInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    // Bottom-right, safe margin from edge
    const x = Math.min(window.innerWidth - 72, window.innerWidth - 80)
    const y = Math.min(window.innerHeight - 72, window.innerHeight - 80)
    setPos({ x, y })
    setPosReady(true)
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    setVoiceSupported(!!SR)
  }, [])

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, loading])

  // ── Drag (mouse) ──
  const onMouseDown = useCallback((e: React.MouseEvent) => {
    hasDragged.current = false
    dragOffset.current = { x: e.clientX - pos.x, y: e.clientY - pos.y }
    setDragging(true)
    e.preventDefault()
  }, [pos])

  useEffect(() => {
    if (!dragging) return
    const onMove = (e: MouseEvent) => {
      hasDragged.current = true
      setPos({
        x: Math.max(8, Math.min(window.innerWidth - 64, e.clientX - dragOffset.current.x)),
        y: Math.max(8, Math.min(window.innerHeight - 64, e.clientY - dragOffset.current.y)),
      })
    }
    const onUp = () => setDragging(false)
    window.addEventListener('mousemove', onMove); window.addEventListener('mouseup', onUp)
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp) }
  }, [dragging])

  // ── Drag (touch) ──
  const onTouchStart = useCallback((e: React.TouchEvent) => {
    hasDragged.current = false
    const t = e.touches[0]
    dragOffset.current = { x: t.clientX - pos.x, y: t.clientY - pos.y }
  }, [pos])

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    hasDragged.current = true
    const t = e.touches[0]
    setPos({
      x: Math.max(8, Math.min(window.innerWidth - 64, t.clientX - dragOffset.current.x)),
      y: Math.max(8, Math.min(window.innerHeight - 64, t.clientY - dragOffset.current.y)),
    })
  }, [])

  // ── Voice ──
  const toggleVoice = useCallback(() => {
    if (listening) { recognitionRef.current?.stop(); setListening(false); return }
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SR) return
    const r = new SR()
    r.lang = 'vi-VN'; r.continuous = false; r.interimResults = true
    r.onstart = () => setListening(true)
    r.onend = () => setListening(false)
    r.onresult = (e: any) => {
      const t = Array.from(e.results as any[]).map((x: any) => x[0].transcript).join('')
      setInput(t)
    }
    r.onerror = () => setListening(false)
    recognitionRef.current = r; r.start()
  }, [listening])

  // ── Image upload ──
  const handleImageUpload = (file: File) => {
    const reader = new FileReader()
    reader.onload = e => {
      const url = e.target?.result as string
      setImagePreview(url); setImageBase64(url)
    }
    reader.readAsDataURL(file)
  }

  // ── Send ──
  const send = useCallback(async () => {
    const content = input.trim()
    if ((!content && !imageBase64) || loading) return

    const ts = new Date().toISOString()
    const userMsg: Message = { role: 'user', content: content || '📷 Gửi ảnh để phân tích', timestamp: ts, imageUrl: imagePreview ?? undefined }
    setMessages(m => [...m, userMsg])
    setInput(''); setImagePreview(null)
    setLoading(true); setShowActions(false)

    const ctrl = new AbortController()
    abortRef.current = ctrl

    try {
      const apiMessages = [...messages, userMsg].map(m => {
        if (m.imageUrl && m.role === 'user') {
          return { role: 'user', content: [{ type: 'text', text: m.content || 'Phân tích ảnh này' }, { type: 'image_url', image_url: { url: m.imageUrl } }] }
        }
        return { role: m.role, content: m.content }
      })

      const { data } = await apiClient.post('/api/ai/customer-chat', {
        messages: apiMessages,
        conversation_id: convId,
        has_image: !!imageBase64,
      })
      setImageBase64(null)
      setMessages(m => [...m, { role: 'assistant', content: data.content, timestamp: new Date().toISOString() }])
      setConvId(data.conversation_id ?? null)
    } catch (err: any) {
      if (err?.name === 'CanceledError' || err?.code === 'ERR_CANCELED') return
      setMessages(m => [...m, { role: 'assistant', content: '❌ Xin lỗi, tôi đang gặp sự cố. Vui lòng thử lại sau.', timestamp: new Date().toISOString() }])
    } finally {
      setLoading(false); abortRef.current = null
    }
  }, [input, imageBase64, imagePreview, loading, messages, convId])

  const stopGeneration = () => { abortRef.current?.abort(); setLoading(false) }
  const copyMsg = (idx: number, content: string) => { navigator.clipboard.writeText(content); setCopied(idx); setTimeout(() => setCopied(null), 2000) }
  const clearChat = () => { setMessages([]); setConvId(null); setShowActions(true); setImagePreview(null); setImageBase64(null) }

  const panelRight = pos.x > (typeof window !== 'undefined' ? window.innerWidth : 800) / 2
  const panelBottom = pos.y > (typeof window !== 'undefined' ? window.innerHeight : 600) / 2

  if (!posReady) return null

  return (
    <>
      {/* Draggable button — works on mobile too */}
      <button
        onMouseDown={onMouseDown}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={() => { if (!hasDragged.current) setOpen(p => !p) }}
        onClick={() => { if (!hasDragged.current) setOpen(p => !p) }}
        style={{ position: 'fixed', left: pos.x, top: pos.y, zIndex: 9999, cursor: dragging ? 'grabbing' : 'grab', userSelect: 'none', touchAction: 'none' }}
        className={`flex h-14 w-14 items-center justify-center rounded-2xl shadow-lg transition-transform ${open ? 'bg-gray-800 text-white' : 'bg-indigo-600 text-white hover:bg-indigo-700'} ${dragging ? 'scale-110 shadow-2xl' : ''}`}
        aria-label="AI Trợ lý"
      >
        {open ? <X size={22} /> : (
          <div className="relative">
            <Bot size={22} />
            <span className="absolute -right-1 -top-1 flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-300 opacity-75" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-indigo-200" />
            </span>
          </div>
        )}
      </button>

      {/* Chat panel */}
      {open && (
        <div
          style={{
            position: 'fixed', zIndex: 9998,
            ...(panelRight ? { right: window.innerWidth - pos.x - 56 } : { left: pos.x }),
            ...(panelBottom ? { bottom: window.innerHeight - pos.y + 8 } : { top: pos.y + 64 }),
            width: 'min(380px, calc(100vw - 24px))',
          }}
          className="flex flex-col rounded-2xl border border-gray-200 bg-white shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between bg-indigo-600 px-4 py-3 shrink-0">
            <div className="flex items-center gap-2">
              <Bot size={16} className="text-white" />
              <div>
                <p className="text-sm font-semibold text-white leading-tight">AI Trợ lý mua sắm</p>
                <p className="text-[10px] text-indigo-200">Tìm kiếm · So sánh · Review · Ảnh</p>
              </div>
              {loading && <Loader2 size={13} className="animate-spin text-indigo-200" />}
            </div>
            <div className="flex items-center gap-1">
              {messages.length > 0 && <button onClick={clearChat} className="rounded-lg p-1.5 text-indigo-200 hover:bg-indigo-700" title="Xóa chat"><Trash2 size={13} /></button>}
              <button onClick={() => setMinimized(p => !p)} className="rounded-lg p-1.5 text-indigo-200 hover:bg-indigo-700">{minimized ? <Maximize2 size={13} /> : <Minimize2 size={13} />}</button>
              <button onClick={() => setOpen(false)} className="rounded-lg p-1.5 text-indigo-200 hover:bg-indigo-700"><X size={13} /></button>
            </div>
          </div>

          {!minimized && (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-3 space-y-4" style={{ minHeight: 200, maxHeight: 360 }}>
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <Bot size={36} className="mb-2 text-indigo-200" />
                    <p className="text-sm font-semibold text-gray-700">Xin chào! Tôi có thể giúp bạn</p>
                    <p className="text-xs text-gray-400 mt-1">Tìm kiếm, so sánh và review sản phẩm</p>
                    <div className="mt-2 flex flex-wrap justify-center gap-2 text-[10px] text-indigo-400">
                      {voiceSupported && <span className="flex items-center gap-1"><Mic size={10} /> Giọng nói</span>}
                      <span className="flex items-center gap-1"><Camera size={10} /> Tìm bằng ảnh</span>
                    </div>
                  </div>
                ) : (
                  messages.map((msg, i) => {
                    const isUser = msg.role === 'user'
                    return (
                      <div key={i} className={`flex gap-2 ${isUser ? 'flex-row-reverse' : ''}`}>
                        <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-white text-[10px] ${isUser ? 'bg-indigo-600' : 'bg-gray-700'}`}>
                          {isUser ? 'U' : <Bot size={11} />}
                        </div>
                        <div className={`flex flex-col gap-1 max-w-[82%] ${isUser ? 'items-end' : 'items-start'}`}>
                          {msg.imageUrl && <img src={msg.imageUrl} alt="uploaded" className="rounded-xl max-h-32 object-cover border border-gray-200" />}
                          {msg.content && (
                            <div className={`group relative rounded-2xl px-3 py-2 text-sm leading-relaxed ${isUser ? 'bg-indigo-600 text-white rounded-tr-sm' : 'bg-gray-100 text-gray-800 rounded-tl-sm'}`}>
                              <p className="whitespace-pre-wrap">{renderContent(msg.content)}</p>
                              <button onClick={() => copyMsg(i, msg.content)}
                                className={`absolute -bottom-5 ${isUser ? 'right-0' : 'left-0'} hidden group-hover:flex items-center gap-1 text-[10px] text-gray-400 hover:text-gray-600`}>
                                {copied === i ? <Check size={9} className="text-green-500" /> : <Copy size={9} />}
                                {copied === i ? 'Đã copy' : 'Copy'}
                              </button>
                            </div>
                          )}
                          <div className="flex items-center gap-1 text-[9px] text-gray-400">
                            <Clock size={8} />{fmtTime(msg.timestamp)}
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}
                {loading && (
                  <div className="flex gap-2">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gray-700 text-white"><Bot size={11} /></div>
                    <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-sm bg-gray-100 px-3 py-2">
                      {[0,1,2].map(i => <span key={i} className="h-1.5 w-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />)}
                    </div>
                  </div>
                )}
                <div ref={bottomRef} />
              </div>

              {/* Quick actions */}
              {showActions && (
                <div className="border-t border-gray-100 px-3 py-2 shrink-0">
                  <div className="mb-1.5 flex items-center justify-between">
                    <span className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">Thao tác nhanh</span>
                    <button onClick={() => setShowActions(false)} className="text-gray-300 hover:text-gray-500"><ChevronDown size={12} /></button>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    {QUICK_ACTIONS.map(({ icon: Icon, label, prompt }) => (
                      <button key={label} onClick={() => { setInput(prompt); setTimeout(() => textareaRef.current?.focus(), 50) }}
                        className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-2 text-left text-xs font-medium text-gray-700 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 transition-colors">
                        <Icon size={12} className="shrink-0 text-indigo-500" />{label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Image preview */}
              {imagePreview && (
                <div className="border-t border-gray-100 px-3 py-2 shrink-0 flex items-center gap-2">
                  <div className="relative">
                    <img src={imagePreview} alt="preview" className="h-12 rounded-lg border border-gray-200 object-cover" />
                    <button onClick={() => { setImagePreview(null); setImageBase64(null) }}
                      className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-white shadow">
                      <X size={8} />
                    </button>
                  </div>
                  <p className="text-[10px] text-indigo-500">📷 Ảnh sẽ được gửi kèm</p>
                </div>
              )}

              {/* Voice indicator */}
              {listening && (
                <div className="border-t border-gray-100 px-3 py-1.5 shrink-0 flex items-center gap-2 bg-red-50">
                  <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-xs text-red-600">Đang nghe... Nói câu hỏi của bạn</span>
                </div>
              )}

              {/* Input */}
              <div className="border-t border-gray-100 p-2.5 shrink-0">
                <div className="flex items-end gap-2">
                  {/* Textarea */}
                  <textarea
                    ref={textareaRef}
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); void send() } }}
                    placeholder={voiceSupported ? 'Nhập hoặc dùng mic/ảnh...' : 'Nhập câu hỏi... (Enter gửi)'}
                    rows={2}
                    className="flex-1 resize-none rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    style={{ minHeight: 56 }}
                  />
                  <div className="flex flex-col gap-1.5">
                    {/* Image search */}
                    <button onClick={() => imgInputRef.current?.click()}
                      className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-300 text-gray-500 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-300 transition-colors"
                      title="Tìm kiếm bằng ảnh">
                      <Camera size={14} />
                    </button>
                    {/* Voice */}
                    {voiceSupported && (
                      <button onClick={toggleVoice}
                        className={`flex h-9 w-9 items-center justify-center rounded-xl transition-colors ${listening ? 'bg-red-500 text-white' : 'border border-gray-300 text-gray-500 hover:bg-gray-50 hover:text-indigo-600'}`}
                        title={listening ? 'Dừng ghi âm' : 'Tìm kiếm bằng giọng nói'}>
                        {listening ? <MicOff size={14} /> : <Mic size={14} />}
                      </button>
                    )}
                    {/* Stop / Send */}
                    {loading ? (
                      <button onClick={stopGeneration}
                        className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-500 text-white hover:bg-red-600 transition-colors"
                        title="Dừng">
                        <Square size={12} fill="white" />
                      </button>
                    ) : (
                      <button onClick={send} disabled={!input.trim() && !imageBase64}
                        className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-40 transition-colors">
                        <Send size={14} />
                      </button>
                    )}
                  </div>
                </div>
                {!showActions && messages.length > 0 && (
                  <button onClick={() => setShowActions(true)} className="mt-1.5 flex w-full items-center justify-center gap-1 text-[10px] text-gray-400 hover:text-indigo-500">
                    <Bot size={10} /> Thao tác nhanh
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      )}

      <input ref={imgInputRef} type="file" accept="image/*" className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) handleImageUpload(f); e.target.value = '' }} />
    </>
  )
}
