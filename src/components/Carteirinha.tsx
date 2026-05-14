import type { Student } from '../types/student'
import { getBelt } from '../data/belts'

interface Props {
  student: Student
  onEdit: () => void
  onDelete: () => void
  onClose: () => void
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

const MODALITY_LABEL: Record<string, string> = {
  'jiu-jitsu': 'Jiu-Jitsu',
  'mma': 'MMA',
  'ambos': 'Jiu-Jitsu & MMA',
}

export default function Carteirinha({ student, onEdit, onDelete, onClose }: Props) {
  const age = calculateAge(student.birthDate)
  const showJJ = student.modality === 'jiu-jitsu' || student.modality === 'ambos'
  const showMMA = student.modality === 'mma' || student.modality === 'ambos'
  const beltData = student.belt ? getBelt(student.belt) : null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" />

      <div
        className="relative w-full max-w-lg animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Botão fechar */}
        <button
          onClick={onClose}
          className="absolute -top-3 -right-3 z-10 w-8 h-8 rounded-full bg-white shadow-lg text-gray-500 hover:text-gray-800 flex items-center justify-center text-lg transition-colors"
        >
          ×
        </button>

        {/* Carteirinha */}
        <div className="bg-white rounded-2xl overflow-hidden shadow-2xl">

          {/* Cabeçalho da academia */}
          <div className="bg-cm-green-darkest px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src="/logo_cm_fight.png"
                alt="CM Fight"
                className="h-14 w-auto drop-shadow-[0_4px_8px_rgba(0,0,0,0.4)]"
              />
              <div>
                <p className="text-white font-black text-base tracking-tight leading-none">
                  CM <span className="text-cm-yellow">FIGHT</span>
                </p>
                <p className="text-white/60 text-[10px] uppercase tracking-[0.18em] mt-1">Escola de Artes Marciais</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-white/40 text-[10px] uppercase tracking-widest">Matrícula</p>
              <p className="text-cm-yellow font-mono font-bold text-sm">{student.id.slice(0, 8).toUpperCase()}</p>
            </div>
          </div>

          {/* Stripe */}
          <div className="h-1 w-full bg-cm-yellow" />

          {/* Corpo: foto + dados */}
          <div className="p-6 flex gap-5">
            {/* Foto */}
            <div className="flex-shrink-0 flex flex-col items-center gap-2">
              <div className="w-24 h-28 rounded-xl overflow-hidden border-2 border-gray-100 bg-gray-100 flex items-center justify-center shadow-sm">
                {student.photo ? (
                  <img src={student.photo} alt={student.name} className="w-full h-full object-cover" />
                ) : (
                  <svg className="w-10 h-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                )}
              </div>
              {/* Modalidade */}
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-cm-green-dark text-cm-yellow text-center leading-tight">
                {MODALITY_LABEL[student.modality]}
              </span>
            </div>

            {/* Dados pessoais */}
            <div className="flex-1 min-w-0 space-y-3">
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Nome</p>
                <p className="text-lg font-black text-gray-900 leading-tight">{student.name}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">CPF</p>
                  <p className="text-sm font-semibold text-gray-700">{student.cpf}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Idade</p>
                  <p className="text-sm font-semibold text-gray-700">{age} anos</p>
                </div>
                <div className="col-span-2">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Nascimento</p>
                  <p className="text-sm font-semibold text-gray-700">{formatDate(student.birthDate)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Seção Jiu-Jitsu */}
          {showJJ && (
            <div className="mx-6 mb-4 p-4 rounded-xl bg-cm-green/5 border border-cm-green/15">
              <p className="text-[10px] font-bold text-cm-green-dark uppercase tracking-widest mb-2 flex items-center gap-1">
                🥋 Jiu-Jitsu — Graduação
              </p>
              {student.belt ? (
                <div className="flex items-center gap-4">
                  {/* Faixa visual */}
                  <div
                    className="h-6 w-36 rounded border border-black/10 shadow-sm flex items-center justify-end pr-1.5 gap-1 overflow-hidden relative"
                    style={
                      student.belt === 'Coral'
                        ? { background: 'linear-gradient(90deg, #dc2626 50%, #111 50%)' }
                        : { backgroundColor: beltData?.hexColor }
                    }
                  >
                    {(student.beltDegree ?? 0) > 0 &&
                      Array.from({ length: student.beltDegree ?? 0 }).map((_, i) => (
                        <div key={i} className="w-3 h-3 rounded-full bg-cm-yellow border border-black/20 flex-shrink-0" />
                      ))}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-800">{student.belt}</p>
                    {(student.beltDegree ?? 0) > 0 && (
                      <p className="text-xs text-gray-500">{student.beltDegree}° grau</p>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-xs text-gray-400">Sem graduação registrada</p>
              )}
            </div>
          )}

          {/* Seção MMA */}
          {showMMA && (
            <div className="mx-6 mb-4 p-4 rounded-xl bg-cm-orange/5 border border-cm-orange/20">
              <p className="text-[10px] font-bold text-cm-orange uppercase tracking-widest mb-2">
                🥊 MMA
              </p>
              <div className="flex flex-wrap gap-2">
                {student.mmaLevel && (
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Nível</p>
                    <p className="text-sm font-bold text-gray-800">{student.mmaLevel}</p>
                  </div>
                )}
                {student.mmaWeightClass && (
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Categoria</p>
                    <p className="text-sm font-bold text-gray-800">{student.mmaWeightClass}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Endereço */}
          <div className="mx-6 mb-4">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Endereço</p>
            <p className="text-xs text-gray-600">
              {student.address.street}, {student.address.number}
              {student.address.complement ? ` — ${student.address.complement}` : ''}<br />
              {student.address.neighborhood}, {student.address.city} / {student.address.state}
              {student.address.cep ? ` — CEP ${student.address.cep}` : ''}
            </p>
          </div>

          {/* Rodapé com ações */}
          <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
            <button
              onClick={onEdit}
              className="flex-1 py-2.5 rounded-xl bg-cm-green-dark text-white text-sm font-bold hover:bg-cm-green-darkest transition-colors shadow-sm"
            >
              Editar cadastro
            </button>
            <button
              onClick={onDelete}
              className="px-4 py-2.5 rounded-xl bg-cm-orange/10 text-cm-orange text-sm font-semibold hover:bg-cm-orange/20 transition-colors border border-cm-orange/20"
            >
              Remover
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
