import { useEffect, useState } from 'react'
import { Icon } from '../../../auth/AuthIcons'
import { PageHead } from '../../../../pages/DashboardPage'
import { api } from '../../../../lib/api'
import { useAuth } from '../../../../contexts/AuthContext'
import { cn } from '@/lib/utils'

interface EventAdmin {
  id: string
  eventId: string
  email: string
  userId: string | null
  role: string
  accepted: boolean
  createdAt: string
  user: { id: string; name: string; email: string } | null
}

interface DashAdminsProps { event: any | null }

export function DashAdmins({ event }: DashAdminsProps) {
  const { user } = useAuth()
  const [admins, setAdmins] = useState<EventAdmin[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [inviteModal, setInviteModal] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviting, setInviting] = useState(false)
  const [inviteError, setInviteError] = useState('')

  const max = Number(user?.plan?.maxAdmins ?? 1)

  const load = async () => {
    if (!event?.id) return
    setLoading(true)
    try {
      const data = await api.listEventAdmins(event.id)
      setAdmins(data)
    } catch {
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [event?.id])

  const handleInvite = async () => {
    if (!event?.id || !inviteEmail.trim()) return
    setInviting(true)
    setInviteError('')
    try {
      const created = await api.inviteEventAdmin(event.id, inviteEmail.trim())
      setAdmins(prev => [...prev, created])
      setInviteEmail('')
      setInviteModal(false)
    } catch (e: any) {
      setInviteError(e.message ?? 'Erro ao convidar co-anfitrião.')
    } finally {
      setInviting(false)
    }
  }

  const handleRemove = async (adminId: string) => {
    if (!event?.id) return
    if (!window.confirm('Remover este co-anfitrião?')) return
    try {
      await api.removeEventAdmin(event.id, adminId)
      setAdmins(prev => prev.filter(a => a.id !== adminId))
    } catch (e: any) {
      alert(e.message)
    }
  }

  const atLimit = admins.length >= max

  return (
    <>
      <PageHead
        eyebrow="Equipe"
        title="Co-anfitriões"
        sub={`${admins.length}/${max} co-anfitriões`}
        actions={
          <button
            onClick={() => setInviteModal(true)}
            disabled={atLimit}
            className={cn(
              'h-10 px-4 rounded-xl text-white font-semibold text-[13.5px] flex items-center gap-1.5 border-0 transition-all',
              atLimit ? 'opacity-50 cursor-not-allowed bg-indigo-400' : 'cursor-pointer bg-ca-grad hover:brightness-105',
            )}
          >
            <Icon.User style={{ width: 15, height: 15 }} />
            Convidar co-anfitrião
          </button>
        }
      />

      {error && (
        <div className="mb-4 px-3 py-2.5 rounded-lg bg-red-50 border border-red-200/60 text-red-700 text-[13px]">{error}</div>
      )}

      {loading && (
        <div className="flex items-center justify-center py-16 text-slate-500 text-[14px]">Carregando…</div>
      )}

      {!loading && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          {admins.length === 0 && (
            <div className="text-center py-[60px] text-slate-500 text-[14px]">
              <div className="mb-4">
                <span className="w-[52px] h-[52px] rounded-[14px] bg-violet-100 text-indigo-500 inline-flex items-center justify-center mx-auto">
                  <Icon.User style={{ width: 22, height: 22 }} />
                </span>
              </div>
              <div className="font-display font-semibold text-[16px] text-slate-900 mb-1.5">Nenhum co-anfitrião ainda</div>
              <div className="max-w-[340px] mx-auto">
                Convide alguém para ajudar a organizar este evento com você.
              </div>
            </div>
          )}
          {admins.map(admin => (
            <div key={admin.id} className="flex items-center gap-3.5 px-5 py-[13px] border-t first:border-t-0 border-slate-100 hover:bg-slate-50 transition-colors">
              <span className="w-[38px] h-[38px] rounded-full bg-indigo-50 inline-flex items-center justify-center shrink-0">
                <Icon.User style={{ width: 16, height: 16, color: '#6366F1' }} />
              </span>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-[13.5px] text-slate-900 overflow-hidden text-ellipsis whitespace-nowrap">
                  {admin.user?.name ?? admin.email}
                </div>
                <div className="text-[12px] text-slate-500 mt-px overflow-hidden text-ellipsis whitespace-nowrap">
                  {admin.user ? admin.email : 'Ainda não tem conta — convite enviado por e-mail'}
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="text-[11px] font-medium mt-px">
                  {admin.accepted
                    ? <span className="text-emerald-500 font-medium">Aceito</span>
                    : <span className="text-amber-500 font-medium">Pendente</span>}
                </div>
              </div>
              <button
                onClick={() => handleRemove(admin.id)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-red-500 transition hover:bg-red-50 border-0 bg-transparent cursor-pointer shrink-0"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-4 w-4">
                  <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {inviteModal && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-[3px] flex items-end sm:items-center justify-center z-[1000]"
          onClick={() => setInviteModal(false)}
        >
          <div
            className="bg-white w-full sm:w-[400px] sm:max-w-[90vw] sm:rounded-[20px] rounded-t-[24px] p-7 sm:p-8"
            onClick={e => e.stopPropagation()}
          >
            <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto mb-6 sm:hidden" />
            <div className="font-display text-xl font-bold mb-1.5">Convidar co-anfitrião</div>
            <div className="text-[13px] text-slate-500 mb-6">
              A pessoa recebe um e-mail com o convite. Se ainda não tiver conta no Celebre, ela cria uma na hora — sem pagar nada.
            </div>
            <label className="text-[12.5px] text-slate-500 font-medium">E-mail</label>
            <input
              type="email"
              value={inviteEmail}
              onChange={e => setInviteEmail(e.target.value)}
              placeholder="nome@email.com"
              className="block w-full mt-1.5 mb-5 px-3.5 py-3 border border-slate-200 rounded-[10px] text-[15px] focus:outline-none focus:border-indigo-400 text-slate-900"
              autoFocus
            />
            {inviteError && (
              <div className="px-3.5 py-2.5 rounded-[10px] mb-4 text-[13px] bg-red-50 text-red-800">{inviteError}</div>
            )}
            <div className="flex gap-2.5">
              <button
                className="flex-1 h-11 rounded-[10px] border border-slate-200 bg-white text-slate-700 font-semibold text-[13.5px] cursor-pointer hover:bg-slate-50 transition-colors"
                onClick={() => setInviteModal(false)} disabled={inviting}
              >
                Cancelar
              </button>
              <button
                className={cn(
                  'flex-[2] h-11 rounded-[10px] text-white font-semibold text-[13.5px] flex items-center justify-center gap-1.5 border-0 transition-all',
                  inviting || !inviteEmail.trim()
                    ? 'opacity-50 cursor-not-allowed bg-indigo-400'
                    : 'cursor-pointer hover:brightness-105',
                )}
                style={{ background: 'linear-gradient(135deg, #6366F1, #8B5CF6)' }}
                onClick={handleInvite}
                disabled={inviting || !inviteEmail.trim()}
              >
                {inviting ? 'Enviando…' : 'Enviar convite'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
