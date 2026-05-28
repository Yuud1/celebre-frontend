import { useId, useRef, useState } from 'react'
import { readImageFile } from '../../lib/image'

interface Props {
  label: string
  value: string
  onChange: (url: string) => void
  hint?: string
  uploadFn?: (file: File) => Promise<{ url: string }>
}

export function ImagePicker({ label, value, onChange, hint, uploadFn }: Props) {
  const inputId = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleFile(file: File | null) {
    if (!file) return
    setLoading(true)
    setError(null)
    try {
      if (uploadFn) {
        const { url } = await uploadFn(file)
        onChange(url)
      } else {
        const dataUrl = await readImageFile(file)
        onChange(dataUrl)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao importar imagem.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="image-picker">
      <span className="image-picker__label">{label}</span>
      {hint ? <p className="image-picker__hint">{hint}</p> : null}

      {value ? (
        <div className="image-picker__preview">
          <img src={value} alt="" />
          <div className="image-picker__actions">
            <button type="button" className="btn btn-secondary" onClick={() => inputRef.current?.click()} disabled={loading}>
              Trocar foto
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => onChange('')} disabled={loading}>
              Remover
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          className="image-picker__drop"
          onClick={() => inputRef.current?.click()}
          disabled={loading}
        >
          <strong>{loading ? 'Importando...' : 'Escolher da galeria'}</strong>
          <span>JPG, PNG ou WebP · ate 5 MB</span>
        </button>
      )}

      <input
        id={inputId}
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="image-picker__input"
        onChange={(e) => {
          void handleFile(e.target.files?.[0] ?? null)
          e.target.value = ''
        }}
      />

      {error ? <p className="image-picker__error">{error}</p> : null}
    </div>
  )
}
