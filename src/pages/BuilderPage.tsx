import { useState, useCallback, useEffect, useMemo, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { BuilderChat } from '../components/builder/BuilderChat'
import { BuilderMobileTabs } from '../components/builder/BuilderMobileTabs'
import { CanvasIdle } from '../components/builder/CanvasIdle'
import { EditSidebar } from '../components/builder/EditSidebar'
import { EditSheet } from '../components/builder/EditSheet'
import { EventPageRenderer } from '../components/event/EventPageRenderer'
import { useBuilderState } from '../hooks/useBuilderState'
import { useMediaQuery } from '../hooks/useMediaQuery'
import { useAutoSave } from '../hooks/useAutoSave'
import { getBuilderChatCopy, getBuilderQuestions } from '../data/builderChat'
import { FONT_OPTIONS } from '../data/fontOptions'
import {
  createDefaultContent,
  createThemeFromPalette,
  getDefaultTemplateByEventType,
  getTemplateById,
  toDraftPayload,
} from '../templates/registry'
import type { EventContent, EventTheme, EventTypeId } from '../types/event'
import type { EditableField } from '../types/editor'
import { giftFieldId } from '../types/editor'
import { useBuilderPublishHeader } from '../contexts/BuilderPublishContext'
import { useAuth } from '../contexts/AuthContext'
import { usePaletteCatalog, FALLBACK_PALETTE } from '../contexts/PaletteCatalogContext'
import { api } from '../lib/api'
import { CHECKOUT_PUBLISH_REDIRECT } from '../lib/builderDraft'

type GenMode = null | 'type' | 'palette'
type PreviewSize = 'mobile' | 'tablet' | 'full'
type MobilePanel = 'chat' | 'preview'

function PreviewSizeIcon({ size }: { size: PreviewSize }) {
  if (size === 'mobile') {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="7" y="3" width="10" height="18" rx="2" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="12" cy="17.5" r="0.75" fill="currentColor" />
      </svg>
    )
  }
  if (size === 'tablet') {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="4" y="5" width="16" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="12" cy="16.5" r="0.75" fill="currentColor" />
      </svg>
    )
  }
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="5" width="18" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M9 19h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

const previewSizeLabels: Record<PreviewSize, string> = {
  mobile: 'Mobile',
  tablet: 'Tablet',
  full: 'Desktop',
}

interface QuestionAnswer {
  question: string
  answer: string
}

const GEN_DURATION = { type: 3400, palette: 2800 }
const THINK_MS = 900

export function BuilderPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { palettes } = usePaletteCatalog()
  const { setPublishState } = useBuilderPublishHeader()
  const [searchParams, setSearchParams] = useSearchParams()
  const isMobile = useMediaQuery('(max-width: 899px)')
  const [previewSize, setPreviewSize] = useState<PreviewSize>('full')
  const [activeField, setActiveField] = useState<EditableField | null>(null)
  const [genMode, setGenMode] = useState<GenMode>(null)
  const [genReveal, setGenReveal] = useState<'thinking' | 'working' | null>(null)
  const [completedTaskCount, setCompletedTaskCount] = useState(0)
  const [paletteUserPrompt, setPaletteUserPrompt] = useState<string | null>(null)
  const [fontUserPrompt, setFontUserPrompt] = useState<string | null>(null)
  const [fontChosen, setFontChosen] = useState(false)
  const [questionIndex, setQuestionIndex] = useState(0)
  const [answeredQuestions, setAnsweredQuestions] = useState<QuestionAnswer[]>([])
  const [personalizationDone, setPersonalizationDone] = useState(false)
  const [mobilePanel, setMobilePanel] = useState<MobilePanel>('chat')
  const [isFinalizingPreview, setIsFinalizingPreview] = useState(false)
  const finalizeTimerRef = useRef<number | null>(null)

  const eventIdParam = searchParams.get('event')
  const [eventEditLoading, setEventEditLoading] = useState(!!eventIdParam)
  const [eventEdit, setEventEdit] = useState<{
    id: string
    eventType: EventTypeId
    templateId: string
    theme: EventTheme
    content: EventContent
  } | null>(null)
  const isEventEdit = !!eventEdit

  useEffect(() => {
    if (!eventIdParam) return
    let cancelled = false
    api.getEvent(eventIdParam)
      .then((ev: any) => {
        if (cancelled) return
        const d = ev.data ?? {}
        const eventType: EventTypeId = d.eventType
        const template = d.templateId ? getTemplateById(d.templateId) : getDefaultTemplateByEventType(eventType)
        setEventEdit({
          id: ev.id,
          eventType,
          templateId: template?.id ?? getDefaultTemplateByEventType(eventType).id,
          theme: d.theme ?? createThemeFromPalette(FALLBACK_PALETTE.id, [FALLBACK_PALETTE]),
          content: {
            ...createDefaultContent(eventType),
            name: d.name ?? '',
            subtitle: d.subtitle ?? '',
            hosts: d.hosts ?? '',
            eventDate: ev.eventDate ? String(ev.eventDate).slice(0, 10) : '',
            location: d.location ?? '',
            message: d.description ?? '',
            signature: d.signature ?? '',
            coverUrl: ev.coverUrl ?? '',
            gifts: [],
          },
        })
        setEventEditLoading(false)
      })
      .catch(() => {
        if (!cancelled) {
          setEventEditLoading(false)
          navigate('/dashboard', { replace: true })
        }
      })
    return () => { cancelled = true }
  }, [eventIdParam, navigate])

  const {
    state,
    selectEventType,
    selectPalette,
    updateTheme,
    updateContent,
    updateGift,
    addGift,
    removeGift,
    setDraftId,
    reset,
  } = useBuilderState()

  const template = state.templateId ? getTemplateById(state.templateId) : null
  const chatCopy = getBuilderChatCopy(state.eventType)
  const questions = getBuilderQuestions(state.eventType)
  const currentQuestion = !personalizationDone ? questions[questionIndex] ?? null : null

  const phase = useMemo(() => {
    if (genMode === 'type') return 'generating-type' as const
    if (genMode === 'palette') return 'generating-palette' as const
    if (state.step === 0) return 'welcome' as const
    if (state.step === 1) return 'palette' as const
    if (state.step === 2 && state.theme && !fontChosen) return 'font' as const
    if (!personalizationDone && questions.length > 0) return 'questions' as const
    return 'ready' as const
  }, [fontChosen, genMode, personalizationDone, questions.length, state.step, state.theme])

  const activeTasks =
    genMode === 'type'
      ? chatCopy.tasksAfterType
      : genMode === 'palette'
        ? chatCopy.tasksAfterPalette
        : []

  useEffect(() => {
    if (searchParams.get('reset') !== '1') return
    setGenMode(null)
    setGenReveal(null)
    setCompletedTaskCount(0)
    setPaletteUserPrompt(null)
    setFontUserPrompt(null)
    setFontChosen(false)
    setQuestionIndex(0)
    setAnsweredQuestions([])
    setPersonalizationDone(false)
    setActiveField(null)
    setMobilePanel('chat')
    const next = new URLSearchParams(searchParams)
    next.delete('reset')
    setSearchParams(next, { replace: true })
  }, [searchParams, setSearchParams])

  useEffect(() => {
    return () => {
      if (finalizeTimerRef.current) window.clearTimeout(finalizeTimerRef.current)
    }
  }, [])

  function handleRestart() {
    if (finalizeTimerRef.current) {
      window.clearTimeout(finalizeTimerRef.current)
      finalizeTimerRef.current = null
    }
    reset()
    setGenMode(null)
    setGenReveal(null)
    setCompletedTaskCount(0)
    setPaletteUserPrompt(null)
    setFontUserPrompt(null)
    setFontChosen(false)
    setQuestionIndex(0)
    setAnsweredQuestions([])
    setPersonalizationDone(false)
    setIsFinalizingPreview(false)
    setActiveField(null)
    setMobilePanel('chat')
  }

  const activeEventType = isEventEdit ? eventEdit!.eventType : state.eventType
  const activeTemplate = isEventEdit ? getTemplateById(eventEdit!.templateId) ?? template : template
  const activeTheme = isEventEdit ? eventEdit!.theme : state.theme
  const activeContent = isEventEdit ? eventEdit!.content : state.content

  const updateEventEditContent = useCallback((patch: Partial<EventContent>) => {
    setEventEdit((s) => (s ? { ...s, content: { ...s.content, ...patch } } : s))
  }, [])
  const updateEventEditTheme = useCallback((patch: Partial<EventTheme>) => {
    setEventEdit((s) => (s ? { ...s, theme: { ...s.theme, ...patch } } : s))
  }, [])
  const noopGift = useCallback(() => {}, [])
  const noopAddGift = useCallback(() => '', [])

  const activeUpdateContent = isEventEdit ? updateEventEditContent : updateContent
  const activeUpdateTheme = isEventEdit ? updateEventEditTheme : updateTheme

  const showPreview = isEventEdit
    ? !eventEditLoading
    : !!(phase === 'ready' && state.theme && template && state.eventType && !isFinalizingPreview)
  const hideChatOnDesktop = isEventEdit || (!isMobile && !!showPreview)
  const showStuckState =
    !isEventEdit && state.step === 2 && (!state.theme || !template || !state.eventType)
  const isGenerating = genMode !== null

  const canvasMessage = showPreview
    ? isMobile
      ? 'Sua página está pronta. Abra a aba Preview para revisar.'
      : 'Sua página está pronta ao lado.'
    : isFinalizingPreview
      ? isMobile
        ? 'Finalizando sua página...'
        : 'Finalizando sua página para abrir a preview...'
    : phase === 'welcome'
      ? isMobile
        ? 'Escolha o tipo de celebração na aba Chat.'
        : 'Escolha o tipo de celebração no chat ao lado.'
      : isMobile
        ? 'Acompanhe a criação na aba Chat.'
        : 'Acompanhe a criação no chat ao lado.'

  useEffect(() => {
    if (!genMode) return

    setCompletedTaskCount(0)
    setGenReveal('thinking')

    const copy = getBuilderChatCopy(state.eventType)
    const tasks = genMode === 'type' ? copy.tasksAfterType : copy.tasksAfterPalette
    const duration = GEN_DURATION[genMode]
    const stepMs = Math.max(350, Math.floor(duration / (tasks.length + 1)))

    const revealTimer = window.setTimeout(() => setGenReveal('working'), THINK_MS)

    let taskIv = 0
    const taskStartTimer = window.setTimeout(() => {
      let tick = 0
      taskIv = window.setInterval(() => {
        tick += 1
        setCompletedTaskCount(Math.min(tick, tasks.length))
      }, stepMs)
    }, THINK_MS)

    const doneTimer = window.setTimeout(() => {
      if (taskIv) window.clearInterval(taskIv)
      setGenMode(null)
      setGenReveal(null)
      setCompletedTaskCount(0)
    }, THINK_MS + duration)

    return () => {
      window.clearTimeout(revealTimer)
      window.clearTimeout(taskStartTimer)
      window.clearTimeout(doneTimer)
      if (taskIv) window.clearInterval(taskIv)
    }
  }, [genMode, state.eventType])

  // Auto-cria draft assim que o builder chega em ready (usuário logado ou
  // convidado via guestToken em cookie httpOnly — ver CEL-47/48)
  useEffect(() => {
    if (isEventEdit || phase !== 'ready' || state.draftId || !state.eventType || !state.templateId || !state.theme) return
    const payload = toDraftPayload({ eventType: state.eventType, templateId: state.templateId, theme: state.theme, content: state.content })
    api.createDraft(payload).then((d) => setDraftId(d.id)).catch(() => {})
  }, [isEventEdit, phase, state.draftId, state.eventType, state.templateId, state.theme]) // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-save debounced quando conteúdo muda (usuário logado ou convidado)
  useAutoSave(
    () => {
      const payload = toDraftPayload({ eventType: state.eventType!, templateId: state.templateId!, theme: state.theme!, content: state.content })
      return api.updateDraft(state.draftId!, payload)
    },
    [state.content, state.theme, state.draftId],
    { enabled: !isEventEdit && !!state.draftId && phase === 'ready' && !!state.eventType && !!state.templateId && !!state.theme },
  )

  // Auto-save debounced do evento já publicado (modo edição pós-pagamento)
  useAutoSave(
    () => {
      const { theme, content, id } = eventEdit!
      return api.updateEvent(id, {
        data: {
          name: content.name,
          hosts: content.hosts,
          subtitle: content.subtitle,
          description: content.message,
          location: content.location,
          signature: content.signature,
          coverUrl: content.coverUrl,
          theme,
        },
        coverUrl: content.coverUrl,
        eventDate: content.eventDate || null,
      })
    },
    [eventEdit],
    { enabled: isEventEdit && !!eventEdit },
  )

  const handlePublish = useCallback(async () => {
    if (!state.eventType || !state.templateId || !state.theme) return

    if (!user) {
      navigate(`/criar-conta?redirect=${encodeURIComponent(CHECKOUT_PUBLISH_REDIRECT)}`)
      return
    }

    const payload = toDraftPayload({
      eventType: state.eventType,
      templateId: state.templateId,
      theme: state.theme,
      content: state.content,
    })

    try {
      if (state.draftId) {
        await api.updateDraft(state.draftId, payload)
        navigate(`/criar/checkout?draft=${state.draftId}`)
      } else {
        const draft = await api.createDraft(payload)
        setDraftId(draft.id)
        navigate(`/criar/checkout?draft=${draft.id}`)
      }
    } catch (err: any) {
      alert(err.message ?? 'Erro ao salvar rascunho. Verifique sua conexão e tente novamente.')
    }
  }, [navigate, setDraftId, state.content, state.draftId, state.eventType, state.templateId, state.theme, user])

  useEffect(() => {
    if (isEventEdit) {
      setPublishState({
        canPublish: true,
        publish: () => navigate('/dashboard'),
        label: 'Concluir',
      })
      return () => setPublishState({ canPublish: false, publish: null })
    }
    setPublishState({
      canPublish: !!showPreview,
      publish: showPreview ? handlePublish : null,
    })
    return () => setPublishState({ canPublish: false, publish: null })
  }, [handlePublish, setPublishState, showPreview, isEventEdit, navigate])

  function handleSelectEventType(eventType: EventTypeId) {
    if (genMode) return
    selectEventType(eventType)
  }

  function handleSelectPalette(paletteId: string) {
    if (genMode) return
    if (finalizeTimerRef.current) {
      window.clearTimeout(finalizeTimerRef.current)
      finalizeTimerRef.current = null
    }
    const palette = palettes.find((p) => p.id === paletteId)
    setPaletteUserPrompt(`Quero usar a paleta ${palette?.name ?? paletteId}.`)
    setQuestionIndex(0)
    setAnsweredQuestions([])
    setPersonalizationDone(false)
    setIsFinalizingPreview(false)
    setFontChosen(false)
    setFontUserPrompt(null)
    selectPalette(paletteId)
    setGenMode('palette')
  }

  function handleSelectFont(fontFamily: string) {
    const chosen = FONT_OPTIONS.find((f) => f.family === fontFamily)
    updateTheme({ fontFamily: fontFamily || undefined })
    setFontUserPrompt(`Quero usar a tipografia ${chosen?.label ?? 'Padrão do tema'}.`)
    setFontChosen(true)
    if (questions.length === 0) setPersonalizationDone(true)
  }

  function formatDateLabel(value: string) {
    const [year, month, day] = value.split('-')
    if (!year || !month || !day) return value
    return `${day}/${month}/${year}`
  }

  function handleAnswerQuestion(answer: string) {
    if (!state.eventType || !currentQuestion) return

    const cleanAnswer = answer.trim()
    const patch: Parameters<typeof updateContent>[0] = {}

    if (currentQuestion.id === 'name') {
      patch.name = cleanAnswer
      patch.hosts = cleanAnswer
      patch.signature = cleanAnswer
    }

    if (currentQuestion.id === 'date') {
      patch.eventDate = cleanAnswer
      patch.subtitle = formatDateLabel(cleanAnswer)
    }

    if (currentQuestion.id === 'location') {
      patch.location = cleanAnswer
    }

    if (currentQuestion.id === 'message') {
      patch.message = cleanAnswer
    }

    if (currentQuestion.id === 'weeksToBirth') {
      patch.subtitle = `Faltam ${cleanAnswer} semanas para nascer`
    }

    updateContent(patch)
    setAnsweredQuestions((items) => [
      ...items,
      { question: currentQuestion.prompt, answer: cleanAnswer },
    ])

    const nextIndex = questionIndex + 1
    if (nextIndex >= questions.length) {
      setPersonalizationDone(true)
      setQuestionIndex(nextIndex)
      setIsFinalizingPreview(true)
      if (isMobile) setMobilePanel('chat')
      if (finalizeTimerRef.current) window.clearTimeout(finalizeTimerRef.current)
      finalizeTimerRef.current = window.setTimeout(() => {
        if (isMobile) {
          setMobilePanel('preview')
        }
        setIsFinalizingPreview(false)
        finalizeTimerRef.current = null
      }, isMobile ? 850 : 700)
      return
    }

    setQuestionIndex(nextIndex)
  }

  const handleEditField = useCallback(
    (field: EditableField) => {
      setActiveField(field)
    },
    [],
  )

  function handleAddGiftMobile(
    type: 'fixed' | 'contribution',
    placement: 'featured' | 'grid' = 'grid',
  ) {
    const id = addGift(type, { featured: placement === 'featured' })
    if (isMobile) setActiveField(giftFieldId(id))
  }

  useEffect(() => {
    if (isEventEdit) setMobilePanel('preview')
  }, [isEventEdit])

  if (eventIdParam && eventEditLoading) {
    return (
      <div className="ai-builder builder-theme--celebre">
        <CanvasIdle message="Carregando seu evento..." />
      </div>
    )
  }

  return (
    <div
      className={
        'ai-builder builder-theme--celebre' +
        (showPreview && !isMobile ? ' ai-builder--fit ai-builder--chat-hidden' : '') +
        (isMobile ? ' ai-builder--mobile ai-builder--panel-' + mobilePanel : '') +
        (isMobile && activeField ? ' ai-builder--sheet-open' : '')
      }
    >
      {showStuckState ? (
        <div className="builder-empty">
          <p>O rascunho salvo no navegador ficou incompleto. Comece de novo para continuar.</p>
          <button type="button" className="home-btn home-btn--grad" onClick={reset}>
            Comecar do zero
          </button>
        </div>
      ) : (
        <>
          {!hideChatOnDesktop && !isEventEdit ? (
            <BuilderChat
              phase={phase}
              eventType={state.eventType}
              userPrompt={chatCopy.userPrompt}
              paletteUserPrompt={paletteUserPrompt}
              fontUserPrompt={fontUserPrompt}
              intro={chatCopy.intro}
              palettePrompt={chatCopy.palettePrompt}
              readyLine={chatCopy.readyLine}
              activeTasks={activeTasks}
              completedTaskCount={completedTaskCount}
              genReveal={genReveal}
              answeredQuestions={answeredQuestions}
              currentQuestion={currentQuestion}
              isFinalizingPreview={isFinalizingPreview}
              selectedPaletteId={state.theme?.paletteId}
              selectedFontFamily={state.theme?.fontFamily ?? ''}
              onSelectEventType={handleSelectEventType}
              onSelectPalette={handleSelectPalette}
              onSelectFont={handleSelectFont}
              onAnswerQuestion={handleAnswerQuestion}
              onRestart={handleRestart}
              disabled={isGenerating}
            />
          ) : null}

          <section className="ai-canvas" aria-label="Preview da página">
            {!showPreview ? <CanvasIdle message={canvasMessage} /> : null}

            {showPreview ? (
              <div className="ai-builder-preview">
                <div className="preview-layout">
                  {!isMobile ? (
                    <EditSidebar
                      eventType={activeEventType!}
                      content={activeContent}
                      theme={activeTheme!}
                      activeField={activeField}
                      onContent={activeUpdateContent}
                      onTheme={activeUpdateTheme}
                      onGift={isEventEdit ? noopGift : updateGift}
                      onAddGift={isEventEdit ? noopAddGift : addGift}
                      onRemoveGift={isEventEdit ? noopGift : removeGift}
                      hideGifts={isEventEdit}
                    />
                  ) : null}
                  <div className="preview-column">
                    {!isMobile ? (
                      <div className="preview-toolbar">
                        {(['mobile', 'tablet', 'full'] as PreviewSize[]).map((size) => (
                          <button
                            key={size}
                            type="button"
                            className={previewSize === size ? 'is-active' : ''}
                            onClick={() => setPreviewSize(size)}
                            aria-label={previewSizeLabels[size]}
                            title={previewSizeLabels[size]}
                          >
                            <PreviewSizeIcon size={size} />
                          </button>
                        ))}
                      </div>
                    ) : null}
                    <div
                      className={
                        'preview-frame' +
                        (!isMobile && previewSize === 'mobile' ? ' preview-frame--mobile' : '') +
                        (!isMobile && previewSize === 'tablet' ? ' preview-frame--tablet' : '')
                      }
                    >
                      <EventPageRenderer
                        eventType={activeEventType!}
                        layout={activeTemplate!.layout}
                        theme={activeTheme!}
                        content={activeContent}
                        preview
                        editable
                        activeField={activeField}
                        onEditField={handleEditField}
                        onAddGift={isMobile && !isEventEdit ? handleAddGiftMobile : undefined}
                      />
                    </div>
                  </div>
                </div>

                {isMobile ? (
                  <EditSheet
                    open={activeField !== null}
                    field={activeField}
                    content={activeContent}
                    theme={activeTheme!}
                    onClose={() => setActiveField(null)}
                    onContent={activeUpdateContent}
                    onTheme={activeUpdateTheme}
                    onGift={isEventEdit ? noopGift : updateGift}
                    onAddGift={isEventEdit ? noopAddGift : addGift}
                    onRemoveGift={(id) => {
                      if (!isEventEdit) removeGift(id)
                      setActiveField(null)
                    }}
                  />
                ) : null}

              </div>
            ) : null}
          </section>

          {isMobile && !isEventEdit ? (
            <BuilderMobileTabs
              active={mobilePanel}
              onChange={setMobilePanel}
              previewReady={!!showPreview}
            />
          ) : null}
        </>
      )}
    </div>
  )
}
