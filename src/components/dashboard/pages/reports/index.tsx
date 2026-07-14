import { useEffect, useMemo, useState } from 'react'
import { PageHead } from '@/pages/DashboardPage'
import { api } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'
import { Icon } from '@/components/auth/AuthIcons'
import { Money, StatCard, BarChart, AVATAR_COLORS, fmtDate, nameInitials } from '@/components/dashboard/DashWidgets'
import { DashBtn } from '../../DashBtn'
import { DashBadge } from '../../DashBadge'

interface DashReportsProps { event: any | null }

type ReportData = Awaited<ReturnType<typeof api.getEventReport>>

function buildTimelineBars(timeline: { date: string; total: number }[]) {
  return timeline.map(t => ({
    label: String(new Date(`${t.date}T00:00:00`).getDate()).padStart(2, '0'),
    value: t.total,
  }))
}

function toCsv(report: ReportData) {
  const header = ['Contribuinte', 'Presente', 'Valor', 'Data']
  const rows = report.contributors.map(c => [
    c.name,
    c.giftName,
    (c.amount / 100).toFixed(2),
    new Date(c.createdAt).toLocaleDateString('pt-BR'),
  ])
  return [header, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n')
}

export function DashReports({ event }: DashReportsProps) {
  const { user } = useAuth()
  const [report, setReport] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const hasReports = Boolean(user?.plan?.features?.reports)
  const hasCsvExport = Boolean(user?.plan?.features?.csvExport)

  useEffect(() => {
    if (!event?.id || !hasReports) { setLoading(false); return }
    setLoading(true)
    setError('')
    api.getEventReport(event.id)
      .then(setReport)
      .catch((e: any) => setError(e.message ?? 'Erro ao carregar relatório.'))
      .finally(() => setLoading(false))
  }, [event?.id, hasReports])

  const timelineBars = useMemo(() => report ? buildTimelineBars(report.timeline) : [], [report])

  const handleExportPdf = () => window.print()

  const handleExportCsv = () => {
    if (!report) return
    const blob = new Blob([toCsv(report)], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `relatorio-${event?.slug ?? 'evento'}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (!hasReports) {
    return (
      <>
        <PageHead eyebrow="Análises" title="Relatórios" sub="Recurso disponível a partir do plano Pro." />
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <span className="w-14 h-14 rounded-2xl bg-violet-100 text-indigo-500 inline-flex items-center justify-center mb-4 mx-auto">
            <Icon.BarChart style={{ width: 24, height: 24 }} />
          </span>
          <div className="font-display font-semibold text-[17px] text-slate-900 mb-1.5">Relatórios não incluídos no seu plano</div>
          <p className="text-[14px] text-slate-500 max-w-[380px] mx-auto mb-5">
            Faça upgrade para o plano Pro e acompanhe métricas detalhadas de arrecadação do seu evento.
          </p>
          <DashBtn variant="primary" as="a" href="/#planos">Ver planos</DashBtn>
        </div>
      </>
    )
  }

  return (
    <>
      <PageHead
        eyebrow="Análises"
        title="Relatórios"
        sub="Métricas de arrecadação do seu evento."
        actions={
          <>
            <DashBtn variant="ghost" onClick={handleExportPdf}>
              <Icon.Doc style={{ width: 15, height: 15 }} />
              Exportar PDF
            </DashBtn>
            {hasCsvExport && (
              <DashBtn variant="primary" onClick={handleExportCsv}>
                <Icon.Upload style={{ width: 15, height: 15 }} />
                Exportar CSV
              </DashBtn>
            )}
          </>
        }
      />

      {loading && (
        <div className="flex items-center justify-center py-16 text-slate-500 text-[14px]">Carregando…</div>
      )}

      {error && !loading && (
        <div className="mb-4 px-3 py-2.5 rounded-lg bg-red-50 border border-red-200/60 text-red-700 text-[13px]">{error}</div>
      )}

      {!loading && report && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 nav:grid-cols-4 gap-4">
            <StatCard icon={<Icon.Pix style={{ color: '#10B981' }} />} label="Total bruto" value={report.summary.totalGross} currency />
            <StatCard
              icon={<Icon.Bank style={{ color: '#6366F1' }} />}
              label="Total líquido"
              value={report.summary.totalNet}
              currency
              hint={`Taxa: R$ ${(report.summary.totalFee / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
            />
            <StatCard icon={<Icon.Heart style={{ color: '#EC4899' }} />} label="Contribuições" value={report.summary.count} />
            <StatCard icon={<Icon.Sparkle style={{ color: '#8B5CF6' }} />} label="Ticket médio" value={report.summary.avgTicket} currency />
          </div>

          <div className="grid grid-cols-1 nav:grid-cols-[1.4fr_1fr] gap-4 mt-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <div className="font-display text-[16px] font-semibold text-slate-900 mb-0.5">Arrecadação diária</div>
              <div className="text-[12.5px] text-slate-500 mb-[18px]">Últimos 30 dias</div>
              {timelineBars.some(b => b.value > 0)
                ? <BarChart height={200} data={timelineBars} />
                : <div className="py-10 text-center text-slate-500 text-[13px]">Sem contribuições no período.</div>}
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <div className="font-display text-[16px] font-semibold text-slate-900 mb-4">PIX vs Cartão</div>
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon.Pix style={{ width: 15, height: 15, color: '#10B981' }} />
                    <span className="text-[13.5px] text-slate-700">PIX</span>
                  </div>
                  <div className="text-right">
                    <Money value={report.paymentBreakdown.pix.total} size={15} />
                    <div className="text-[11px] text-slate-400">{report.paymentBreakdown.pix.count} contribuições</div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon.Bank style={{ width: 15, height: 15, color: '#6366F1' }} />
                    <span className="text-[13.5px] text-slate-700">Cartão</span>
                  </div>
                  <div className="text-right">
                    <Money value={report.paymentBreakdown.creditCard.total} size={15} />
                    <div className="text-[11px] text-slate-400">{report.paymentBreakdown.creditCard.count} contribuições</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden mt-4">
            <div className="px-[22px] pt-[18px] pb-3.5">
              <div className="font-display text-[16px] font-semibold text-slate-900">Top 5 presentes</div>
            </div>
            <div className="flex flex-col px-3.5 pb-3">
              {report.topGifts.length === 0 && (
                <div className="text-center py-6 text-slate-500 text-[13px]">Nenhuma contribuição ainda.</div>
              )}
              {report.topGifts.map((g, i) => (
                <div key={g.giftId} className="grid grid-cols-[28px_1fr_auto] gap-3 px-2 py-3 items-center border-t border-slate-100 first:border-t-0">
                  <span className="w-7 h-7 rounded-full bg-violet-100 text-indigo-600 inline-flex items-center justify-center text-[12px] font-semibold">{i + 1}</span>
                  <div className="min-w-0">
                    <div className="font-semibold text-[13.5px] text-slate-900 truncate">{g.name}</div>
                    <div className="text-[11.5px] text-slate-500">{g.count} contribuições</div>
                  </div>
                  <Money value={g.total} size={15} />
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden mt-4">
            <div className="px-[22px] pt-[18px] pb-3.5">
              <div className="font-display text-[16px] font-semibold text-slate-900">Contribuintes</div>
            </div>
            <div className="flex flex-col px-3.5 pb-3">
              {report.contributors.length === 0 && (
                <div className="text-center py-6 text-slate-500 text-[13px]">Nenhum contribuinte ainda.</div>
              )}
              {report.contributors.map((c, i) => (
                <div key={c.id} className="grid grid-cols-[36px_1fr_auto_auto] gap-3.5 px-2 py-3 items-center border-t border-slate-100 first:border-t-0">
                  <span
                    className="w-9 h-9 rounded-full inline-flex items-center justify-center text-white font-semibold text-[13px] shrink-0"
                    style={{ background: AVATAR_COLORS[i % AVATAR_COLORS.length] }}
                  >
                    {nameInitials(c.name)}
                  </span>
                  <div className="min-w-0">
                    <div className="font-semibold text-[13.5px] text-slate-900 truncate">{c.name}</div>
                    <div className="text-[12px] text-slate-500 truncate">{c.giftName}</div>
                  </div>
                  <Money value={c.amount} size={15} />
                  <div className="text-[11.5px] text-slate-400 text-right">{fmtDate(c.createdAt)}</div>
                </div>
              ))}
            </div>
          </div>

          {report.remainingGifts.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden mt-4">
              <div className="px-[22px] pt-[18px] pb-3.5">
                <div className="font-display text-[16px] font-semibold text-slate-900">Presentes ainda não presenteados</div>
              </div>
              <div className="flex flex-col px-3.5 pb-3">
                {report.remainingGifts.map(g => (
                  <div key={g.id} className="flex items-center justify-between gap-3 px-2 py-3 border-t border-slate-100 first:border-t-0">
                    <span className="text-[13.5px] text-slate-700">{g.name}</span>
                    <DashBadge tone="warn">{(g.value / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</DashBadge>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </>
  )
}
