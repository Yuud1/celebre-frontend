import type { GiftItem } from '../types/event'

export function getFeaturedGifts(gifts: GiftItem[]): GiftItem[] {
  const explicit = gifts.filter((gift) => gift.featured === true)
  if (explicit.length > 0) return explicit

  const fallback = gifts.find((gift) => gift.type === 'contribution')
  return fallback ? [fallback] : []
}

export function getGridGifts(gifts: GiftItem[]): GiftItem[] {
  const featuredIds = new Set(getFeaturedGifts(gifts).map((gift) => gift.id))
  return gifts.filter((gift) => !featuredIds.has(gift.id))
}

export function insertGift(gifts: GiftItem[], gift: GiftItem): GiftItem[] {
  const next = [...gifts]

  if (gift.featured) {
    const currentFeatured = getFeaturedGifts(gifts)
    const normalized = next.map((item) =>
      currentFeatured.some((featured) => featured.id === item.id)
        ? { ...item, featured: true }
        : item,
    )
    const lastFeaturedIndex = normalized.reduce(
      (index, item, currentIndex) => (item.featured ? currentIndex : index),
      -1,
    )
    normalized.splice(lastFeaturedIndex + 1, 0, gift)
    return normalized
  }

  next.push(gift)
  return next
}
