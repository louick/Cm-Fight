import { useState, useMemo, useEffect } from 'react'
import type { Student, StudentFormData, BeltColor, Modality } from './types/student'
import { BELTS } from './data/belts'
import { getStudents, createStudent, updateStudent, deleteStudent } from './data/students'
import StudentCard, { type ViewMode } from './components/StudentCard'
import StudentForm from './components/StudentForm'
import Modal from './components/Modal'
import ConfirmDialog from './components/ConfirmDialog'
import Carteirinha from './components/Carteirinha'

type SortKey = 'name' | 'belt' | 'createdAt'

const BELT_ORDER: BeltColor[] = ['Branca','Amarela','Laranja','Verde','Azul','Roxa','Marrom','Preta','Coral','Vermelha']

export default function App() {
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Student | undefined>()
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
  const [viewing, setViewing] = useState<Student | null>(null)
  const [view, setView] = useState<ViewMode>('grid')
  const [balanceOpen, setBalanceOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [filterBelt, setFilterBelt] = useState<BeltColor | ''>('')
  const [filterModality, setFilterModality] = useState<Modality | ''>('')
  const [sortKey, setSortKey] = useState<SortKey>('createdAt')

  const refresh = () =>
    getStudents().then(setStudents).catch(console.error)

  useEffect(() => {
    getStudents()
      .then(setStudents)
      .finally(() => setLoading(false))
  }, [])

  // Se a aba foi morta enquanto a câmera estava aberta (memória),
  // reabre o modal de cadastro com o rascunho salvo
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem('cmfight:studentForm:draft')
      if (raw) {
        setEditing(undefined)
        setModalOpen(true)
      }
    } catch { /* ignore */ }
  }, [])

  const handleSave = async (data: StudentFormData) => {
    if (editing) {
      await updateStudent(editing.id, data)
    } else {
      await createStudent(data)
    }
    await refresh()
    setModalOpen(false)
    setEditing(undefined)
  }

  const handleView = (student: Student) => setViewing(student)

  const handleEdit = (student: Student) => {
    setViewing(null)
    setEditing(student)
    setModalOpen(true)
  }

  const handleDelete = async () => {
    if (deleteTarget) {
      await deleteStudent(deleteTarget)
      await refresh()
      setDeleteTarget(null)
      setViewing(null)
    }
  }

  const handleNew = () => {
    setEditing(undefined)
    setModalOpen(true)
  }

  const filtered = useMemo(() => {
    let list = [...students]
    if (search) {
      const q = search.toLowerCase()
      list = list.filter((s) => s.name.toLowerCase().includes(q) || s.cpf.includes(q))
    }
    if (filterModality) {
      list = list.filter((s) => s.modality === filterModality)
    }
    if (filterBelt) {
      list = list.filter((s) => s.belt === filterBelt)
    }
    list.sort((a, b) => {
      if (sortKey === 'name') return a.name.localeCompare(b.name)
      if (sortKey === 'belt') return BELT_ORDER.indexOf(a.belt ?? 'Branca') - BELT_ORDER.indexOf(b.belt ?? 'Branca')
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })
    return list
  }, [students, search, filterBelt, filterModality, sortKey])

  const jjStudents = students.filter(s => s.modality === 'jiu-jitsu' || s.modality === 'ambos')
  const mmaStudents = students.filter(s => s.modality === 'mma' || s.modality === 'ambos')

  return (
    <div className="min-h-screen bg-gray-50 font-sans flex flex-col">
      {/* Header */}
      <header className="bg-cm-green-darkest text-white shadow-md relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-4">
              <img
                src="/logo_cm_fight.png"
                alt="CM Fight"
                className="h-14 w-auto"
              />
              <div className="hidden sm:block">
                <h1 className="text-lg font-black tracking-tight leading-none text-white">
                  CM <span className="text-cm-yellow">FIGHT</span>
                </h1>
                <p className="text-[10px] uppercase tracking-[0.2em] text-white/55 leading-none mt-1.5 font-medium">Escola de Artes Marciais</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* View toggles */}
              <div className="hidden sm:flex items-center bg-white/10 rounded-lg p-0.5 gap-0.5">
                {([
                  { key: 'grid', title: 'Cards',
                    icon: <><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></> },
                  { key: 'list', title: 'Lista',
                    icon: <><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16"/></> },
                  { key: 'icons', title: 'Ícones',
                    icon: <><circle cx="6" cy="6" r="3"/><circle cx="18" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="18" r="3"/></> },
                ] as const).map(({ key, title, icon }) => (
                  <button
                    key={key}
                    title={title}
                    onClick={() => setView(key)}
                    className={`p-1.5 rounded-md transition-colors ${view === key ? 'bg-cm-yellow text-cm-green-darkest shadow-sm' : 'text-white/60 hover:text-white'}`}
                  >
                    <svg className="w-4 h-4" fill={key === 'grid' || key === 'icons' ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke={key === 'list' ? 'currentColor' : 'none'}>{icon}</svg>
                  </button>
                ))}
              </div>
              <span className="text-xs text-white/50 hidden sm:block">
                {students.length} aluno{students.length !== 1 ? 's' : ''}
              </span>
              <button
                onClick={handleNew}
                className="flex items-center gap-2 px-4 py-2.5 bg-cm-yellow hover:bg-cm-yellow-dark text-cm-green-darkest text-sm font-black uppercase tracking-wide rounded-lg transition-all shadow-md hover:shadow-lg active:scale-95"
              >
                <span className="text-base leading-none">+</span>
                Novo aluno
              </button>
            </div>
          </div>
        </div>
        <div className="h-1 w-full bg-cm-yellow" />
      </header>

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {loading ? (
          <div className="flex items-center justify-center py-32">
            <div className="w-8 h-8 rounded-full border-4 border-cm-green border-t-transparent animate-spin" />
          </div>
        ) : (
          <>
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <div className="relative flex-1">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar por nome ou CPF…"
                  className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-gray-200 bg-white text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cm-green/40 focus:border-cm-green transition-all"
                />
              </div>
              <select
                value={filterModality}
                onChange={(e) => setFilterModality(e.target.value as Modality | '')}
                className="px-4 py-2.5 rounded-lg border border-gray-200 bg-white text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-cm-green/40 focus:border-cm-green transition-all"
              >
                <option value="">Todas as modalidades</option>
                <option value="jiu-jitsu">Jiu-Jitsu</option>
                <option value="mma">MMA</option>
                <option value="ambos">Ambos</option>
              </select>
              <select
                value={filterBelt}
                onChange={(e) => setFilterBelt(e.target.value as BeltColor | '')}
                className="px-4 py-2.5 rounded-lg border border-gray-200 bg-white text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-cm-green/40 focus:border-cm-green transition-all"
              >
                <option value="">Todas as faixas</option>
                {BELTS.map((b) => (
                  <option key={b.color} value={b.color}>{b.label}</option>
                ))}
              </select>
              <select
                value={sortKey}
                onChange={(e) => setSortKey(e.target.value as SortKey)}
                className="px-4 py-2.5 rounded-lg border border-gray-200 bg-white text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-cm-green/40 focus:border-cm-green transition-all"
              >
                <option value="createdAt">Mais recentes</option>
                <option value="name">Nome A–Z</option>
                <option value="belt">Graduação</option>
              </select>
            </div>

            {/* Balanço colapsável */}
            {students.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 mb-6">
                <button
                  type="button"
                  onClick={() => setBalanceOpen((o) => !o)}
                  className="flex items-center justify-between w-full"
                >
                  <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Balanço geral</h2>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">{students.length} aluno{students.length !== 1 ? 's' : ''} no total</span>
                    <svg
                      className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${balanceOpen ? 'rotate-180' : ''}`}
                      fill="none" viewBox="0 0 24 24" stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>

                <div className={`overflow-hidden transition-all duration-300 ${balanceOpen ? 'mt-5 max-h-[800px] opacity-100' : 'max-h-0 opacity-0'}`}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-xs font-bold text-cm-green-dark uppercase tracking-widest mb-3 flex items-center gap-2">
                        🥋 Jiu-Jitsu
                        <span className="text-gray-400 font-normal normal-case tracking-normal">({jjStudents.length} aluno{jjStudents.length !== 1 ? 's' : ''})</span>
                      </p>
                      {jjStudents.length === 0 ? (
                        <p className="text-xs text-gray-400">Nenhum aluno de Jiu-Jitsu</p>
                      ) : (
                        <div className="space-y-2">
                          {BELTS.filter(b => jjStudents.some(s => s.belt === b.color)).map((b) => {
                            const count = jjStudents.filter(s => s.belt === b.color).length
                            const pct = Math.round((count / jjStudents.length) * 100)
                            const isGradient = b.color === 'Coral'
                            return (
                              <div key={b.color} className="flex items-center gap-3">
                                <div
                                  className="flex-shrink-0 w-3 h-3 rounded-full border border-black/10"
                                  style={isGradient
                                    ? { background: 'linear-gradient(135deg, #dc2626 50%, #111 50%)' }
                                    : { backgroundColor: b.hexColor }}
                                />
                                <span className="text-sm text-gray-700 w-24 flex-shrink-0 truncate">{b.label}</span>
                                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                                  <div
                                    className="h-full rounded-full transition-all duration-500"
                                    style={{
                                      width: `${pct}%`,
                                      background: isGradient ? 'linear-gradient(90deg, #dc2626, #111)' : b.hexColor,
                                      border: b.color === 'Branca' ? '1px solid #e5e7eb' : undefined,
                                    }}
                                  />
                                </div>
                                <span className="text-sm font-semibold text-gray-700 w-5 text-right">{count}</span>
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>

                    <div>
                      <p className="text-xs font-bold text-cm-orange uppercase tracking-widest mb-3 flex items-center gap-2">
                        🥊 MMA
                        <span className="text-gray-400 font-normal normal-case tracking-normal">({mmaStudents.length} aluno{mmaStudents.length !== 1 ? 's' : ''})</span>
                      </p>
                      {mmaStudents.length === 0 ? (
                        <p className="text-xs text-gray-400">Nenhum aluno de MMA</p>
                      ) : (
                        <div className="space-y-2">
                          {(['Iniciante','Intermediário','Avançado','Competidor'] as const)
                            .filter(l => mmaStudents.some(s => s.mmaLevel === l))
                            .map((level) => {
                              const count = mmaStudents.filter(s => s.mmaLevel === level).length
                              const pct = Math.round((count / mmaStudents.length) * 100)
                              const colors: Record<string, string> = {
                                'Iniciante': '#6b7280',
                                'Intermediário': '#2563eb',
                                'Avançado': '#9333ea',
                                'Competidor': '#dc2626',
                              }
                              return (
                                <div key={level} className="flex items-center gap-3">
                                  <div className="flex-shrink-0 w-3 h-3 rounded-full" style={{ backgroundColor: colors[level] }} />
                                  <span className="text-sm text-gray-700 w-24 flex-shrink-0">{level}</span>
                                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                      className="h-full rounded-full transition-all duration-500"
                                      style={{ width: `${pct}%`, backgroundColor: colors[level] }}
                                    />
                                  </div>
                                  <span className="text-sm font-semibold text-gray-700 w-5 text-right">{count}</span>
                                </div>
                              )
                            })}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Grid */}
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <p className="text-gray-500 font-medium">
                  {students.length === 0 ? 'Nenhum aluno cadastrado ainda' : 'Nenhum aluno encontrado'}
                </p>
                {students.length === 0 && (
                  <button
                    onClick={handleNew}
                    className="mt-4 px-5 py-2 bg-cm-green-dark text-white text-sm font-semibold rounded-lg hover:bg-cm-green-darkest transition-colors shadow-md"
                  >
                    Cadastrar primeiro aluno
                  </button>
                )}
              </div>
            ) : (
              <div className={
                view === 'list'
                  ? 'flex flex-col gap-2'
                  : view === 'icons'
                  ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3'
                  : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
              }>
                {filtered.map((student) => (
                  <StudentCard
                    key={student.id}
                    student={student}
                    view={view}
                    onClick={handleView}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-16 bg-cm-green-darkest text-white">
        <div className="h-1 w-full bg-cm-yellow" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center gap-3 justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo_cm_fight.png" alt="CM Fight" className="h-10 w-auto" />
            <div>
              <p className="font-black text-sm tracking-tight leading-none">
                CM <span className="text-cm-yellow">FIGHT</span>
              </p>
              <p className="text-[10px] uppercase tracking-[0.2em] text-white/55 mt-1">Escola de Artes Marciais</p>
            </div>
          </div>
          <p className="text-[11px] text-white/45">© {new Date().getFullYear()} CM Fight — Escola de Artes Marciais</p>
        </div>
      </footer>

      {modalOpen && (
        <Modal
          title={editing ? 'Editar aluno' : 'Cadastrar novo aluno'}
          onClose={() => { setModalOpen(false); setEditing(undefined) }}
        >
          <StudentForm
            student={editing}
            onSave={handleSave}
            onCancel={() => { setModalOpen(false); setEditing(undefined) }}
          />
        </Modal>
      )}

      {viewing && !deleteTarget && (
        <Carteirinha
          student={viewing}
          onEdit={() => handleEdit(viewing)}
          onDelete={() => setDeleteTarget(viewing.id)}
          onClose={() => setViewing(null)}
        />
      )}

      {deleteTarget && (
        <ConfirmDialog
          message="Tem certeza que deseja remover este aluno? Esta ação não pode ser desfeita."
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  )
}
