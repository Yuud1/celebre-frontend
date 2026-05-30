import { useState } from 'react'
import type { GiftItem, HomeRoom, HomeRoomId } from '../../../types/event'

interface Props {
  rooms: HomeRoom[]
  gifts: GiftItem[]
  onGiftAction?: (gift: GiftItem) => void
}

export function RoomWishlistSection({ rooms, gifts, onGiftAction }: Props) {
  const [activeRoom, setActiveRoom] = useState<HomeRoomId | 'all'>('all')

  const roomCounts = rooms.map((room) => ({
    ...room,
    count: gifts.filter((g) => g.room === room.id).length,
  }))

  const filtered =
    activeRoom === 'all'
      ? gifts
      : gifts.filter((g) => g.room === activeRoom)

  if (!rooms.length) return null

  return (
    <section className="ep-section ep-room-wishlist">
      <span className="ep-kicker">Por cômodo</span>
      <h2>Lista da casa nova</h2>
      <p className="ep-section-lead">Escolha um ambiente e veja o que ainda falta.</p>

      <div className="ep-room-tabs" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={activeRoom === 'all'}
          className={activeRoom === 'all' ? 'is-active' : undefined}
          onClick={() => setActiveRoom('all')}
        >
          Todos ({gifts.length})
        </button>
        {roomCounts.map((room) => (
          <button
            key={room.id}
            type="button"
            role="tab"
            aria-selected={activeRoom === room.id}
            className={activeRoom === room.id ? 'is-active' : undefined}
            onClick={() => setActiveRoom(room.id)}
          >
            {room.icon} {room.name} ({room.count})
          </button>
        ))}
      </div>

      <div className="ep-room-wishlist__grid">
        {filtered.map((gift) => (
          <article key={gift.id} className="ep-gift-card ep-gift-card--room">
            {gift.imageUrl ? (
              <img src={gift.imageUrl} alt="" className="ep-gift-card__image" />
            ) : null}
            <div className="ep-gift-card__top">
              <span>{rooms.find((r) => r.id === gift.room)?.name ?? 'Casa'}</span>
            </div>
            <h3>{gift.name}</h3>
            {gift.description ? <p>{gift.description}</p> : null}
            <button
              type="button"
              className="ep-btn ep-btn--soft"
              onClick={() => onGiftAction?.(gift)}
              disabled={gift.type === 'fixed' && !!gift.isPurchased}
            >
              {gift.type === 'fixed' && gift.isPurchased ? 'Presenteado' : 'Presentear'}
            </button>
          </article>
        ))}
      </div>
    </section>
  )
}
