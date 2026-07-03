import { useEffect, useMemo, useState } from 'react'
import type { EventContent, EventTheme, EventTypeId, HomeRoomId } from '../../types/event'
import type { EditableField } from '../../types/editor'
import { ImagePicker } from './ImagePicker'
import { api } from '../../lib/api'
import { FONT_OPTIONS } from '../../data/fontOptions'
import { maskCurrencyInput, parseCurrencyToCents } from '../../lib/mask'

interface Props {
  eventType: EventTypeId
  content: EventContent
  theme: EventTheme
  activeField?: EditableField | null
  onContent: (patch: Partial<EventContent>) => void
  onTheme: (patch: Partial<EventTheme>) => void
  onGift: (id: string, patch: Partial<EventContent['gifts'][0]>) => void
  onAddGift: (type: 'fixed' | 'contribution') => void
  onRemoveGift: (id: string) => void
}

type EditTab = 'geral' | 'sections' | 'presentes' | 'aparencia'
type FocusGroup =
  | 'main'
  | 'letter'
  | 'cover'
  | 'coupleStory'
  | 'ceremony'
  | 'pregnancy'
  | 'preReveal'
  | 'revealSchedule'
  | 'homeStats'
  | 'checklist'
  | 'all'

function mapFieldToFocus(field: EditableField | null): { tab: EditTab; group: FocusGroup } | null {
  if (!field) return null
  if (field.startsWith('gift:')) return { tab: 'presentes', group: 'all' }
  if (field === 'appearance') return { tab: 'aparencia', group: 'all' }
  if (field === 'coupleStory') return { tab: 'sections', group: 'coupleStory' }
  if (field === 'ceremony') return { tab: 'sections', group: 'ceremony' }
  if (field === 'message' || field === 'signature') return { tab: 'geral', group: 'letter' }
  if (field === 'coverUrl') return { tab: 'geral', group: 'cover' }
  return { tab: 'geral', group: 'main' }
}

export function EditSidebar({
  eventType,
  content,
  theme,
  activeField,
  onContent,
  onTheme,
  onGift,
  onAddGift,
  onRemoveGift,
}: Props) {
  const [activeTab, setActiveTab] = useState<EditTab>('geral')
  const focus = mapFieldToFocus(activeField ?? null)

  useEffect(() => {
    if (focus) setActiveTab(focus.tab)
  }, [focus])

  const giftsByRoom = useMemo(() => {
    const map: Record<HomeRoomId, number> = {
      cozinha: 0,
      sala: 0,
      quarto: 0,
      banheiro: 0,
      lavanderia: 0,
    }
    for (const gift of content.gifts) {
      if (gift.room) map[gift.room] += 1
    }
    return map
  }, [content.gifts])

  function onSections(patch: NonNullable<EventContent['sections']>) {
    onContent({
      sections: {
        ...content.sections,
        ...patch,
      },
    })
  }

  function onCoupleTimeline(index: number, patch: { year?: string; title?: string; text?: string }) {
    const timeline = [...(content.sections?.coupleStory?.timeline ?? [])]
    const current = timeline[index]
    if (!current) return
    timeline[index] = { ...current, ...patch }
    onSections({
      coupleStory: {
        ...content.sections?.coupleStory,
        timeline,
      },
    })
  }

  function addTimelineItem() {
    const timeline = [...(content.sections?.coupleStory?.timeline ?? [])]
    timeline.push({ year: '2026', title: 'Novo momento', text: 'Conte um capítulo especial.' })
    onSections({
      coupleStory: {
        intro: content.sections?.coupleStory?.intro ?? '',
        timeline,
      },
    })
  }

  function removeTimelineItem(index: number) {
    const timeline = (content.sections?.coupleStory?.timeline ?? []).filter((_, i) => i !== index)
    onSections({
      coupleStory: {
        ...content.sections?.coupleStory,
        timeline,
      },
    })
  }

  function onChecklist(index: number, label: string) {
    const checklist = [...(content.sections?.checklist ?? [])]
    if (!checklist[index]) return
    checklist[index] = { ...checklist[index], label }
    onSections({ checklist })
  }

  function addChecklistItem() {
    const checklist = [...(content.sections?.checklist ?? [])]
    checklist.push({
      id: `check-${Date.now()}`,
      label: 'Novo item da casa',
    })
    onSections({ checklist })
  }

  function removeChecklistItem(index: number) {
    const checklist = (content.sections?.checklist ?? []).filter((_, i) => i !== index)
    onSections({ checklist })
  }

  function setGiftRoom(giftId: string, room: HomeRoomId | '') {
    onGift(giftId, { room: room || undefined })
  }

  function renderGeneral(group: FocusGroup | null) {
    const showMain = !group || group === 'main'
    const showLetter = !group || group === 'letter'
    const showCover = !group || group === 'cover'
    return (
      <>
        {showMain ? (
          <div className="edit-panel__group">
            <h4>Informações principais</h4>
            <label>
              Nome do evento
              <input value={content.name} onChange={(e) => onContent({ name: e.target.value })} />
            </label>
            <label>
              Subtítulo
              <input value={content.subtitle} onChange={(e) => onContent({ subtitle: e.target.value })} />
            </label>
            <label>
              Anfitriões
              <input value={content.hosts} onChange={(e) => onContent({ hosts: e.target.value })} />
            </label>
            <label>
              Data
              <input type="date" value={content.eventDate} onChange={(e) => onContent({ eventDate: e.target.value })} />
            </label>
            <label>
              Local
              <input value={content.location} onChange={(e) => onContent({ location: e.target.value })} />
            </label>
          </div>
        ) : null}

        {showLetter ? (
          <div className="edit-panel__group">
            <h4>Carta / História</h4>
            <label>
              Mensagem principal
              <textarea value={content.message} onChange={(e) => onContent({ message: e.target.value })} />
            </label>
            <label>
              Assinatura
              <input value={content.signature} onChange={(e) => onContent({ signature: e.target.value })} />
            </label>
          </div>
        ) : null}

        {showCover ? (
          <div className="edit-panel__group">
            <h4>Capa</h4>
            <ImagePicker
              label="Foto de capa"
              value={content.coverUrl}
              onChange={(coverUrl) => onContent({ coverUrl })}
              hint="Importe uma foto do seu dispositivo"
              uploadFn={api.uploadDraftImage}
            />
          </div>
        ) : null}
      </>
    )
  }

  function renderEventSections(group: FocusGroup | null) {
    if (eventType === 'casamento') {
      const showCoupleStory = !group || group === 'coupleStory'
      const showCeremony = !group || group === 'ceremony'
      return (
        <>
          {showCoupleStory ? (
            <div className="edit-panel__group">
              <h4>História do casal</h4>
              <label>
                Introdução da timeline
                <textarea
                  value={content.sections?.coupleStory?.intro ?? ''}
                  onChange={(e) =>
                    onSections({
                      coupleStory: {
                        ...content.sections?.coupleStory,
                        intro: e.target.value,
                        timeline: content.sections?.coupleStory?.timeline ?? [],
                      },
                    })}
                />
              </label>

              {(content.sections?.coupleStory?.timeline ?? []).map((item, index) => (
                <div key={`${item.year}-${index}`} className="edit-panel__nested">
                  <div className="edit-panel__nested-head">
                    <strong>Momento {index + 1}</strong>
                    <button type="button" className="btn btn-ghost" onClick={() => removeTimelineItem(index)}>
                      Remover
                    </button>
                  </div>
                  <label>
                    Ano
                    <input value={item.year} onChange={(e) => onCoupleTimeline(index, { year: e.target.value })} />
                  </label>
                  <label>
                    Título
                    <input value={item.title} onChange={(e) => onCoupleTimeline(index, { title: e.target.value })} />
                  </label>
                  <label>
                    Texto
                    <textarea value={item.text} onChange={(e) => onCoupleTimeline(index, { text: e.target.value })} />
                  </label>
                </div>
              ))}
              <button type="button" className="btn btn-secondary edit-panel__add-btn" onClick={addTimelineItem}>
                + Adicionar momento
              </button>
            </div>
          ) : null}

          {showCeremony ? (
            <div className="edit-panel__group">
              <h4>Cerimônia & recepção</h4>
              <label>
                Horário da cerimônia
                <input
                  value={content.sections?.ceremony?.ceremonyTime ?? ''}
                  onChange={(e) =>
                    onSections({
                      ceremony: {
                        ...content.sections?.ceremony,
                        ceremonyTime: e.target.value,
                        ceremonyPlace: content.sections?.ceremony?.ceremonyPlace ?? content.location,
                      },
                    })}
                />
              </label>
              <label>
                Local da cerimônia
                <input
                  value={content.sections?.ceremony?.ceremonyPlace ?? ''}
                  onChange={(e) =>
                    onSections({
                      ceremony: {
                        ...content.sections?.ceremony,
                        ceremonyPlace: e.target.value,
                      },
                    })}
                />
              </label>
              <label>
                Horário da recepção
                <input
                  value={content.sections?.ceremony?.receptionTime ?? ''}
                  onChange={(e) =>
                    onSections({
                      ceremony: {
                        ...content.sections?.ceremony,
                        receptionTime: e.target.value,
                        ceremonyPlace: content.sections?.ceremony?.ceremonyPlace ?? content.location,
                      },
                    })}
                />
              </label>
              <label>
                Local da recepção
                <input
                  value={content.sections?.ceremony?.receptionPlace ?? ''}
                  onChange={(e) =>
                    onSections({
                      ceremony: {
                        ...content.sections?.ceremony,
                        receptionPlace: e.target.value,
                        ceremonyPlace: content.sections?.ceremony?.ceremonyPlace ?? content.location,
                      },
                    })}
                />
              </label>
              <label>
                Traje
                <input
                  value={content.sections?.ceremony?.dressCode ?? ''}
                  onChange={(e) =>
                    onSections({
                      ceremony: {
                        ...content.sections?.ceremony,
                        dressCode: e.target.value,
                        ceremonyPlace: content.sections?.ceremony?.ceremonyPlace ?? content.location,
                      },
                    })}
                />
              </label>
            </div>
          ) : null}
        </>
      )
    }

    if (eventType === 'cha-bebe') {
      const showPregnancy = !group || group === 'pregnancy'
      const showLetter = !group || group === 'letter'
      return (
        <>
          {showPregnancy ? (
            <div className="edit-panel__group">
              <h4>Gestação</h4>
              <label>
                Data prevista do parto
                <input
                  type="date"
                  value={content.sections?.pregnancy?.dueDate ?? ''}
                  onChange={(e) =>
                    onSections({
                      pregnancy: {
                        ...content.sections?.pregnancy,
                        dueDate: e.target.value,
                      },
                    })}
                />
              </label>
              <label>
                Semana atual
                <input
                  type="number"
                  min={1}
                  max={40}
                  value={content.sections?.pregnancy?.currentWeek ?? 32}
                  onChange={(e) =>
                    onSections({
                      pregnancy: {
                        ...content.sections?.pregnancy,
                        currentWeek: Number(e.target.value),
                      },
                    })}
                />
              </label>
            </div>
          ) : null}
          {showLetter ? (
            <div className="edit-panel__group">
              <h4>Texto da carta para o bebê</h4>
              <label>
                Mensagem da seção história
                <textarea value={content.message} onChange={(e) => onContent({ message: e.target.value })} />
              </label>
              <label>
                Assinatura da família
                <input value={content.signature} onChange={(e) => onContent({ signature: e.target.value })} />
              </label>
            </div>
          ) : null}
        </>
      )
    }

    if (eventType === 'cha-revelacao') {
      const showPreReveal = !group || group === 'preReveal'
      const showSchedule = !group || group === 'revealSchedule'
      return (
        <>
          {showPreReveal ? (
            <div className="edit-panel__group">
              <h4>Pré-revelação</h4>
              <label>
                Título/tema
                <input value={content.name} onChange={(e) => onContent({ name: e.target.value })} />
              </label>
              <label>
                Linha de apoio
                <input value={content.subtitle} onChange={(e) => onContent({ subtitle: e.target.value })} />
              </label>
              <label>
                Mensagem antes da revelação
                <textarea value={content.message} onChange={(e) => onContent({ message: e.target.value })} />
              </label>
            </div>
          ) : null}
          {showSchedule ? (
            <div className="edit-panel__group">
              <h4>Cronograma da revelação</h4>
              <label>
                Data da revelação (contador)
                <input type="date" value={content.eventDate} onChange={(e) => onContent({ eventDate: e.target.value })} />
              </label>
              <label>
                Local
                <input value={content.location} onChange={(e) => onContent({ location: e.target.value })} />
              </label>
            </div>
          ) : null}
        </>
      )
    }

    const showHomeStats = !group || group === 'homeStats'
    const showChecklist = !group || group === 'checklist'
    return (
      <>
        {showHomeStats ? (
          <div className="edit-panel__group">
            <h4>Nossa casa em números</h4>
            <label>
              Quantidade de cômodos
              <input
                type="number"
                min={1}
                value={content.sections?.homeStats?.rooms ?? 3}
                onChange={(e) =>
                  onSections({
                    homeStats: {
                      ...content.sections?.homeStats,
                      rooms: Number(e.target.value),
                      city: content.sections?.homeStats?.city ?? '',
                    },
                  })}
              />
            </label>
            <label>
              Cidade
              <input
                value={content.sections?.homeStats?.city ?? ''}
                onChange={(e) =>
                  onSections({
                    homeStats: {
                      ...content.sections?.homeStats,
                      city: e.target.value,
                      rooms: content.sections?.homeStats?.rooms ?? 3,
                    },
                  })}
              />
            </label>
            <label>
              Frase da seção
              <textarea
                value={content.sections?.homeStats?.tagline ?? ''}
                onChange={(e) =>
                  onSections({
                    homeStats: {
                      ...content.sections?.homeStats,
                      tagline: e.target.value,
                      rooms: content.sections?.homeStats?.rooms ?? 3,
                      city: content.sections?.homeStats?.city ?? '',
                    },
                  })}
              />
            </label>
          </div>
        ) : null}

        {showChecklist ? (
          <div className="edit-panel__group">
            <h4>Checklist da casa</h4>
            {(content.sections?.checklist ?? []).map((item, index) => (
              <div key={item.id} className="edit-panel__nested edit-panel__nested--compact">
                <label>
                  Item {index + 1}
                  <input value={item.label} onChange={(e) => onChecklist(index, e.target.value)} />
                </label>
                <button type="button" className="btn btn-ghost" onClick={() => removeChecklistItem(index)}>
                  Remover
                </button>
              </div>
            ))}
            <button type="button" className="btn btn-secondary edit-panel__add-btn" onClick={addChecklistItem}>
              + Adicionar item
            </button>
          </div>
        ) : null}
      </>
    )
  }

  function renderGifts(focusedGiftId: string | null) {
    const visibleGifts = focusedGiftId
      ? content.gifts.filter((gift) => gift.id === focusedGiftId)
      : content.gifts

    return (
      <>
        {!focusedGiftId ? (
          <div className="edit-panel__group">
            <div className="edit-panel__group-head">
              <h4>Presentes</h4>
              <div className="edit-panel__actions-inline">
                <button type="button" className="btn btn-secondary" onClick={() => onAddGift('fixed')}>
                  + Fixo
                </button>
                <button type="button" className="btn btn-secondary" onClick={() => onAddGift('contribution')}>
                  + Vaquinha
                </button>
              </div>
            </div>

            {eventType === 'cha-panela' ? (
              <div className="edit-panel__room-summary">
                <span>Cozinha: {giftsByRoom.cozinha}</span>
                <span>Sala: {giftsByRoom.sala}</span>
                <span>Quarto: {giftsByRoom.quarto}</span>
                <span>Banheiro: {giftsByRoom.banheiro}</span>
                <span>Lavanderia: {giftsByRoom.lavanderia}</span>
              </div>
            ) : null}
          </div>
        ) : null}

        {visibleGifts.map((gift) => (
          <div key={gift.id} className="gift-editor">
            <div className="edit-panel__nested-head">
              <strong>{gift.name || 'Presente'}</strong>
              <button type="button" className="btn btn-ghost" onClick={() => onRemoveGift(gift.id)}>
                Remover
              </button>
            </div>

            <label>
              Tipo
              <select
                value={gift.type}
                onChange={(e) => onGift(gift.id, { type: e.target.value as 'fixed' | 'contribution' })}
              >
                <option value="fixed">Presente fixo</option>
                <option value="contribution">Vaquinha</option>
              </select>
            </label>
            <label>
              Nome
              <input value={gift.name} placeholder="Nome" onChange={(e) => onGift(gift.id, { name: e.target.value })} />
            </label>
            <label>
              Valor (R$)
              <input
                value={maskCurrencyInput(String(gift.value))}
                placeholder="0,00"
                onChange={(e) => onGift(gift.id, { value: parseCurrencyToCents(e.target.value) })}
              />
            </label>
            {gift.type === 'contribution' ? (
              <label>
                Meta (R$)
                <input
                  value={maskCurrencyInput(String(gift.meta ?? gift.value))}
                  placeholder="0,00"
                  onChange={(e) => onGift(gift.id, { meta: parseCurrencyToCents(e.target.value) })}
                />
              </label>
            ) : null}
            {eventType === 'cha-panela' ? (
              <label>
                Cômodo
                <select value={gift.room ?? ''} onChange={(e) => setGiftRoom(gift.id, e.target.value as HomeRoomId | '')}>
                  <option value="">Sem cômodo</option>
                  <option value="cozinha">Cozinha</option>
                  <option value="sala">Sala</option>
                  <option value="quarto">Quarto</option>
                  <option value="banheiro">Banheiro</option>
                  <option value="lavanderia">Lavanderia</option>
                </select>
              </label>
            ) : null}
            <label>
              Descrição
              <input
                value={gift.description ?? ''}
                placeholder="Descrição"
                onChange={(e) => onGift(gift.id, { description: e.target.value })}
              />
            </label>
            <ImagePicker
              label="Foto"
              value={gift.imageUrl ?? ''}
              onChange={(imageUrl) => onGift(gift.id, { imageUrl })}
              uploadFn={api.uploadDraftImage}
            />
          </div>
        ))}

        {focusedGiftId && visibleGifts.length === 0 ? (
          <p className="field-editor__empty">Presente nao encontrado.</p>
        ) : null}
      </>
    )
  }

  function renderAppearance() {
    return (
      <div className="edit-panel__group">
        <h4>Cores e tipografia</h4>
        <label>
          Cor principal
          <input type="color" value={theme.primary} onChange={(e) => onTheme({ primary: e.target.value })} />
        </label>
        <label>
          Cor de destaque
          <input type="color" value={theme.accent} onChange={(e) => onTheme({ accent: e.target.value })} />
        </label>
        <label>
          Fundo
          <input type="color" value={theme.background} onChange={(e) => onTheme({ background: e.target.value })} />
        </label>
        <label>
          Cor do texto
          <input type="color" value={theme.ink} onChange={(e) => onTheme({ ink: e.target.value })} />
        </label>
        <label>
          Tipografia
          <select
            value={theme.fontFamily ?? ''}
            onChange={(e) => onTheme({ fontFamily: e.target.value || undefined })}
          >
            {FONT_OPTIONS.map((font) => (
              <option key={font.label} value={font.value}>
                {font.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          Tamanho do texto ({Math.round(theme.fontScale * 100)}%)
          <input
            type="range"
            min={0.85}
            max={1.2}
            step={0.05}
            value={theme.fontScale}
            onChange={(e) => onTheme({ fontScale: Number(e.target.value) })}
          />
        </label>
      </div>
    )
  }

  return (
    <aside className="edit-panel">
      <div className="edit-panel__tabs" role="tablist" aria-label="Seções do painel">
        <button type="button" role="tab" aria-selected={activeTab === 'geral'} className={activeTab === 'geral' ? 'is-active' : ''} onClick={() => setActiveTab('geral')}>
          Geral
        </button>
        <button type="button" role="tab" aria-selected={activeTab === 'sections'} className={activeTab === 'sections' ? 'is-active' : ''} onClick={() => setActiveTab('sections')}>
          Seções
        </button>
        <button type="button" role="tab" aria-selected={activeTab === 'presentes'} className={activeTab === 'presentes' ? 'is-active' : ''} onClick={() => setActiveTab('presentes')}>
          Presentes
        </button>
        <button type="button" role="tab" aria-selected={activeTab === 'aparencia'} className={activeTab === 'aparencia' ? 'is-active' : ''} onClick={() => setActiveTab('aparencia')}>
          Aparência
        </button>
      </div>

      <div className="edit-panel__body">
        {activeTab === 'geral' ? renderGeneral(focus?.tab === 'geral' ? focus.group : null) : null}
        {activeTab === 'sections' ? renderEventSections(focus?.tab === 'sections' ? focus.group : null) : null}
        {activeTab === 'presentes' ? renderGifts(activeField?.startsWith('gift:') ? activeField.slice(5) : null) : null}
        {activeTab === 'aparencia' ? renderAppearance() : null}
      </div>
    </aside>
  )
}
