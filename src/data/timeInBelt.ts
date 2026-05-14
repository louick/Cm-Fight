import type { Student } from '../types/student'

export interface TimeInBelt {
  years: number
  months: number
  days: number
  totalMonths: number
  label: string // ex: "2a 3m", "8 meses", "menos de 1 mês"
}

export function effectiveBeltSince(student: Student): string {
  return student.beltSince || student.createdAt.slice(0, 10)
}

export function timeInBelt(student: Student, now: Date = new Date()): TimeInBelt | null {
  if (!student.belt) return null
  const since = effectiveBeltSince(student)
  const start = new Date(since + 'T00:00:00')
  if (isNaN(start.getTime())) return null

  let years = now.getFullYear() - start.getFullYear()
  let months = now.getMonth() - start.getMonth()
  let days = now.getDate() - start.getDate()
  if (days < 0) {
    months -= 1
    const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0).getDate()
    days += prevMonth
  }
  if (months < 0) {
    years -= 1
    months += 12
  }
  const totalMonths = years * 12 + months

  let label: string
  if (totalMonths === 0 && years === 0) {
    label = days < 7 ? `${days}d` : 'menos de 1 mês'
  } else if (years === 0) {
    label = `${months} ${months === 1 ? 'mês' : 'meses'}`
  } else if (months === 0) {
    label = `${years} ${years === 1 ? 'ano' : 'anos'}`
  } else {
    label = `${years}a ${months}m`
  }
  return { years, months, days, totalMonths, label }
}

export function formatGradDate(iso: string): string {
  if (!iso) return ''
  return new Date(iso + 'T00:00:00').toLocaleDateString('pt-BR')
}
