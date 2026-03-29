import type { Material } from '@/types/api'

export function getStockStatus(material: Material): 'low' | 'high' | 'normal' {
  const qty = Number.parseFloat(material.quantity)
  const min = Number.parseFloat(material.min_stock)

  if (qty < min) {
    return 'low'
  }

  if (material.max_stock) {
    const max = Number.parseFloat(material.max_stock)
    if (qty >= max * 0.8) {
      return 'high'
    }
  }

  return 'normal'
}

export function movementVariant(type: 'IN' | 'OUT' | 'ADJUST') {
  if (type === 'IN') {
    return 'success'
  }
  if (type === 'OUT') {
    return 'secondary'
  }
  return 'outline'
}

export function isToday(dateStr: string) {
  const d = new Date(dateStr)
  const now = new Date()
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  )
}
