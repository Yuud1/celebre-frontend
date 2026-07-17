import { useEffect, useMemo, useState } from 'react'
import { Icon } from '../../../auth/AuthIcons'
import { PageHead } from '../../../../pages/DashboardPage'
import { api } from '../../../../lib/api'
import { useAuth } from '../../../../contexts/AuthContext'
import { cn } from '@/lib/utils'

interface Rsvp {
  id: string
  guestName: string
  guestEmail: string
  status: 'pending' | 'confirmed' | 'declined'
  plusOnes: number
  dietaryRestrictions: string | null
  message: string | null
  createdAt: string
}

const statusLabel: Record<Rsvp['status'], string> = {
  pending: 'Pendente',
  confirmed: 'Confirmado',
  declined: 'Recusado',
}

const statusClass: Record<Rsvp['status'], string> = {
  pending: 'bg-amber-50 text-amber-700 border-amber-200/60',
  confirmed: 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
  declined: 'bg-slate-100 text-slate-500 border-slate-200/60',
}

interface DashRsvpProps { event: any | null; onReload: () => void }

export function DashRsvp({ event }: DashRsvpProps) {
  const { user } = useAuth()
  const [rsvps, setRsvps] = useState<Rsvp[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')

  const hasFeature = Boolean(user?.plan?.features?.rsvp)

  const load = async () => {
    if (!event?.id || !hasFeature) { setLoading(false); return }
    setLoading(true)
    try {
      const data = await api.listRsvps(event.id)
      setRsvps(data)
    } catch (e: any) {
      setError(e.message ?? 'Erro ao carregar confirmações.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [event?.id, hasFeature])

  const handleStatusChange = async (rsvpId: string, status: Rsvp['status']) => {
    if (!event?.id) return
    try {
      await api.updateRsvpStatus(event.id, rsvpId, status)
      setRsvps(prev => prev.map(r => r.id === rsvpId ? { ...r, status } : r))
    } catch (e: any) {
      alert(e.message)
    }
  }

  const counts = useMemo(() => ({
    confirmed: rsvps.filter(r => r.status === 'confirmed').length,
    declined: rsvps.filter(r => r.status === 'declined').length,
    pending: rsvps.filter(r => r.status === 'pending').length,
  }), [rsvps])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return rsvps
    return rsvps.filter(r => r.guestName.toLowerCase().includes(q) || r.guestEmail.toLowerCase().includes(q))
  }, [rsvps, search])

  if (!hasFeature) {
    return (
      <>
        <PageHead eyebrow="Convidados" title="Confirmação de presença" sub="Seu plano não inclui RSVP." />
        <div className="text-center py-[60px] text-slate-500 text-[14px]">
          <div className="mb-4">
            <span className="w-[52px] h-[52px] rounded-[14px] bg-violet-100 text-indigo-500 inline-flex items-center justify-center">
              <Icon.Check style={{ width: 22, height: 22 }} />
            </span>
          </div>
          <div className="font-display font-semibold text-[16px] text-slate-900 mb-1.5">RSVP não disponível</div>
          <div className="max-w-[340px] mx-auto">
            Faça upgrade do seu plano para receber confirmações de presença dos convidados.
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <PageHead
        eyebrow="Convidados"
        title="Confirmação de presença"
        sub={`${counts.confirmed} confirmados · ${counts.declined} recusados · ${counts.pending} pendentes`}
      />

      {error && (
        <div className="mb-4 px-3 py-2.5 rounded-lg bg-red-50 border border-red-200/60 text-red-700 text-[13px]">{error}</div>
      )}

      {event?.id && (
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar por nome ou e-mail…"
          className="mb-4 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-[13px] text-slate-900 bg-white focus:outline-none focus:border-indigo-400 box-border"
        />
      )}

      {loading && (
        <div className="flex items-center justify-center py-16 text-slate-500 text-[14px]">Carregando…</div>
      )}

      {!loading && (
        <div className="flex flex-col gap-3">
          {filtered.map(r => (
            <div key={r.id} className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-display font-semibold text-[14px] text-slate-900">{r.guestName}</div>
                  <div className="text-[12px] text-slate-500">{r.guestEmail}</div>
                </div>
                <span className={cn('shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-medium', statusClass[r.status])}>
                  {statusLabel[r.status]}
                </span>
              </div>

              {(r.plusOnes > 0 || r.dietaryRestrictions || r.message) && (
                <div className="mt-2 flex flex-col gap-1 text-[12px] text-slate-500">
                  {r.plusOnes > 0 && <span>+{r.plusOnes} acompanhante(s)</span>}
                  {r.dietaryRestrictions && <span>Restrições: {r.dietaryRestrictions}</span>}
                  {r.message && <span>"{r.message}"</span>}
                </div>
              )}

              <div className="mt-3 flex gap-2">
                {(['confirmed', 'declined', 'pending'] as const).map(status => (
                  <button
                    key={status}
                    onClick={() => handleStatusChange(r.id, status)}
                    disabled={r.status === status}
                    className={cn(
                      'rounded-lg px-2.5 py-1.5 text-[12px] font-medium border transition-colors',
                      r.status === status
                        ? 'border-transparent bg-slate-100 text-slate-400 cursor-default'
                        : 'border-slate-200 text-slate-600 hover:border-indigo-300 hover:text-indigo-600',
                    )}
                  >
                    {statusLabel[status]}
                  </button>
                ))}
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="col-span-full text-center py-[60px] text-slate-500 text-[14px]">
              <div className="font-display font-semibold text-[16px] text-slate-900 mb-1.5">
                {rsvps.length === 0 ? 'Nenhuma confirmação ainda' : 'Nenhum resultado'}
              </div>
              <div className="max-w-[340px] mx-auto">
                {rsvps.length === 0
                  ? 'Assim que convidados responderem, eles aparecem aqui.'
                  : 'Tente buscar por outro nome ou e-mail.'}
              </div>
            </div>
          )}
        </div>
      )}
    </>
  )
}
