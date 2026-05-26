import { useState, useCallback, useEffect, useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { BuilderChat } from '../components/builder/BuilderChat'
import { BuilderMobileTabs } from '../components/builder/BuilderMobileTabs'
import { CanvasIdle } from '../components/builder/CanvasIdle'
import { EditSidebar } from '../components/builder/EditSidebar'
import { EditSheet } from '../components/builder/EditSheet'
import { EventPageRenderer } from '../components/event/EventPageRenderer'
import { useBuilderState } from '../hooks/useBuilderState'
import { useMediaQuery } from '../hooks/useMediaQuery'
import { getBuilderChatCopy, getBuilderQuestions } from '../data/builderChat'
import {
  getDefaultTemplateByEventType,
  getTemplateById,
  PALETTES,
  toDraftPayload,
} from '../templates/registry'
import type { EventTypeId } from '../types/event'
import type { EditableField } from '../types/editor'
import { giftFieldId } from '../types/editor'
import { useBuilderPublishHeader } from '../contexts/BuilderPublishContext'
import { api } from '../lib/api'

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
  const { setPublishState } = useBuilderPublishHeader()
  const [searchParams, setSearchParams] = useSearchParams()
  const isMobile = useMediaQuery('(max-width: 899px)')
  const [previewSize, setPreviewSize] = useState<PreviewSize>('full')
  const [activeField, setActiveField] = useState<EditableField | null>(null)
  const [genMode, setGenMode] = useState<GenMode>(null)
  const [genReveal, setGenReveal] = useState<'thinking' | 'working' | null>(null)
  const [completedTaskCount, setCompletedTaskCount] = useState(0)
  const [paletteUserPrompt, setPaletteUserPrompt] = useState<string | null>(null)
  const [questionIndex, setQuestionIndex] = useState(0)
  const [answeredQuestions, setAnsweredQuestions] = useState<QuestionAnswer[]>([])
  const [personalizationDone, setPersonalizationDone] = useState(false)
  const [mobilePanel, setMobilePanel] = useState<MobilePanel>('chat')

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
    if (!personalizationDone && questions.length > 0) return 'questions' as const
    return 'ready' as const
  }, [genMode, personalizationDone, questions.length, state.step])

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
    setQuestionIndex(0)
    setAnsweredQuestions([])
    setPersonalizationDone(false)
    setActiveField(null)
    setMobilePanel('chat')
    const next = new URLSearchParams(searchParams)
    next.delete('reset')
    setSearchParams(next, { replace: true })
  }, [searchParams, setSearchParams])

  function handleRestart() {
    reset()
    setGenMode(null)
    setGenReveal(null)
    setCompletedTaskCount(0)
    setPaletteUserPrompt(null)
    setQuestionIndex(0)
    setAnsweredQuestions([])
    setPersonalizationDone(false)
    setActiveField(null)
    setMobilePanel('chat')
  }

  const showPreview = phase === 'ready' && state.theme && template && state.eventType
  const hideChatOnDesktop = !isMobile && !!showPreview
  const showStuckState =
    state.step === 2 && (!state.theme || !template || !state.eventType)
  const isGenerating = genMode !== null

  const canvasMessage = showPreview
    ? isMobile
      ? 'Sua pagina esta pronta. Abra a aba Preview para revisar.'
      : 'Sua pagina esta pronta ao lado.'
    : phase === 'welcome'
      ? isMobile
        ? 'Escolha o tipo de celebracao na aba Chat.'
        : 'Escolha o tipo de celebracao no chat ao lado.'
      : isMobile
        ? 'Acompanhe a criacao na aba Chat.'
        : 'Acompanhe a criacao no chat ao lado.'

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

  const handlePublish = useCallback(async () => {
    if (!state.eventType || !state.templateId || !state.theme) return

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
  }, [navigate, setDraftId, state.content, state.draftId, state.eventType, state.templateId, state.theme])

  useEffect(() => {
    setPublishState({
      canPublish: !!showPreview,
      publish: showPreview ? handlePublish : null,
    })
    return () => setPublishState({ canPublish: false, publish: null })
  }, [handlePublish, setPublishState, showPreview])

  function handleSelectEventType(eventType: EventTypeId) {
    if (genMode) return
    selectEventType(eventType)
    setQuestionIndex(0)
    setAnsweredQuestions([])
    setPersonalizationDone(false)
    setPaletteUserPrompt(null)
    sessionStorage.setItem(
      'celebre-template-preview',
      getDefaultTemplateByEventType(eventType).id,
    )
    setGenMode('type')
  }

  function handleSelectPalette(paletteId: string) {
    if (genMode) return
    const palette = PALETTES.find((p) => p.id === paletteId)
    setPaletteUserPrompt(`Quero usar a paleta ${palette?.name ?? paletteId}.`)
    setQuestionIndex(0)
    setAnsweredQuestions([])
    setPersonalizationDone(false)
    selectPalette(paletteId)
    setGenMode('palette')
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
      if (isMobile) setMobilePanel('preview')
      return
    }

    setQuestionIndex(nextIndex)
  }

  const handleEditField = useCallback(
    (field: EditableField) => {
      if (isMobile) setActiveField(field)
    },
    [isMobile],
  )

  function handleAddGiftMobile(
    type: 'fixed' | 'contribution',
    placement: 'featured' | 'grid' = 'grid',
  ) {
    const id = addGift(type, { featured: placement === 'featured' })
    if (isMobile) setActiveField(giftFieldId(id))
  }

  return (
    <div
      className={
        'ai-builder' +
        (showPreview && !isMobile ? ' ai-builder--fit ai-builder--chat-hidden' : '') +
        (isMobile ? ' ai-builder--mobile ai-builder--panel-' + mobilePanel : '')
      }
    >
      {showStuckState ? (
        <div className="wizard-empty">
          <p>O rascunho salvo no navegador ficou incompleto. Comece de novo para continuar.</p>
          <button type="button" className="btn btn-primary" onClick={reset}>
            Comecar do zero
          </button>
        </div>
      ) : (
        <>
          {!hideChatOnDesktop ? (
            <BuilderChat
              phase={phase}
              eventType={state.eventType}
              userPrompt={chatCopy.userPrompt}
              paletteUserPrompt={paletteUserPrompt}
              intro={chatCopy.intro}
              palettePrompt={chatCopy.palettePrompt}
              readyLine={chatCopy.readyLine}
              activeTasks={activeTasks}
              completedTaskCount={completedTaskCount}
              genReveal={genReveal}
              answeredQuestions={answeredQuestions}
              currentQuestion={currentQuestion}
              selectedPaletteId={state.theme?.paletteId}
              onSelectEventType={handleSelectEventType}
              onSelectPalette={handleSelectPalette}
              onAnswerQuestion={handleAnswerQuestion}
              onRestart={handleRestart}
              disabled={isGenerating}
            />
          ) : null}

          <section className="ai-canvas" aria-label="Preview da pagina">
            {!showPreview ? <CanvasIdle message={canvasMessage} /> : null}

            {showPreview ? (
              <div className="ai-builder-preview">
                <div className="preview-layout">
                  {!isMobile ? (
                    <EditSidebar
                      content={state.content}
                      onContent={updateContent}
                      onGift={updateGift}
                      onAddGift={addGift}
                      onRemoveGift={removeGift}
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
                        eventType={state.eventType!}
                        layout={template!.layout}
                        theme={state.theme!}
                        content={state.content}
                        preview
                        editable={isMobile}
                        activeField={activeField}
                        onEditField={handleEditField}
                        onAddGift={isMobile ? handleAddGiftMobile : undefined}
                      />
                    </div>
                  </div>
                </div>

                {isMobile ? (
                  <EditSheet
                    open={activeField !== null}
                    field={activeField}
                    content={state.content}
                    theme={state.theme!}
                    onClose={() => setActiveField(null)}
                    onContent={updateContent}
                    onTheme={updateTheme}
                    onGift={updateGift}
                    onAddGift={addGift}
                    onRemoveGift={(id) => {
                      removeGift(id)
                      setActiveField(null)
                    }}
                  />
                ) : null}

              </div>
            ) : null}
          </section>

          {isMobile ? (
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
