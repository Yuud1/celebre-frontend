import { Money } from "@/components/dashboard/DashWidgets"
import { cn } from "@/lib/utils"
import { Check } from "lucide-react"

interface GiftCardItemProps {
  gift: any
  onEdit: (gift: any) => void
  onDelete: (giftId: string) => void
}

export function GiftCardItem({ gift, onEdit, onDelete }: GiftCardItemProps) {
  const isFixed = gift.type === 'fixed'
  const isPurchased = gift.isPurchased
  const collected = Number(gift.collected ?? 0)
  const goal = Number(gift.value ?? 0)

  const pct = isFixed
    ? isPurchased
      ? 100
      : 0
    : goal > 0
      ? Math.min(100, (collected / goal) * 100)
      : 0

  const typeLabel = isFixed ? 'Fixo' : 'Coletivo'

  return (
    <div className="flex flex-row overflow-hidden rounded-2xl border border-slate-200 bg-white transition-all hover:-translate-y-0.5 hover:shadow-ca-md md:flex-col">
      {/* Imagem */}
      <div className="relative h-36 w-32 shrink-0 bg-slate-100 md:h-[140px] md:w-full">
        {gift.imageUrl && (
          <img
            src={gift.imageUrl}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}
      </div>

      {/* Conteúdo */}
      <div className="flex flex-1 flex-col p-4">
        {/* Cabeçalho */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h3 className="truncate font-display text-[15px] font-semibold">
              {gift.name}
            </h3>

            {gift.description && (
              <p className="mt-1 line-clamp-2 text-[13px] leading-snug text-slate-500">
                {gift.description}
              </p>
            )}
          </div>

          <div className="flex shrink-0 gap-1">
            <button
              onClick={() => onEdit(gift)}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-indigo-500 transition hover:bg-slate-100"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                className="h-4 w-4"
              >
                <path
                  d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            <button
              onClick={() => onDelete(gift.id)}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-red-500 transition hover:bg-slate-100"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                className="h-4 w-4"
              >
                <path
                  d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Badges */}
        <div className="mt-3 flex flex-wrap gap-2">
          <span className="rounded-full bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-700">
            {typeLabel}
          </span>

          {isPurchased && (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-1 text-[11px] font-semibold text-emerald-700">
              <Check style={{ width: 11, height: 11 }} />
              Quitado
            </span>
          )}
        </div>

        {/* Valor */}
        <div className="mt-3 flex items-center justify-between">
          <Money
            value={isFixed ? (isPurchased ? goal : 0) : collected}
            size={17}
          />

          {goal > 0 && (
            <span className="text-[12px] text-slate-400">
              de{' '}
              <strong>
                R${' '}
                {(goal / 100).toLocaleString('pt-BR', {
                  minimumFractionDigits: 2,
                })}
              </strong>
            </span>
          )}
        </div>

        {/* Barra */}
        <div
          className={cn(
            'mt-3 h-2 overflow-hidden rounded-full',
            isPurchased ? 'bg-emerald-100' : 'bg-slate-100'
          )}
        >
          <div
            className={cn(
              'h-full transition-all',
              isPurchased ? 'bg-emerald-500' : 'bg-ca-grad'
            )}
            style={{ width: `${pct}%` }}
          />
        </div>

        {/* Rodapé */}
        <div className="mt-2 flex items-center justify-between">
          <span className="text-[12px] text-slate-500">
            {isFixed
              ? isPurchased
                ? 'Quitado'
                : 'Não quitado'
              : `${Math.round(pct)}% arrecadado`}
          </span>

          <span
            className={cn(
              'text-[12px] font-semibold',
              isPurchased ? 'text-emerald-700' : 'text-indigo-500'
            )}
          >
            {Math.round(pct)}%
          </span>
        </div>
      </div>
    </div>
  )
}