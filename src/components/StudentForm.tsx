import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import type { Student, StudentFormData, BeltColor, Modality } from '../types/student'
import { BELTS } from '../data/belts'
import BeltBadge from './BeltBadge'

interface Props {
  student?: Student
  onSave: (data: StudentFormData) => void
  onCancel: () => void
}

const MMA_LEVELS = ['Iniciante', 'Intermediário', 'Avançado', 'Competidor'] as const
const MMA_WEIGHT_CLASSES = [
  'Palha (até 52kg)',
  'Mosca (até 56kg)',
  'Galo (até 61kg)',
  'Pena (até 66kg)',
  'Leve (até 70kg)',
  'Meio-Médio (até 77kg)',
  'Médio (até 84kg)',
  'Meio-Pesado (até 93kg)',
  'Pesado (até 120kg)',
  'Superpesado (+120kg)',
] as const

function formatCPF(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11)
  return digits
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
}

function formatCEP(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 8)
  return digits.replace(/(\d{5})(\d)/, '$1-$2')
}

const DRAFT_KEY = 'cmfight:studentForm:draft'

function compressImage(file: File, maxSize = 900, quality = 0.85): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(reader.error)
    reader.onload = (e) => {
      const img = new Image()
      img.onerror = () => reject(new Error('Falha ao carregar imagem'))
      img.onload = () => {
        let { width, height } = img
        if (width > height && width > maxSize) {
          height = Math.round((height * maxSize) / width)
          width = maxSize
        } else if (height > maxSize) {
          width = Math.round((width * maxSize) / height)
          height = maxSize
        }
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        if (!ctx) return reject(new Error('Canvas sem suporte'))
        ctx.drawImage(img, 0, 0, width, height)
        resolve(canvas.toDataURL('image/jpeg', quality))
      }
      img.src = e.target?.result as string
    }
    reader.readAsDataURL(file)
  })
}

function calculateAge(birthDate: string): number | null {
  if (!birthDate) return null
  const birth = new Date(birthDate)
  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const m = today.getMonth() - birth.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--
  return age >= 0 ? age : null
}

export default function StudentForm({ student, onSave, onCancel }: Props) {
  // Restaura rascunho do sessionStorage se a aba foi morta enquanto a câmera estava aberta
  const draft = (() => {
    if (student) return null
    try {
      const raw = sessionStorage.getItem(DRAFT_KEY)
      return raw ? JSON.parse(raw) : null
    } catch { return null }
  })()

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<StudentFormData>({
    defaultValues: student
      ? {
          name: student.name,
          cpf: student.cpf,
          birthDate: student.birthDate,
          modality: student.modality,
          belt: student.belt,
          beltDegree: student.beltDegree ?? 0,
          mmaLevel: student.mmaLevel,
          mmaWeightClass: student.mmaWeightClass,
          address: student.address,
          photo: student.photo,
        }
      : draft?.form ?? {
          modality: 'jiu-jitsu',
          beltDegree: 0,
          address: { cep: '', street: '', number: '', complement: '', neighborhood: '', city: '', state: '' },
        },
  })

  const [cpfDisplay, setCpfDisplay] = useState(student?.cpf ?? draft?.cpfDisplay ?? '')
  const [cepDisplay, setCepDisplay] = useState(student?.address.cep ?? draft?.cepDisplay ?? '')
  const [photoPreview, setPhotoPreview] = useState<string | undefined>(student?.photo ?? draft?.photoPreview)
  const cameraInputRef = useRef<HTMLInputElement>(null)
  const uploadInputRef = useRef<HTMLInputElement>(null)

  // Persiste rascunho continuamente — sobrevive a aba morta pela câmera
  const watchedValues = watch()
  useEffect(() => {
    if (student) return // edição não precisa de draft
    try {
      sessionStorage.setItem(DRAFT_KEY, JSON.stringify({
        form: getValues(),
        cpfDisplay,
        cepDisplay,
        photoPreview,
      }))
    } catch (err) {
      // sessionStorage cheio ou indisponível — silencioso
      console.warn('[draft]', err)
    }
  }, [watchedValues, cpfDisplay, cepDisplay, photoPreview, student, getValues])

  const birthDate = watch('birthDate')
  const modality = watch('modality') as Modality
  const selectedBelt = watch('belt') as BeltColor
  const selectedDegree = watch('beltDegree')
  const age = calculateAge(birthDate)
  const beltData = BELTS.find((b) => b.color === selectedBelt)

  const showJJ = modality === 'jiu-jitsu' || modality === 'ambos'
  const showMMA = modality === 'mma' || modality === 'ambos'

  useEffect(() => {
    if (beltData && (selectedDegree ?? 0) > beltData.maxDegrees) {
      setValue('beltDegree', beltData.maxDegrees)
    }
  }, [selectedBelt, beltData, selectedDegree, setValue])

  const handlePhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation()
    const file = e.target.files?.[0]
    e.target.value = '' // permite reescolher o mesmo arquivo
    if (!file) return
    try {
      const dataUrl = await compressImage(file)
      setPhotoPreview(dataUrl)
    } catch (err) {
      console.error('[photo]', err)
      alert('Não consegui processar essa imagem. Tenta outra.')
    }
  }

  const onSubmit = (data: StudentFormData) => {
    try { sessionStorage.removeItem(DRAFT_KEY) } catch { /* ignore */ }
    onSave({
      ...data,
      cpf: cpfDisplay,
      address: { ...data.address, cep: cepDisplay },
      photo: photoPreview,
      belt: showJJ ? data.belt : undefined,
      beltDegree: showJJ ? data.beltDegree : undefined,
      mmaLevel: showMMA ? data.mmaLevel : undefined,
      mmaWeightClass: showMMA ? data.mmaWeightClass : undefined,
    })
  }

  const handleCancel = () => {
    try { sessionStorage.removeItem(DRAFT_KEY) } catch { /* ignore */ }
    onCancel()
  }

  const inputClass =
    'w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cm-green-dark focus:border-transparent transition-all text-sm'
  const errorClass = 'text-red-500 text-xs mt-1'
  const labelClass = 'block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5'
  const sectionClass = 'bg-gray-50 rounded-xl p-5 space-y-4'

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 animate-slide-up">

      {/* Foto de perfil */}
      <div className="flex items-center gap-5">
        <div className="relative flex-shrink-0">
          <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-gray-200 bg-gray-100 flex items-center justify-center">
            {photoPreview ? (
              <img src={photoPreview} alt="Foto do aluno" className="w-full h-full object-cover" />
            ) : (
              <svg className="w-10 h-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            )}
          </div>
          {photoPreview && (
            <button
              type="button"
              onClick={() => setPhotoPreview(undefined)}
              className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center hover:bg-red-600 transition-colors"
            >
              ×
            </button>
          )}
        </div>
        <div>
          <label className={labelClass}>Foto de perfil</label>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => cameraInputRef.current?.click()}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-cm-green-dark bg-cm-green-dark text-sm text-white font-medium hover:bg-cm-green-darkest transition-all"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Tirar foto
            </button>
            <button
              type="button"
              onClick={() => uploadInputRef.current?.click()}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 bg-white text-sm text-gray-600 font-medium hover:bg-gray-50 hover:border-gray-300 transition-all"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {photoPreview ? 'Trocar do dispositivo' : 'Selecionar do dispositivo'}
            </button>
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={handlePhoto}
            />
            <input
              ref={uploadInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePhoto}
            />
          </div>
          <p className="text-xs text-gray-400 mt-1.5">Tire na hora pela câmera ou envie um arquivo (JPG, PNG, WEBP)</p>
        </div>
      </div>

      {/* Modalidade */}
      <div className={sectionClass}>
        <h3 className="text-sm font-bold text-cm-green-dark uppercase tracking-widest flex items-center gap-2">
          <span className="w-1 h-4 bg-cm-yellow rounded-full inline-block" />
          Modalidade
        </h3>
        <div className="grid grid-cols-3 gap-3">
          {([
            { value: 'jiu-jitsu', label: 'Jiu-Jitsu', icon: '🥋' },
            { value: 'mma', label: 'MMA', icon: '🥊' },
            { value: 'ambos', label: 'Ambos', icon: '🥋🥊' },
          ] as { value: Modality; label: string; icon: string }[]).map((opt) => (
            <label
              key={opt.value}
              className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl border-2 cursor-pointer transition-all select-none ${
                modality === opt.value
                  ? 'border-cm-green-dark bg-cm-green-dark text-white shadow-md'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
              }`}
            >
              <input type="radio" value={opt.value} {...register('modality')} className="hidden" />
              <span className="text-xl">{opt.icon}</span>
              <span className="text-xs font-bold tracking-wide">{opt.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Dados pessoais */}
      <div className={sectionClass}>
        <h3 className="text-sm font-bold text-cm-green-dark uppercase tracking-widest flex items-center gap-2">
          <span className="w-1 h-4 bg-cm-green rounded-full inline-block" />
          Dados Pessoais
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className={labelClass}>Nome completo</label>
            <input
              {...register('name', { required: 'Nome é obrigatório', minLength: { value: 3, message: 'Mínimo 3 caracteres' } })}
              className={inputClass}
              placeholder="João da Silva"
            />
            {errors.name && <p className={errorClass}>{errors.name.message}</p>}
          </div>
          <div>
            <label className={labelClass}>CPF</label>
            <input
              value={cpfDisplay}
              onChange={(e) => setCpfDisplay(formatCPF(e.target.value))}
              className={inputClass}
              placeholder="000.000.000-00"
              maxLength={14}
            />
          </div>
          <div>
            <label className={labelClass}>Data de nascimento</label>
            <div className="relative">
              <input
                type="date"
                {...register('birthDate', { required: 'Data de nascimento é obrigatória' })}
                className={inputClass}
              />
              {age !== null && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-cm-green bg-green-50 px-2 py-0.5 rounded-full border border-green-200">
                  {age} anos
                </span>
              )}
            </div>
            {errors.birthDate && <p className={errorClass}>{errors.birthDate.message}</p>}
          </div>
        </div>
      </div>

      {/* Jiu-Jitsu — Graduação */}
      {showJJ && (
        <div className={sectionClass}>
          <h3 className="text-sm font-bold text-cm-green-dark uppercase tracking-widest flex items-center gap-2">
            <span className="w-1 h-4 bg-cm-green rounded-full inline-block" />
            Jiu-Jitsu — Graduação
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Faixa</label>
              <select
                {...register('belt', { required: showJJ ? 'Faixa é obrigatória' : false })}
                className={inputClass}
              >
                <option value="">Selecione a faixa</option>
                {BELTS.map((b) => (
                  <option key={b.color} value={b.color}>{b.label}</option>
                ))}
              </select>
              {errors.belt && <p className={errorClass}>{errors.belt.message}</p>}
            </div>
            <div>
              <label className={labelClass}>Grau (máx. {beltData?.maxDegrees ?? 4})</label>
              <input
                type="number"
                {...register('beltDegree', {
                  valueAsNumber: true,
                  min: { value: 0, message: 'Mínimo 0' },
                  max: { value: beltData?.maxDegrees ?? 4, message: `Máximo ${beltData?.maxDegrees ?? 4}` },
                })}
                min={0}
                max={beltData?.maxDegrees ?? 4}
                disabled={!selectedBelt || (beltData?.maxDegrees ?? 4) === 0}
                className={`${inputClass} disabled:opacity-40 disabled:cursor-not-allowed`}
              />
              {errors.beltDegree && <p className={errorClass}>{errors.beltDegree.message}</p>}
            </div>
          </div>
          {selectedBelt && (
            <div className="pt-1">
              <BeltBadge belt={selectedBelt} degree={selectedDegree ?? 0} size="lg" />
            </div>
          )}
        </div>
      )}

      {/* MMA */}
      {showMMA && (
        <div className={sectionClass}>
          <h3 className="text-sm font-bold text-cm-orange uppercase tracking-widest flex items-center gap-2">
            <span className="w-1 h-4 bg-cm-orange rounded-full inline-block" />
            MMA
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Nível</label>
              <select
                {...register('mmaLevel', { required: showMMA ? 'Nível é obrigatório' : false })}
                className={inputClass}
              >
                <option value="">Selecione o nível</option>
                {MMA_LEVELS.map((l) => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
              {errors.mmaLevel && <p className={errorClass}>{errors.mmaLevel.message}</p>}
            </div>
            <div>
              <label className={labelClass}>Categoria de peso</label>
              <select
                {...register('mmaWeightClass', { required: showMMA ? 'Categoria é obrigatória' : false })}
                className={inputClass}
              >
                <option value="">Selecione a categoria</option>
                {MMA_WEIGHT_CLASSES.map((w) => (
                  <option key={w} value={w}>{w}</option>
                ))}
              </select>
              {errors.mmaWeightClass && <p className={errorClass}>{errors.mmaWeightClass.message}</p>}
            </div>
          </div>
          <div className="flex items-center gap-2 p-3 rounded-lg bg-cm-orange/5 border border-cm-orange/20">
            <svg className="w-4 h-4 text-cm-orange flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-xs text-cm-orange">MMA não possui sistema de faixas — o nível é definido pelo professor.</p>
          </div>
        </div>
      )}

      {/* Endereço */}
      <div className={sectionClass}>
        <h3 className="text-sm font-bold text-cm-green-dark uppercase tracking-widest flex items-center gap-2">
          <span className="w-1 h-4 bg-cm-green-dark rounded-full inline-block" />
          Endereço
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className={labelClass}>CEP</label>
            <input
              value={cepDisplay}
              onChange={(e) => setCepDisplay(formatCEP(e.target.value))}
              className={inputClass}
              placeholder="00000-000"
              maxLength={9}
            />
          </div>
          <div className="md:col-span-2">
            <label className={labelClass}>Rua / Avenida</label>
            <input
              {...register('address.street', { required: 'Rua é obrigatória' })}
              className={inputClass}
              placeholder="Rua das Flores"
            />
            {errors.address?.street && <p className={errorClass}>{errors.address.street.message}</p>}
          </div>
          <div>
            <label className={labelClass}>Número</label>
            <input
              {...register('address.number', { required: 'Número é obrigatório' })}
              className={inputClass}
              placeholder="123"
            />
            {errors.address?.number && <p className={errorClass}>{errors.address.number.message}</p>}
          </div>
          <div>
            <label className={labelClass}>Complemento</label>
            <input {...register('address.complement')} className={inputClass} placeholder="Apto 4B" />
          </div>
          <div>
            <label className={labelClass}>Bairro</label>
            <input
              {...register('address.neighborhood', { required: 'Bairro é obrigatório' })}
              className={inputClass}
              placeholder="Centro"
            />
            {errors.address?.neighborhood && <p className={errorClass}>{errors.address.neighborhood.message}</p>}
          </div>
          <div className="md:col-span-2">
            <label className={labelClass}>Cidade</label>
            <input
              {...register('address.city', { required: 'Cidade é obrigatória' })}
              className={inputClass}
              placeholder="São Paulo"
            />
            {errors.address?.city && <p className={errorClass}>{errors.address.city.message}</p>}
          </div>
          <div>
            <label className={labelClass}>Estado</label>
            <select {...register('address.state', { required: 'Estado é obrigatório' })} className={inputClass}>
              <option value="">UF</option>
              {['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'].map((uf) => (
                <option key={uf} value={uf}>{uf}</option>
              ))}
            </select>
            {errors.address?.state && <p className={errorClass}>{errors.address.state.message}</p>}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 justify-end pt-2">
        <button
          type="button"
          onClick={handleCancel}
          className="px-6 py-2.5 rounded-lg border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="px-6 py-2.5 rounded-lg bg-cm-green text-white text-sm font-semibold hover:bg-cm-green-darkest active:scale-95 transition-all shadow-sm"
        >
          {student ? 'Salvar alterações' : 'Cadastrar aluno'}
        </button>
      </div>
    </form>
  )
}
