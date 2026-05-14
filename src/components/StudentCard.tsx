import type { Student } from '../types/student'
import BeltBadge from './BeltBadge'

export type ViewMode = 'grid' | 'list' | 'icons'

interface Props {
  student: Student
  view: ViewMode
  onClick: (student: Student) => void
}

function calculateAge(birthDate: string): number {
  const birth = new Date(birthDate)
  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const m = today.getMonth() - birth.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--
  return age
}

function formatDate(iso: string): string {
  return new Date(iso + 'T00:00:00').toLocaleDateString('pt-BR')
}

const MODALITY_COLOR: Record<string, string> = {
  'jiu-jitsu': 'bg-cm-green-dark/10 text-cm-green-dark',
  'mma': 'bg-cm-orange/10 text-cm-orange',
  'ambos': 'bg-cm-yellow/20 text-cm-green-darkest',
}

const MODALITY_RING: Record<string, string> = {
  'jiu-jitsu': 'ring-cm-green-dark',
  'mma': 'ring-cm-orange',
  'ambos': 'ring-cm-yellow',
}

const MODALITY_LABEL: Record<string, string> = {
  'jiu-jitsu': 'JJ',
  'mma': 'MMA',
  'ambos': 'JJ+MMA',
}

function Avatar({ student, size }: { student: Student; size: 'sm' | 'md' | 'lg' }) {
  const sz = { sm: 'w-10 h-10', md: 'w-14 h-14', lg: 'w-20 h-20' }
  const icon = { sm: 'w-5 h-5', md: 'w-7 h-7', lg: 'w-10 h-10' }
  return (
    <div className={`${sz[size]} flex-shrink-0 rounded-full overflow-hidden bg-gray-100 ring-2 ${MODALITY_RING[student.modality]} ring-offset-2 flex items-center justify-center`}>
      {student.photo ? (
        <img src={student.photo} alt={student.name} className="w-full h-full object-cover" />
      ) : (
        <svg className={`${icon[size]} text-gray-300`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      )}
    </div>
  )
}

export default function StudentCard({ student, view, onClick }: Props) {
  const age = calculateAge(student.birthDate)
  const showJJ = student.modality === 'jiu-jitsu' || student.modality === 'ambos'
  const showMMA = student.modality === 'mma' || student.modality === 'ambos'

  // ICON MODE
  if (view === 'icons') {
    return (
      <button
        onClick={() => onClick(student)}
        className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 active:scale-95 transition-all animate-fade-in group"
      >
        <Avatar student={student} size="lg" />
        <p className="text-xs font-bold text-gray-800 text-center leading-tight line-clamp-2">{student.name}</p>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${MODALITY_COLOR[student.modality]}`}>
          {MODALITY_LABEL[student.modality]}
        </span>
        {showJJ && student.belt && (
          <BeltBadge belt={student.belt} degree={student.beltDegree ?? 0} size="sm" />
        )}
      </button>
    )
  }

  // LIST MODE
  if (view === 'list') {
    return (
      <button
        onClick={() => onClick(student)}
        className="w-full flex items-center gap-4 px-4 py-3 bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md hover:border-cm-green-dark/20 active:scale-[0.99] transition-all animate-fade-in text-left group"
      >
        <Avatar student={student} size="sm" />
        <div className="flex-1 min-w-0">
          <p className="font-bold text-gray-900 text-sm truncate">{student.name}</p>
          <p className="text-xs text-gray-400">{formatDate(student.birthDate)} &bull; {age} anos &bull; {student.cpf}</p>
        </div>
        <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${MODALITY_COLOR[student.modality]}`}>
            {MODALITY_LABEL[student.modality]}
          </span>
          {showJJ && student.belt && (
            <BeltBadge belt={student.belt} degree={student.beltDegree ?? 0} size="sm" />
          )}
          {showMMA && student.mmaLevel && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-cm-orange/10 text-cm-orange font-medium border border-cm-orange/20">
              {student.mmaLevel}
            </span>
          )}
        </div>
        <svg className="w-4 h-4 text-gray-300 group-hover:text-cm-green-dark transition-colors flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    )
  }

  // GRID MODE (default)
  return (
    <button
      onClick={() => onClick(student)}
      className="w-full text-left bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200 overflow-hidden animate-fade-in group"
    >
      <div className="h-1 w-full bg-cm-yellow" />
      <div className="p-4">
        <div className="flex items-start gap-3">
          <Avatar student={student} size="md" />
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-1">
              <p className="font-bold text-gray-900 text-sm leading-tight line-clamp-2">{student.name}</p>
              <span className={`flex-shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded-full ${MODALITY_COLOR[student.modality]}`}>
                {MODALITY_LABEL[student.modality]}
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">{age} anos &bull; {formatDate(student.birthDate)}</p>
          </div>
        </div>

        {showJJ && student.belt && (
          <div className="mt-3 pt-3 border-t border-gray-50">
            <BeltBadge belt={student.belt} degree={student.beltDegree ?? 0} size="sm" />
          </div>
        )}

        {showMMA && (student.mmaLevel || student.mmaWeightClass) && (
          <div className="mt-3 pt-3 border-t border-gray-50 flex flex-wrap gap-1.5">
            {student.mmaLevel && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-cm-orange/10 text-cm-orange font-semibold border border-cm-orange/20">
                {student.mmaLevel}
              </span>
            )}
            {student.mmaWeightClass && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 font-semibold">
                {student.mmaWeightClass}
              </span>
            )}
          </div>
        )}

        <p className="mt-2 text-[10px] text-gray-300 truncate group-hover:text-gray-400 transition-colors">
          {student.address.city}/{student.address.state}
        </p>
      </div>
    </button>
  )
}
