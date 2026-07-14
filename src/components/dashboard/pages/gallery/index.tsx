import { useEffect, useRef, useState } from 'react'
import { Icon } from '../../../auth/AuthIcons'
import { PageHead } from '../../../../pages/DashboardPage'
import { api } from '../../../../lib/api'
import { useAuth } from '../../../../contexts/AuthContext'
import { cn } from '@/lib/utils'

const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp']

interface GalleryImage {
  id: string
  eventId: string
  url: string
  caption: string | null
  sortOrder: number
  createdAt: string
}

interface GalleryCardProps {
  image: GalleryImage
  onDelete: (imageId: string) => void
  onCaptionSaved: (imageId: string, caption: string) => void
}

function GalleryCard({ image, onDelete, onCaptionSaved }: GalleryCardProps) {
  const [caption, setCaption] = useState(image.caption ?? '')
  const [saving, setSaving] = useState(false)

  const handleBlur = async () => {
    if (caption === (image.caption ?? '')) return
    setSaving(true)
    try {
      await api.updateGalleryImage(image.eventId, image.id, { caption })
      onCaptionSaved(image.id, caption)
    } catch {
      setCaption(image.caption ?? '')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition-all hover:-translate-y-0.5 hover:shadow-ca-md">
      <div className="relative h-[160px] w-full bg-slate-100">
        <img src={image.url} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <button
          onClick={() => onDelete(image.id)}
          className="absolute top-2 right-2 flex h-8 w-8 items-center justify-center rounded-lg bg-white/90 text-red-500 transition hover:bg-white"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-4 w-4">
            <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
      <div className="p-3">
        <input
          value={caption}
          onChange={e => setCaption(e.target.value)}
          onBlur={handleBlur}
          placeholder="Adicionar legenda…"
          className="w-full rounded-lg border border-slate-200 px-2.5 py-2 text-[13px] text-slate-900 bg-white focus:outline-none focus:border-indigo-400 box-border"
        />
        {saving && <span className="mt-1 block text-[11px] text-slate-400">Salvando…</span>}
      </div>
    </div>
  )
}

interface DashGalleryProps { event: any | null; onReload: () => void }

export function DashGallery({ event }: DashGalleryProps) {
  const { user } = useAuth()
  const [images, setImages] = useState<GalleryImage[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const max = Number(user?.plan?.features?.maxGalleryPhotos ?? 0)

  const load = async () => {
    if (!event?.id) return
    setLoading(true)
    try {
      const data = await api.getGallery(event.id)
      setImages(data)
    } catch {
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [event?.id])

  const handleFiles = async (fileList: FileList | null) => {
    if (!fileList || !fileList.length || !event?.id) return
    const files = Array.from(fileList)
    const invalid = files.find(f => !ALLOWED_MIME.includes(f.type))
    if (invalid) { setError('Arquivo inválido. Use JPG, PNG ou WebP.'); return }

    setUploading(true)
    setError('')
    try {
      const created = await api.uploadGalleryImages(event.id, files)
      setImages(prev => [...prev, ...created])
    } catch (e: any) {
      setError(e.message ?? 'Erro ao enviar imagens.')
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (imageId: string) => {
    if (!event?.id) return
    if (!window.confirm('Remover esta foto?')) return
    try {
      await api.deleteGalleryImage(event.id, imageId)
      setImages(prev => prev.filter(img => img.id !== imageId))
    } catch (e: any) {
      alert(e.message)
    }
  }

  const handleCaptionSaved = (imageId: string, caption: string) => {
    setImages(prev => prev.map(img => img.id === imageId ? { ...img, caption } : img))
  }

  const atLimit = max > 0 && images.length >= max

  return (
    <>
      <PageHead
        eyebrow="Personalização"
        title="Galeria"
        sub={max > 0 ? `${images.length}/${max} fotos` : 'Seu plano não inclui galeria de fotos.'}
      />

      {event?.id && max > 0 && (
        <div
          onDragOver={e => { e.preventDefault(); setIsDragging(true) }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={e => {
            e.preventDefault()
            setIsDragging(false)
            handleFiles(e.dataTransfer.files)
          }}
          className={cn(
            'mb-5 w-full py-8 rounded-[10px] border-[1.5px] border-dashed cursor-pointer text-[13px] text-slate-500 flex flex-col items-center gap-1.5 transition-colors',
            isDragging ? 'border-indigo-400 bg-indigo-50/40' : 'border-slate-200 bg-slate-50',
            atLimit && 'opacity-50 pointer-events-none',
          )}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            className="hidden"
            onChange={e => { handleFiles(e.target.files); e.target.value = '' }}
          />
          <Icon.Camera style={{ width: 24, height: 24, color: '#94A3B8' }} />
          <span>{uploading ? 'Enviando…' : atLimit ? 'Limite de fotos atingido' : 'Arraste fotos aqui ou clique para escolher'}</span>
          <span className="text-[11px] text-slate-400">JPG, PNG ou WebP · até 5 MB cada</span>
        </div>
      )}

      {error && (
        <div className="mb-4 px-3 py-2.5 rounded-lg bg-red-50 border border-red-200/60 text-red-700 text-[13px]">{error}</div>
      )}

      {loading && (
        <div className="flex items-center justify-center py-16 text-slate-500 text-[14px]">Carregando…</div>
      )}

      {!loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 nav:grid-cols-3 gap-4">
          {images.map(img => (
            <GalleryCard key={img.id} image={img} onDelete={handleDelete} onCaptionSaved={handleCaptionSaved} />
          ))}
          {images.length === 0 && (
            <div className="col-span-full text-center py-[60px] text-slate-500 text-[14px]">
              <div className="mb-4">
                <span className="w-[52px] h-[52px] rounded-[14px] bg-violet-100 text-indigo-500 inline-flex items-center justify-center">
                  <Icon.Camera style={{ width: 22, height: 22 }} />
                </span>
              </div>
              <div className="font-display font-semibold text-[16px] text-slate-900 mb-1.5">Nenhuma foto ainda</div>
              <div className="max-w-[340px] mx-auto">
                Adicione fotos para deixar a página do seu evento mais especial.
              </div>
            </div>
          )}
        </div>
      )}
    </>
  )
}
