import { useState } from 'react'

export interface GalleryImage {
  id: string
  url: string
  caption: string | null
}

interface Props {
  images: GalleryImage[]
}

export function GallerySection({ images }: Props) {
  const [active, setActive] = useState<GalleryImage | null>(null)

  if (!images.length) return null

  return (
    <section className="ep-section ep-gallery">
      <span className="ep-kicker">Galeria</span>
      <h2>Momentos para guardar</h2>
      <div className="ep-gallery__grid">
        {images.map((img) => (
          <button
            key={img.id}
            type="button"
            className="ep-gallery__item"
            onClick={() => setActive(img)}
          >
            <img src={img.url} alt={img.caption ?? ''} loading="lazy" />
          </button>
        ))}
      </div>

      {active ? (
        <div className="ep-gallery__lightbox" onClick={() => setActive(null)}>
          <button
            type="button"
            className="ep-gallery__lightbox-close"
            onClick={() => setActive(null)}
            aria-label="Fechar"
          >
            ×
          </button>
          <figure onClick={(e) => e.stopPropagation()}>
            <img src={active.url} alt={active.caption ?? ''} />
            {active.caption ? <figcaption>{active.caption}</figcaption> : null}
          </figure>
        </div>
      ) : null}
    </section>
  )
}
