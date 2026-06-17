import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { EVENT_TYPES, PALETTES } from '../../templates/registry'
import type { BuilderQuestion, BuilderTask } from '../../data/builderChat'
import { WELCOME_ASSISTANT } from '../../data/builderChat'
import type { EventTypeId } from '../../types/event'
import { FONT_OPTIONS } from '../../data/fontOptions'

export type BuilderChatPhase =
  | 'welcome'
  | 'generating-type'
  | 'palette'
  | 'generating-palette'
  | 'font'
  | 'questions'
  | 'ready'

interface BuilderQuestionAnswer {
  question: string
  answer: string
}

interface BuilderChatProps {
  phase: BuilderChatPhase
  eventType: EventTypeId | null
  userPrompt: string
  paletteUserPrompt: string | null
  intro: string
  palettePrompt: string
  readyLine: string
  activeTasks: BuilderTask[]
  completedTaskCount: number
  genReveal: 'thinking' | 'working' | null
  answeredQuestions: BuilderQuestionAnswer[]
  currentQuestion: BuilderQuestion | null
  isFinalizingPreview?: boolean
  selectedPaletteId?: string
  selectedFontFamily?: string
  fontUserPrompt: string | null
  onSelectEventType: (id: EventTypeId) => void
  onSelectPalette: (id: string) => void
  onSelectFont: (fontFamily: string) => void
  onAnswerQuestion: (answer: string) => void
  onRestart: () => void
  disabled?: boolean
}

function TaskIcon({ icon }: { icon: BuilderTask['icon'] }) {
  if (icon === 'image') {
    return (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="9" cy="11" r="1.5" fill="currentColor" />
        <path d="M3 16l5-5 4 4 3-3 6 6" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
    )
  }
  if (icon === 'palette') {
    return (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M12 3c-4.5 0-8 3-8 7.5a6 6 0 0 0 6 6c.8 0 1.5-.7 1.5-1.5 0-.6.4-1 1-1h1.2c2.2 0 4-1.8 4-4 0-4.2-3.2-7-5.7-7z"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <circle cx="8.5" cy="9" r="1" fill="currentColor" />
        <circle cx="12" cy="7.5" r="1" fill="currentColor" />
        <circle cx="15" cy="9.5" r="1" fill="currentColor" />
      </svg>
    )
  }
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M8 6l-4 6 4 6M16 6l4 6-4 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function TaskList({ tasks, completedCount }: { tasks: BuilderTask[]; completedCount: number }) {
  if (!tasks.length) return null
  return (
    <ul className="ai-chat__tasks">
      {tasks.map((task, i) => {
        const done = i < completedCount
        const active = i === completedCount
        return (
          <li
            key={`${task.tag}-${i}`}
            className={'ai-chat__task' + (done ? ' is-done' : '') + (active ? ' is-active' : '')}
          >
            <span className="ai-chat__task-icon">
              <TaskIcon icon={task.icon} />
            </span>
            <span>{task.label}</span>
            <code>{task.tag}</code>
          </li>
        )
      })}
    </ul>
  )
}

function Avatar() {
  const [imageError, setImageError] = useState(false)

  return (
    <div className={'ai-chat__avatar' + (imageError ? ' is-fallback' : '')} aria-hidden="true">
      {!imageError ? (
        <img src="/chatbot.webp" alt="" onError={() => setImageError(true)} />
      ) : (
        <>
          c<span>b</span>
        </>
      )}
    </div>
  )
}

function Thinking({ label = 'pensando...' }: { label?: string }) {
  return (
    <p className="ai-chat__status">
      <span className="ai-chat__pulse" />
      {label}
    </p>
  )
}

export function BuilderChat({
  phase,
  eventType,
  userPrompt,
  paletteUserPrompt,
  intro,
  palettePrompt,
  readyLine,
  activeTasks,
  completedTaskCount,
  genReveal,
  answeredQuestions,
  currentQuestion,
  isFinalizingPreview,
  selectedPaletteId,
  selectedFontFamily,
  fontUserPrompt,
  onSelectEventType,
  onSelectPalette,
  onSelectFont,
  onAnswerQuestion,
  onRestart,
  disabled,
}: BuilderChatProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [draftAnswer, setDraftAnswer] = useState('')
  const pastWelcome = phase !== 'welcome'
  const typeGenerating = phase === 'generating-type'
  const typeDone = pastWelcome && !typeGenerating
  const paletteGenerating = phase === 'generating-palette'
  const choosingFont = phase === 'font' && !disabled
  const isReadyPhase = phase === 'ready' && !isFinalizingPreview
  const askingQuestions = phase === 'questions'
  const showPaletteGrid = phase === 'palette' && !disabled
  const selectedPalette = selectedPaletteId
    ? PALETTES.find((p) => p.id === selectedPaletteId)
    : null

  useEffect(() => {
    setDraftAnswer('')
  }, [currentQuestion?.id])

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
  }, [phase, genReveal, completedTaskCount, paletteUserPrompt, fontUserPrompt, answeredQuestions, currentQuestion])

  function submitAnswer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const trimmed = draftAnswer.trim()
    if (!trimmed) return
    onAnswerQuestion(trimmed)
  }

  return (
    <aside className="ai-chat">
      <div className="ai-chat__top">
        <span className="ai-chat__top-label">Assistente</span>
        <button
          type="button"
          className="ai-chat__restart"
          onClick={onRestart}
          disabled={disabled}
        >
          Recomeçar
        </button>
      </div>
      <div className="ai-chat__scroll" ref={scrollRef}>
        <div className="ai-chat__message">
          <Avatar />
          <div className="ai-chat__body">
            <strong className="ai-chat__name">Celebre</strong>
            <p>{WELCOME_ASSISTANT}</p>
            {phase === 'welcome' ? (
              <div className="ai-chat__event-grid">
                {EVENT_TYPES.map((et) => (
                  <button
                    key={et.id}
                    type="button"
                    className="ai-chat__event-btn"
                    disabled={disabled}
                    onClick={() => onSelectEventType(et.id as EventTypeId)}
                  >
                    <strong>{et.label}</strong>
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        </div>

        {pastWelcome && eventType ? (
          <>
            <div className="ai-chat__bubble ai-chat__bubble--user">
              <p>{userPrompt}</p>
            </div>

            <div className="ai-chat__message">
              <Avatar />
              <div className="ai-chat__body">
                <strong className="ai-chat__name">Celebre</strong>
                {typeGenerating && genReveal === 'thinking' ? (
                  <Thinking />
                ) : (
                  <>
                    <p>{intro}</p>
                    {typeGenerating && genReveal === 'working' ? (
                      <>
                        <TaskList tasks={activeTasks} completedCount={completedTaskCount} />
                        <Thinking />
                      </>
                    ) : null}
                  </>
                )}
              </div>
            </div>
          </>
        ) : null}

        {typeDone ? (
          <div className="ai-chat__message ai-chat__message--follow">
            <Avatar />
            <div className="ai-chat__body">
              <strong className="ai-chat__name">Celebre</strong>
              <p>{palettePrompt}</p>
              {showPaletteGrid ? (
                <div className="ai-chat__palette-grid">
                  {PALETTES.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      className={'ai-chat__palette-btn' + (selectedPaletteId === p.id ? ' is-selected' : '')}
                      disabled={disabled}
                      onClick={() => onSelectPalette(p.id)}
                    >
                      <span className="ai-chat__swatches">
                        <i style={{ background: p.primary }} />
                        <i style={{ background: p.accent }} />
                        <i style={{ background: p.background }} />
                      </span>
                      <span>{p.name}</span>
                    </button>
                  ))}
                </div>
              ) : selectedPalette ? (
                <div className="ai-chat__palette-chosen">
                  <div className="ai-chat__palette-btn is-selected is-locked" aria-label={`Paleta ${selectedPalette.name}`}>
                    <span className="ai-chat__swatches">
                      <i style={{ background: selectedPalette.primary }} />
                      <i style={{ background: selectedPalette.accent }} />
                      <i style={{ background: selectedPalette.background }} />
                    </span>
                    <span>{selectedPalette.name}</span>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        ) : null}

        {paletteUserPrompt ? (
          <div className="ai-chat__bubble ai-chat__bubble--user">
            <p>{paletteUserPrompt}</p>
          </div>
        ) : null}

        {choosingFont ? (
          <div className="ai-chat__message ai-chat__message--follow">
            <Avatar />
            <div className="ai-chat__body">
              <strong className="ai-chat__name">Celebre</strong>
              <p>Agora escolha a tipografia da página:</p>
              <div className="ai-chat__palette-grid">
                {FONT_OPTIONS.map((font) => (
                  <button
                    key={font.label}
                    type="button"
                    className={'ai-chat__palette-btn' + ((selectedFontFamily ?? '') === font.value ? ' is-selected' : '')}
                    disabled={disabled}
                    onClick={() => onSelectFont(font.value)}
                    style={{ fontFamily: font.value || "Inter, system-ui, -apple-system, 'Segoe UI', sans-serif" }}
                  >
                    <span>{font.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : null}

        {fontUserPrompt ? (
          <div className="ai-chat__bubble ai-chat__bubble--user">
            <p>{fontUserPrompt}</p>
          </div>
        ) : null}

        {isFinalizingPreview ? (
          <div className="ai-chat__message ai-chat__message--follow">
            <Avatar />
            <div className="ai-chat__body">
              <strong className="ai-chat__name">Celebre</strong>
              <p>Perfeito. Fazendo os ajustes finais para abrir a preview…</p>
              <Thinking label="fazendo..." />
            </div>
          </div>
        ) : null}

        {paletteGenerating || askingQuestions || isReadyPhase ? (
          <div className="ai-chat__message ai-chat__message--follow">
            <Avatar />
            <div className="ai-chat__body">
              <strong className="ai-chat__name">Celebre</strong>
              {paletteGenerating && genReveal === 'thinking' ? (
                <Thinking label="aplicando cores..." />
              ) : (
                <>
                  {paletteGenerating && genReveal === 'working' ? (
                    <>
                      <TaskList tasks={activeTasks} completedCount={completedTaskCount} />
                      <Thinking label="finalizando..." />
                    </>
                  ) : null}
                  {askingQuestions ? (
                    <p>
                      Perfeito. Agora vou fazer algumas perguntas rápidas para personalizar a página.
                    </p>
                  ) : null}
                  {isReadyPhase ? (
                    <>
                      <p>{readyLine}</p>
                      <span className="ai-chat__time">agora mesmo</span>
                    </>
                  ) : null}
                </>
              )}
            </div>
          </div>
        ) : null}

        {answeredQuestions.map((item) => (
          <div className="ai-chat__qa" key={`${item.question}-${item.answer}`}>
            <div className="ai-chat__message ai-chat__message--follow">
              <Avatar />
              <div className="ai-chat__body">
                <strong className="ai-chat__name">Celebre</strong>
                <p>{item.question}</p>
              </div>
            </div>
            <div className="ai-chat__bubble ai-chat__bubble--user">
              <p>{item.answer}</p>
            </div>
          </div>
        ))}

        {askingQuestions && currentQuestion ? (
          <div className="ai-chat__message ai-chat__message--follow">
            <Avatar />
            <div className="ai-chat__body">
              <strong className="ai-chat__name">Celebre</strong>
              <p>{currentQuestion.prompt}</p>
              <form className="ai-chat__question-form" onSubmit={submitAnswer}>
                {currentQuestion.inputType === 'textarea' ? (
                  <textarea
                    value={draftAnswer}
                    placeholder={currentQuestion.placeholder}
                    onChange={(event) => setDraftAnswer(event.target.value)}
                    rows={3}
                  />
                ) : (
                  <input
                    type={currentQuestion.inputType ?? 'text'}
                    value={draftAnswer}
                    placeholder={currentQuestion.placeholder}
                    onChange={(event) => setDraftAnswer(event.target.value)}
                    min={currentQuestion.inputType === 'number' ? 1 : undefined}
                  />
                )}
                <button type="submit" className="home-btn home-btn--grad ai-chat__submit" disabled={!draftAnswer.trim()}>
                  Responder
                </button>
              </form>
            </div>
          </div>
        ) : null}
      </div>
    </aside>
  )
}
