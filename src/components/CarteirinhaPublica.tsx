import { useState } from 'react'
import type { Student } from '../types/student'
import { getStudentByCpf } from '../data/students'
import { getBelt } from '../data/belts'
import { timeInBelt, effectiveBeltSince, formatGradDate } from '../data/timeInBelt'

function formatCPF(value: string): string {
  const d = value.replace(/\D/g, '').slice(0, 11)
  return d
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
}

function calculateAge(birthDate: string): number {
  const birth = new Date(birthDate)
  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const m = today.getMonth() - birth.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--
  return age
}

const MODALITY_LABEL: Record<string, string> = {
  'jiu-jitsu': 'Jiu-Jitsu',
  'mma': 'MMA',
  'ambos': 'Jiu-Jitsu & MMA',
}

export default function CarteirinhaPublica() {
  const [cpfDisplay, setCpfDisplay] = useState('')
  const [student, setStudent] = useState<Student | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const search = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setStudent(null)
    setLoading(true)
    try {
      const s = await getStudentByCpf(cpfDisplay)
      setStudent(s)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro inesperado')
    } finally {
      setLoading(false)
    }
  }

  const reset = () => {
    setStudent(null)
    setCpfDisplay('')
    setError(null)
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans flex flex-col">
      {/* Header — escondido na impressão */}
      <header className="bg-cm-green-darkest text-white shadow-md print:hidden">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-3">
          <img src="/logo_cm_fight.png" alt="CM Fight" className="h-12 w-auto" />
          <div>
            <h1 className="text-base font-black tracking-tight leading-none">
              CM <span className="text-cm-yellow">FIGHT</span>
            </h1>
            <p className="text-[10px] uppercase tracking-[0.2em] text-white/55 leading-none mt-1.5 font-medium">
              Carteirinha do aluno
            </p>
          </div>
        </div>
        <div className="h-1 w-full bg-cm-yellow" />
      </header>

      <main className="flex-1 w-full max-w-3xl mx-auto px-4 py-8 print:p-0 print:max-w-none">
        {!student && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 print:hidden">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Imprima sua carteirinha</h2>
            <p className="text-sm text-gray-500 mb-6">
              Digite seu CPF para localizar seu cadastro e imprimir a carteirinha oficial da academia.
            </p>
            <form onSubmit={search} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">CPF</label>
                <input
                  inputMode="numeric"
                  value={cpfDisplay}
                  onChange={(e) => setCpfDisplay(formatCPF(e.target.value))}
                  placeholder="000.000.000-00"
                  maxLength={14}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cm-green/40 focus:border-cm-green transition-all text-base"
                />
              </div>
              {error && (
                <div className="p-3 rounded-lg bg-cm-orange/10 border border-cm-orange/20 text-cm-orange text-sm">
                  {error}
                </div>
              )}
              <button
                type="submit"
                disabled={loading || cpfDisplay.replace(/\D/g, '').length !== 11}
                className="w-full py-3 rounded-lg bg-cm-green-dark text-white font-bold uppercase tracking-wide hover:bg-cm-green-darkest transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {loading ? 'Buscando…' : 'Buscar minha carteirinha'}
              </button>
            </form>
          </div>
        )}

        {student && (
          <div className="space-y-6 print:space-y-0">
            {/* Barra de ações — escondida na impressão */}
            <div className="flex flex-wrap gap-3 justify-between items-center print:hidden">
              <button
                onClick={reset}
                className="px-4 py-2 rounded-lg border border-gray-200 bg-white text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                ← Buscar outro CPF
              </button>
              <button
                onClick={() => window.print()}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-cm-green-dark text-white text-sm font-bold uppercase tracking-wide hover:bg-cm-green-darkest transition-colors shadow"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                Imprimir
              </button>
            </div>

            {/* Carteirinha — RG/ID-2: 105mm × 74mm */}
            <div className="flex justify-center">
              <Carteirinha student={student} />
            </div>

            <p className="text-center text-xs text-gray-400 print:hidden">
              Dica: nas opções de impressão, escolha "tamanho real" / 100% e desmarque "Cabeçalhos e rodapés" para um corte perfeito.
            </p>
          </div>
        )}
      </main>

      <footer className="mt-auto bg-cm-green-darkest text-white print:hidden">
        <div className="h-1 w-full bg-cm-yellow" />
        <div className="max-w-3xl mx-auto px-4 py-4 text-center">
          <p className="text-[11px] text-white/55">© {new Date().getFullYear()} CM Fight — Escola de Artes Marciais</p>
        </div>
      </footer>
    </div>
  )
}

function Carteirinha({ student }: { student: Student }) {
  const age = calculateAge(student.birthDate)
  const showJJ = student.modality === 'jiu-jitsu' || student.modality === 'ambos'
  const showMMA = student.modality === 'mma' || student.modality === 'ambos'
  const beltData = student.belt ? getBelt(student.belt) : null
  const t = timeInBelt(student)

  return (
    <div
      className="cmfight-card bg-white text-gray-900 shadow-xl rounded-xl overflow-hidden border border-gray-200 print:shadow-none print:border-gray-400"
      style={{ width: '105mm', height: '74mm' }}
    >
      {/* Header */}
      <div className="bg-cm-green-darkest text-white flex items-center gap-2 px-3 py-1.5">
        <img src="/logo_cm_fight.png" alt="" className="h-7 w-auto" />
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-black tracking-tight leading-none">
            CM <span className="text-cm-yellow">FIGHT</span>
          </p>
          <p className="text-[7px] uppercase tracking-[0.18em] text-white/60 mt-0.5">Escola de Artes Marciais</p>
        </div>
        <div className="text-right">
          <p className="text-[6px] uppercase tracking-widest text-white/45 leading-none">Matrícula</p>
          <p className="text-[8px] font-mono font-bold text-cm-yellow leading-tight">{student.id.slice(0, 8).toUpperCase()}</p>
        </div>
      </div>
      <div className="h-[2px] w-full bg-cm-yellow" />

      {/* Corpo */}
      <div className="flex gap-2 p-2.5">
        {/* Foto */}
        <div className="flex-shrink-0 w-[22mm] h-[28mm] rounded overflow-hidden border border-gray-200 bg-gray-100 flex items-center justify-center">
          {student.photo ? (
            <img src={student.photo} alt={student.name} className="w-full h-full object-cover" />
          ) : (
            <svg className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          )}
        </div>

        {/* Dados */}
        <div className="flex-1 min-w-0 flex flex-col">
          <div>
            <p className="text-[6px] font-bold text-gray-400 uppercase tracking-widest leading-none">Nome</p>
            <p className="text-[11px] font-black text-gray-900 leading-tight line-clamp-2">{student.name}</p>
          </div>

          <div className="grid grid-cols-2 gap-x-2 mt-1">
            <div>
              <p className="text-[6px] font-bold text-gray-400 uppercase tracking-widest leading-none">CPF</p>
              <p className="text-[9px] font-semibold text-gray-700 leading-tight">{student.cpf}</p>
            </div>
            <div>
              <p className="text-[6px] font-bold text-gray-400 uppercase tracking-widest leading-none">Nascimento</p>
              <p className="text-[9px] font-semibold text-gray-700 leading-tight">
                {new Date(student.birthDate + 'T00:00:00').toLocaleDateString('pt-BR')} • {age}a
              </p>
            </div>
          </div>

          <div className="mt-1">
            <span className="inline-block text-[7px] font-bold px-1.5 py-[1px] rounded bg-cm-green-dark text-cm-yellow uppercase tracking-wider">
              {MODALITY_LABEL[student.modality]}
            </span>
          </div>

          {/* Graduação JJ */}
          {showJJ && student.belt && (
            <div className="mt-auto pt-1 flex items-end gap-1.5">
              <div
                className="h-3 w-[18mm] rounded-[2px] border border-black/15 flex items-center justify-end pr-0.5 gap-[2px] overflow-hidden"
                style={
                  student.belt === 'Coral'
                    ? { background: 'linear-gradient(90deg, #dc2626 50%, #111 50%)' }
                    : { backgroundColor: beltData?.hexColor }
                }
              >
                {(student.beltDegree ?? 0) > 0 &&
                  Array.from({ length: student.beltDegree ?? 0 }).map((_, i) => (
                    <div key={i} className="w-[5px] h-[5px] rounded-full bg-cm-yellow border border-black/30 flex-shrink-0" />
                  ))}
              </div>
              <div className="flex-1 min-w-0 leading-none">
                <p className="text-[8px] font-bold text-gray-800 leading-none">{student.belt}{(student.beltDegree ?? 0) > 0 ? ` ${student.beltDegree}°` : ''}</p>
                {t && (
                  <p className="text-[7px] text-cm-green-dark font-semibold leading-none mt-0.5">
                    {t.label} • desde {formatGradDate(effectiveBeltSince(student))}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* MMA */}
          {showMMA && (student.mmaLevel || student.mmaWeightClass) && (
            <div className="mt-auto pt-1">
              <p className="text-[6px] font-bold text-cm-orange uppercase tracking-widest leading-none">MMA</p>
              <p className="text-[8px] font-semibold text-gray-700 leading-tight">
                {student.mmaLevel}
                {student.mmaLevel && student.mmaWeightClass ? ' • ' : ''}
                {student.mmaWeightClass}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
