export type BeltColor =
  | 'Branca'
  | 'Amarela'
  | 'Laranja'
  | 'Verde'
  | 'Azul'
  | 'Roxa'
  | 'Marrom'
  | 'Preta'
  | 'Coral'
  | 'Vermelha'

export type Modality = 'jiu-jitsu' | 'mma' | 'ambos'

export type MmaLevel = 'Iniciante' | 'Intermediário' | 'Avançado' | 'Competidor'

export type MmaWeightClass =
  | 'Palha (até 52kg)'
  | 'Mosca (até 56kg)'
  | 'Galo (até 61kg)'
  | 'Pena (até 66kg)'
  | 'Leve (até 70kg)'
  | 'Meio-Médio (até 77kg)'
  | 'Médio (até 84kg)'
  | 'Meio-Pesado (até 93kg)'
  | 'Pesado (até 120kg)'
  | 'Superpesado (+120kg)'

export interface Belt {
  color: BeltColor
  label: string
  maxDegrees: number
  minAge?: number
  maxAge?: number
  note?: string
  hexColor: string
  textColor: string
}

export interface Address {
  cep: string
  street: string
  number: string
  complement?: string
  neighborhood: string
  city: string
  state: string
}

export interface BeltGraduation {
  belt: BeltColor
  degree: number
  date: string // ISO yyyy-mm-dd — quando recebeu essa faixa+grau
}

export interface Student {
  id: string
  name: string
  cpf: string
  birthDate: string
  modality: Modality
  // Jiu-Jitsu
  belt?: BeltColor
  beltDegree?: number
  beltSince?: string // data desta graduação (yyyy-mm-dd)
  beltHistory?: BeltGraduation[] // graduações anteriores, em ordem cronológica
  // MMA
  mmaLevel?: MmaLevel
  mmaWeightClass?: MmaWeightClass
  address: Address
  photo?: string
  createdAt: string
  updatedAt: string
}

export type StudentFormData = Omit<Student, 'id' | 'createdAt' | 'updatedAt'>
