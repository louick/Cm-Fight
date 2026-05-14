import express from 'express'
import Database from 'better-sqlite3'
import { fileURLToPath } from 'url'
import { dirname, join, resolve } from 'path'
import { existsSync, mkdirSync } from 'fs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const projectRoot = resolve(__dirname, '..')

const dataDir = process.env.DATA_DIR || join(projectRoot, 'server')
if (!existsSync(dataDir)) mkdirSync(dataDir, { recursive: true })
const dbPath = join(dataDir, 'cmfight.db')
const db = new Database(dbPath)
console.log(`[cm-fight] SQLite em ${dbPath}`)

db.exec(`
  CREATE TABLE IF NOT EXISTS students (
    id TEXT PRIMARY KEY,
    data TEXT NOT NULL,
    createdAt TEXT NOT NULL,
    updatedAt TEXT NOT NULL
  )
`)

const app = express()
app.use(express.json({ limit: '20mb' }))

app.get('/api/students', (_req, res) => {
  const rows = db.prepare('SELECT data FROM students ORDER BY createdAt ASC').all()
  res.json(rows.map(r => JSON.parse(r.data)))
})

// Lookup público por CPF — usado pela página /carteirinha (aluno imprime a própria)
app.get('/api/students/by-cpf/:cpf', (req, res) => {
  const digits = String(req.params.cpf).replace(/\D/g, '')
  if (digits.length !== 11) return res.status(400).json({ error: 'CPF inválido' })
  const rows = db.prepare('SELECT data FROM students').all()
  const match = rows.map(r => JSON.parse(r.data)).find(s => String(s.cpf || '').replace(/\D/g, '') === digits)
  if (!match) return res.status(404).json({ error: 'Aluno não encontrado' })
  res.json(match)
})

app.post('/api/students', (req, res) => {
  const student = req.body
  db.prepare('INSERT INTO students (id, data, createdAt, updatedAt) VALUES (?, ?, ?, ?)').run(
    student.id, JSON.stringify(student), student.createdAt, student.updatedAt
  )
  res.status(201).json(student)
})

app.put('/api/students/:id', (req, res) => {
  const student = req.body
  const info = db.prepare('UPDATE students SET data = ?, updatedAt = ? WHERE id = ?').run(
    JSON.stringify(student), student.updatedAt, req.params.id
  )
  if (info.changes === 0) return res.status(404).json({ error: 'Aluno não encontrado' })
  res.json(student)
})

app.delete('/api/students/:id', (req, res) => {
  db.prepare('DELETE FROM students WHERE id = ?').run(req.params.id)
  res.json({ ok: true })
})

const distDir = join(projectRoot, 'dist')
if (existsSync(distDir)) {
  app.use(express.static(distDir))
  app.get(/^(?!\/api).*/, (_req, res) => {
    res.sendFile(join(distDir, 'index.html'))
  })
  console.log(`[cm-fight] Servindo frontend de ${distDir}`)
} else {
  console.log('[cm-fight] dist/ não encontrado — modo API only (dev usa vite separado)')
}

const PORT = process.env.PORT || 3001
app.listen(PORT, '0.0.0.0', () => console.log(`API CM Fight rodando em :${PORT}`))
