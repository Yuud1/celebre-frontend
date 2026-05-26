import { Icon } from '../auth/AuthIcons'
import { PageHead } from '../../pages/DashboardPage'
import { Money, Sparkline } from './DashWidgets'

const HISTORY = [
  { date: '14 Out · 18:42', desc: 'Saque PIX · Banco Inter',     method: 'PIX · CPF ···0-00',   amount: -3200, status: 'paid'    },
  { date: '13 Out · 09:15', desc: 'Repasse automático',           method: 'PIX · CPF ···0-00',   amount: -1750, status: 'paid'    },
  { date: '12 Out · 22:08', desc: 'Contribuição · Camila F.',     method: 'Pix recebido',         amount:  1200, status: 'in'      },
  { date: '12 Out · 11:30', desc: 'Saque PIX · Banco Inter',     method: 'PIX · CPF ···0-00',   amount: -2400, status: 'paid'    },
  { date: '11 Out · 19:55', desc: 'Contribuição · Letícia S.',    method: 'Cartão · final 4242', amount:   500, status: 'in'      },
  { date: '10 Out · 14:23', desc: 'Saque PIX · Banco Inter',     method: 'PIX · CPF ···0-00',   amount: -1860, status: 'pending' },
]

export function Saques() {
  return (
    <>
      <PageHead
        eyebrow="Conta de pagamento"
        title="Saques e saldo"
        sub="Acompanhe seu dinheiro em tempo real. Transferências processadas com segurança pela infraestrutura Celebre."
        actions={
          <>
            <button className="ca-btn ca-btn--ghost" style={{ height: 38, padding: '0 16px', fontSize: 13 }}>
              <Icon.Doc style={{ width: 15, height: 15 }} />Extrato completo
            </button>
            <button className="ca-btn ca-btn--primary" style={{ height: 38, padding: '0 16px', fontSize: 13 }}>
              <Icon.Pix style={{ width: 16, height: 16 }} />Sacar via PIX
            </button>
          </>
        }
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr', gap: 16 }}>
        <div className="ca-card" style={{ padding: 28, position: 'relative', overflow: 'hidden', background: 'linear-gradient(135deg, #0F172A 0%, #1E1B4B 60%, #312E81 100%)', borderColor: '#1E1B4B', color: '#fff' }}>
          <div style={{ position: 'absolute', width: 280, height: 280, borderRadius: '50%', top: -100, right: -80, background: 'radial-gradient(circle, rgba(139,92,246,0.45), transparent 70%)', filter: 'blur(20px)' }} />
          <div style={{ position: 'absolute', width: 220, height: 220, borderRadius: '50%', bottom: -80, left: -40, background: 'radial-gradient(circle, rgba(99,102,241,0.35), transparent 70%)', filter: 'blur(20px)' }} />
          <div style={{ position: 'relative' }}>
            <div className="ca-row ca-row--gap-sm" style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12.5 }}>
              <Icon.Pix style={{ width: 14, height: 14, color: '#A5B4FC' }} />
              Saldo disponível para saque
            </div>
            <div className="cd-money" style={{ fontSize: 44, color: '#fff', marginTop: 10 }}>
              <span className="cd-money__currency">R$</span>
              <span>28.940</span>
              <span className="cd-money__cents">,50</span>
            </div>
            <div style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.55)', marginTop: 6 }}>
              Atualizado <span className="ca-mono">há 12 segundos</span> · Chave PIX <strong style={{ color: '#fff' }}>CPF ··· 0-00</strong>
            </div>
            <div className="ca-row ca-row--gap" style={{ marginTop: 22 }}>
              <button className="ca-btn ca-btn--primary ca-btn--lg" style={{ minWidth: 200 }}>
                Sacar para minha conta <Icon.ArrowRight style={{ width: 18, height: 18 }} />
              </button>
              <button style={{ height: 56, padding: '0 22px', borderRadius: 14, background: 'rgba(255,255,255,0.08)', color: '#fff', fontWeight: 500, fontSize: 14.5, border: '1px solid rgba(255,255,255,0.18)', cursor: 'pointer' }}>
                Agendar saque
              </button>
            </div>
            <div className="ca-row" style={{ gap: 18, marginTop: 24, fontSize: 11.5, color: 'rgba(255,255,255,0.6)' }}>
              <span className="ca-row ca-row--gap-sm"><Icon.ShieldCheck style={{ width: 13, height: 13, color: '#A5B4FC' }} />Custódia em conta segregada</span>
              <span className="ca-row ca-row--gap-sm"><Icon.Pix style={{ width: 13, height: 13, color: '#A5B4FC' }} />PIX em até 30s</span>
              <span className="ca-row ca-row--gap-sm"><Icon.Lock style={{ width: 13, height: 13, color: '#A5B4FC' }} />Auditado · BACEN</span>
            </div>
          </div>
        </div>

        <div className="ca-card" style={{ padding: 22 }}>
          <div className="ca-row ca-row--between">
            <div className="ca-row ca-row--gap-sm" style={{ fontSize: 12.5, color: 'var(--ca-muted)' }}>
              <Icon.Loader style={{ width: 14, height: 14, color: '#F59E0B' }} />Saldo em análise
            </div>
            <span className="ca-badge ca-badge--warn">3 contribuições</span>
          </div>
          <Money value={2780} size={28} />
          <div style={{ fontSize: 12.5, color: 'var(--ca-muted)', marginTop: 6, lineHeight: 1.5 }}>
            Análise antifraude · disponível em até <strong style={{ color: 'var(--ca-ink)' }}>48h</strong>.
          </div>
          <hr style={{ border: 0, borderTop: '1px solid var(--ca-line-soft)', margin: '14px 0' }} />
          <div className="ca-row ca-row--gap-sm" style={{ fontSize: 12, color: 'var(--ca-muted)' }}>
            <Icon.Info style={{ width: 13, height: 13 }} />
            Contribuições acima de R$ 500 passam por revisão automática.
          </div>
        </div>

        <div className="ca-card" style={{ padding: 22 }}>
          <div className="ca-row ca-row--between">
            <div className="ca-row ca-row--gap-sm" style={{ fontSize: 12.5, color: 'var(--ca-muted)' }}>
              <Icon.Check style={{ width: 14, height: 14, color: '#10B981' }} />Já transferido
            </div>
            <span className="ca-badge ca-badge--success">+12% mês</span>
          </div>
          <Money value={10660} size={28} />
          <div style={{ fontSize: 12.5, color: 'var(--ca-muted)', marginTop: 6 }}>6 saques · último em 14/10</div>
          <hr style={{ border: 0, borderTop: '1px solid var(--ca-line-soft)', margin: '14px 0' }} />
          <div style={{ height: 36 }}><Sparkline data={[2, 4, 3, 6, 5, 8, 7, 10, 9, 12]} /></div>
        </div>
      </div>

      <div className="ca-card" style={{ padding: 0, marginTop: 16, overflow: 'hidden' }}>
        <div className="ca-row ca-row--between" style={{ padding: '18px 22px 14px' }}>
          <div>
            <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 16, fontWeight: 600 }}>Histórico de transferências</div>
            <div style={{ fontSize: 12.5, color: 'var(--ca-muted)', marginTop: 2 }}>Todas as movimentações da sua conta de pagamento</div>
          </div>
          <div className="cd-tabs">
            <span className="cd-tab cd-tab--on">Todos</span>
            <span className="cd-tab">Saques</span>
            <span className="cd-tab">Recebimentos</span>
          </div>
        </div>
        <div style={{ borderTop: '1px solid var(--ca-line-soft)' }}>
          <div style={{ padding: '10px 22px', fontSize: 11, color: 'var(--ca-muted-2)', letterSpacing: '0.08em', textTransform: 'uppercase', background: 'var(--ca-bg-soft)', borderBottom: '1px solid var(--ca-line-soft)', display: 'grid', gridTemplateColumns: '160px 1fr 1fr 140px 120px 80px' }}>
            <span>Data</span><span>Descrição</span><span>Método</span><span style={{ textAlign: 'right' }}>Valor</span><span>Status</span><span />
          </div>
          {HISTORY.map((r, i) => (
            <div key={i} style={{ padding: '14px 22px', display: 'grid', gridTemplateColumns: '160px 1fr 1fr 140px 120px 80px', borderBottom: '1px solid var(--ca-line-soft)', alignItems: 'center', fontSize: 13 }}>
              <span style={{ color: 'var(--ca-muted)', fontFamily: 'JetBrains Mono, monospace', fontSize: 12 }}>{r.date}</span>
              <span style={{ fontWeight: 500 }}>{r.desc}</span>
              <span style={{ color: 'var(--ca-muted)', fontFamily: 'JetBrains Mono, monospace', fontSize: 12 }}>{r.method}</span>
              <span style={{ textAlign: 'right', fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600, fontSize: 14, fontVariantNumeric: 'tabular-nums', color: r.amount > 0 ? '#047857' : 'var(--ca-ink)' }}>
                {r.amount > 0 ? '+' : '−'} R$ {Math.abs(r.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
              <span>
                {r.status === 'paid'    && <span className="ca-badge ca-badge--success"><Icon.Check style={{ width: 10, height: 10 }} />Concluído</span>}
                {r.status === 'pending' && <span className="ca-badge ca-badge--warn"><Icon.Loader style={{ width: 10, height: 10 }} />Processando</span>}
                {r.status === 'in'      && <span className="ca-badge"><Icon.ArrowLeft style={{ width: 10, height: 10, transform: 'rotate(-45deg)' }} />Recebido</span>}
              </span>
              <button style={{ fontSize: 12, color: 'var(--ca-indigo)', fontWeight: 600, textAlign: 'right' }}>Recibo</button>
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginTop: 16, padding: '14px 18px', background: '#fff', border: '1px solid var(--ca-line)', borderRadius: 14, display: 'flex', alignItems: 'center', gap: 14 }}>
        <span style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--ca-violet-50)', color: 'var(--ca-indigo)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon.ShieldCheck style={{ width: 18, height: 18 }} />
        </span>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600, fontSize: 13.5 }}>Transferências processadas com segurança</div>
          <div style={{ fontSize: 12.5, color: 'var(--ca-muted)' }}>
            Seu dinheiro fica em conta segregada auditada pelo BACEN. Todas as transferências passam por análise antifraude antes do envio.
          </div>
        </div>
        <a style={{ fontSize: 12.5, color: 'var(--ca-indigo)', fontWeight: 600 }}>Saiba mais →</a>
      </div>
    </>
  )
}
