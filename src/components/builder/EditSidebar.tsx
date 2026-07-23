import { EventEditor, type EventEditorProps } from '../shared/EventEditor'

export type Props = EventEditorProps

// Wrapper de compatibilidade: a logica de edicao vive em EventEditor
// (compartilhada com o Dashboard). Mantido para nao quebrar o call site
// existente em BuilderPage.tsx.
export function EditSidebar(props: EventEditorProps) {
  return <EventEditor {...props} />
}
