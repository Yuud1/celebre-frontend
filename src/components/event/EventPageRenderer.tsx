import type { CSSProperties } from 'react'
import type { EventContent, EventTheme, EventTypeId, GiftItem, LayoutId } from '../../types/event'
import type { EditableField } from '../../types/editor'
import { giftFieldId } from '../../types/editor'
import { EditableSpot } from '../builder/EditableSpot'
import { formatCurrency, formatDate, formatShortDate } from '../../lib/format'
import { getFeaturedGifts, getGridGifts } from '../../lib/gifts'
import { SectionAddButton } from './SectionAddButton'
import './event-page.css'

interface Props {
  eventType: EventTypeId | null
  layout: LayoutId
  theme: EventTheme
  content: EventContent
  preview?: boolean
  editable?: boolean
  activeField?: EditableField | null
  onEditField?: (field: EditableField) => void
  onAddGift?: (type: 'fixed' | 'contribution', placement: 'featured' | 'grid') => void
}

const layoutCopy: Record<LayoutId, {
  eyebrow: string
  promise: string
  featuredLabel: string
  giftTitle: string
  noteTitle: string
  footer: string
}> = {
  wedding: {
    eyebrow: 'Lista de casamento',
    promise: 'Presentes, cotas e memorias para o primeiro capitulo da casa nova.',
    featuredLabel: 'Cota especial',
    giftTitle: 'Presentes escolhidos pelo casal',
    noteTitle: 'Uma palavra dos noivos',
    footer: 'Obrigado por fazer parte desse comeco.',
  },
  baby: {
    eyebrow: 'Cha de bebe',
    promise: 'Enxoval, quarto e recados guardados para quando esse bebe crescer.',
    featuredLabel: 'Projeto do quarto',
    giftTitle: 'Para receber com carinho',
    noteTitle: 'Uma carta para esse momento',
    footer: 'Cada gesto vira memoria para a familia.',
  },
  reveal: {
    eyebrow: 'Cha revelacao',
    promise: 'Uma pagina para celebrar a surpresa e organizar os primeiros presentes.',
    featuredLabel: 'Primeiros cuidados',
    giftTitle: 'Antes da grande descoberta',
    noteTitle: 'O amor antes do nome',
    footer: 'Quando a surpresa vier, todo mundo ja estava aqui.',
  },
  home: {
    eyebrow: 'Cha de panela',
    promise: 'Itens essenciais e vaquinhas para transformar endereco em lar.',
    featuredLabel: 'Cota da casa',
    giftTitle: 'Para abrir a casa',
    noteTitle: 'Uma casa feita de gente',
    footer: 'O primeiro lar tambem e feito por quem chega junto.',
  },
}

function progressFor(gift: GiftItem, index: number) {
  if (gift.type !== 'contribution') return 100
  const base = [42, 28, 56, 34, 49][index % 5]
  return Math.min(base, 92)
}

function giftAction(gift: GiftItem) {
  return gift.type === 'fixed' ? 'Presentear' : 'Contribuir'
}

export function EventPageRenderer({
  eventType,
  layout,
  theme,
  content,
  preview,
  editable,
  activeField,
  onEditField,
  onAddGift,
}: Props) {
  const copy = layoutCopy[layout]
  const featuredGifts = getFeaturedGifts(content.gifts)
  const gridGifts = getGridGifts(content.gifts)
  const style = {
    '--theme-primary': theme.primary,
    '--theme-secondary': theme.secondary,
    '--theme-background': theme.background,
    '--theme-accent': theme.accent,
    '--theme-ink': theme.ink,
    '--theme-font-scale': theme.fontScale,
  } as CSSProperties

  const spot = (field: EditableField, node: React.ReactNode, as: 'inline' | 'block' = 'inline') => (
    <EditableSpot
      field={field}
      editable={editable}
      active={activeField === field}
      onSelect={onEditField}
      as={as}
    >
      {node}
    </EditableSpot>
  )

  return (
    <div className={`event-page event-page--${layout}${editable ? ' event-page--editable' : ''}`} style={style}>
      {!preview ? (
        <nav className="ep-nav">
          <span className="ep-brand">celebre</span>
          <span>{formatShortDate(content.eventDate) || copy.eyebrow}</span>
          <button type="button" className="ep-link-btn">Compartilhar</button>
        </nav>
      ) : null}

      <header className="ep-hero">
        <div className="ep-hero__copy">
          <span className="ep-kicker">{copy.eyebrow}</span>
          {editable ? (
            <EditableSpot field="name" editable active={activeField === 'name'} onSelect={onEditField} as="block">
              <h1>{content.name || 'Seu evento'}</h1>
            </EditableSpot>
          ) : (
            <h1>{content.name || 'Seu evento'}</h1>
          )}
          <p className="ep-hero__promise">{copy.promise}</p>
          <div className="ep-hero__meta">
            {spot('hosts', <span>{content.hosts || 'Anfitrioes'}</span>)}
            {spot('location', <span>{content.location || 'Local a definir'}</span>)}
            {spot('eventDate', <span>{formatDate(content.eventDate) || 'Data a definir'}</span>)}
          </div>
          <div className="ep-hero__actions">
            <button type="button" className="ep-btn">{preview ? 'Ver checkout' : 'Contribuir agora'}</button>
            <button type="button" className="ep-btn ep-btn--soft">Ver presentes</button>
          </div>
        </div>

        <EditableSpot
          field="coverUrl"
          editable={editable}
          active={activeField === 'coverUrl'}
          onSelect={onEditField}
          as="block"
          className="ep-hero__visual-wrap"
        >
          <div className="ep-hero__visual">
            {content.coverUrl ? (
              <img src={content.coverUrl} alt="" className="ep-hero__image" />
            ) : (
              <div className="ep-art" aria-hidden="true">
                <div className="ep-art__card">
                  <span>{eventType ? copy.eyebrow : 'Celebre'}</span>
                  <strong>{content.subtitle || content.name || 'Pagina personalizada'}</strong>
                </div>
              </div>
            )}
            {editable ? <span className="ep-cover-hint">Toque para importar foto</span> : null}
          </div>
        </EditableSpot>
      </header>

      <section className="ep-story">
        <div>
          <span className="ep-kicker">{copy.noteTitle}</span>
          {editable ? (
            <EditableSpot field="message" editable active={activeField === 'message'} onSelect={onEditField} as="block">
              <p>{content.message || 'Conte aqui a historia, o convite e o carinho por tras da celebracao.'}</p>
            </EditableSpot>
          ) : (
            <p>{content.message || 'Conte aqui a historia, o convite e o carinho por tras da celebracao.'}</p>
          )}
          {content.signature || editable
            ? spot('signature', <strong>{content.signature || 'Assinatura'}</strong>, 'block')
            : null}
        </div>
        <aside>
          <span>Evento</span>
          {spot('subtitle', <strong>{content.subtitle || copy.eyebrow}</strong>, 'block')}
          {spot('location', <small>{content.location || 'Local a definir'}</small>, 'block')}
        </aside>
      </section>

      {featuredGifts.length > 0 || (editable && onAddGift) ? (
        <div className="ep-featured-zone">
          {featuredGifts.length > 0 ? (
            <div className="ep-featured-carousel" aria-label={copy.featuredLabel}>
              {featuredGifts.map((featured, featuredIndex) => (
                <section className="ep-featured" key={featured.id}>
                  <div className="ep-featured__media">
                    <span>{copy.featuredLabel}</span>
                  </div>
                  <div className="ep-featured__content">
                    <span className="ep-kicker">{copy.featuredLabel}</span>
                    <h2>
                      {spot(giftFieldId(featured.id), featured.name, 'block')}
                    </h2>
                    <p>{featured.description}</p>
                    <div className="ep-progress-row">
                      <strong>{formatCurrency(Math.round((featured.meta ?? featured.value) * 0.35))}</strong>
                      <span>de {formatCurrency(featured.meta ?? featured.value)}</span>
                    </div>
                    <div className="ep-progress">
                      <div className="ep-progress__fill" style={{ width: `${progressFor(featured, featuredIndex)}%` }} />
                    </div>
                    <button type="button" className="ep-btn">{giftAction(featured)}</button>
                  </div>
                </section>
              ))}
            </div>
          ) : null}
          {editable && onAddGift ? (
            <div className="ep-section-add-wrap">
              <SectionAddButton
                label="Adicionar vaquinha em destaque"
                onClick={() => onAddGift('contribution', 'featured')}
                variant="row"
              />
            </div>
          ) : null}
        </div>
      ) : null}

      <section className="ep-gifts">
        <div className="ep-section-heading">
          <span className="ep-kicker">Lista</span>
          <h2>{copy.giftTitle}</h2>
          <p>Escolha um presente unico ou participe de uma cota coletiva.</p>
        </div>

        <div className="ep-gifts-grid">
          {gridGifts.map((gift, index) => (
            <EditableSpot
              key={gift.id}
              field={giftFieldId(gift.id)}
              editable={editable}
              active={activeField === giftFieldId(gift.id)}
              onSelect={onEditField}
              as="block"
              className="ep-gift-card-wrap"
            >
              <article className="ep-gift-card">
                {gift.imageUrl ? (
                  <img src={gift.imageUrl} alt="" className="ep-gift-card__image" />
                ) : null}
                <div className="ep-gift-card__top">
                  <span>{gift.type === 'fixed' ? 'Presente' : 'Vaquinha'}</span>
                  <strong>{gift.type === 'fixed' ? formatCurrency(gift.value) : formatCurrency(gift.meta ?? gift.value)}</strong>
                </div>
                <h3>{gift.name}</h3>
                {gift.description ? <p>{gift.description}</p> : null}
                {gift.type === 'contribution' ? (
                  <>
                    <div className="ep-progress">
                      <div className="ep-progress__fill" style={{ width: `${progressFor(gift, index)}%` }} />
                    </div>
                    <small>{progressFor(gift, index)}% da meta</small>
                  </>
                ) : null}
                <button type="button" className="ep-btn ep-btn--soft">{giftAction(gift)}</button>
              </article>
            </EditableSpot>
          ))}
          {editable && onAddGift ? (
            <>
              <SectionAddButton label="Adicionar presente" onClick={() => onAddGift('fixed', 'grid')} />
              <SectionAddButton label="Adicionar vaquinha" onClick={() => onAddGift('contribution', 'grid')} />
            </>
          ) : null}
        </div>
      </section>

      <section className="ep-memories">
        <span className="ep-kicker">Mural</span>
        <h2>Recados que ficam</h2>
        <div className="ep-memories__grid">
          <blockquote>
            Que alegria fazer parte desse momento. Que venha uma fase linda.
            <cite>Familia Almeida</cite>
          </blockquote>
          <blockquote>
            Ja deixamos nossa contribuicao e muito amor junto com ela.
            <cite>Beatriz e Pedro</cite>
          </blockquote>
        </div>
      </section>

      <footer className="ep-footer">
        <h2>{copy.footer}</h2>
        <button type="button" className="ep-btn">Contribuir</button>
        {!preview ? (
          <span>pagamentos seguros via Pix e cartao · feito com celebre</span>
        ) : null}
      </footer>
    </div>
  )
}
