import { v4 as uuidv4 } from 'uuid'
import type { Student, StudentFormData } from '../types/student'

export async function getStudents(): Promise<Student[]> {
  const res = await fetch('/api/students')
  if (!res.ok) throw new Error('Falha ao buscar alunos')
  return res.json()
}

export async function createStudent(data: StudentFormData): Promise<Student> {
  const student: Student = {
    ...data,
    id: uuidv4(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  const res = await fetch('/api/students', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(student),
  })
  if (!res.ok) throw new Error('Falha ao cadastrar aluno')
  return res.json()
}

export async function updateStudent(id: string, data: StudentFormData): Promise<Student> {
  const student: Partial<Student> = {
    ...data,
    id,
    updatedAt: new Date().toISOString(),
  }
  const res = await fetch(`/api/students/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(student),
  })
  if (!res.ok) throw new Error('Falha ao atualizar aluno')
  return res.json()
}

export async function deleteStudent(id: string): Promise<void> {
  const res = await fetch(`/api/students/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error('Falha ao remover aluno')
}
