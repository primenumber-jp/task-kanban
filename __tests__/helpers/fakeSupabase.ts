import type { Database } from '@/lib/supabase/database.types'

type TaskRow = Database['public']['Tables']['tasks']['Row']
type TaskInsert = Database['public']['Tables']['tasks']['Insert']
type TaskUpdate = Database['public']['Tables']['tasks']['Update']
type FakeError = { message: string }
type Operation = 'select' | 'insert' | 'update' | 'delete'

// テスト用: メモリ上でtasksテーブルを再現する簡易Supabaseクライアント
export function createFakeSupabase(initialRows: TaskRow[] = []) {
  let rows = [...initialRows]
  let nextId = 1
  const failOn = new Set<Operation>()
  const calls: Record<Operation, number> = {
    select: 0,
    insert: 0,
    update: 0,
    delete: 0,
  }

  const failure = (operation: Operation): FakeError | null =>
    failOn.has(operation) ? { message: `${operation} failed` } : null

  const tasksTable = {
    select: () => ({
      order: async () => {
        calls.select++
        const error = failure('select')
        return error
          ? { data: null, error }
          : {
              data: [...rows].sort((a, b) =>
                a.created_at.localeCompare(b.created_at),
              ),
              error: null,
            }
      },
    }),
    insert: (values: TaskInsert) => ({
      select: () => ({
        single: async () => {
          calls.insert++
          const error = failure('insert')
          if (error) return { data: null, error }
          const now = new Date(2026, 0, 1, 0, 0, nextId).toISOString()
          const row: TaskRow = {
            id: `new-${nextId++}`,
            title: values.title,
            description: values.description ?? '',
            status: values.status ?? 'todo',
            created_at: now,
            updated_at: now,
          }
          rows = [...rows, row]
          return { data: row, error: null }
        },
      }),
    }),
    update: (values: TaskUpdate) => ({
      eq: (_column: 'id', id: string) => ({
        select: () => ({
          single: async () => {
            calls.update++
            const error = failure('update')
            const current = rows.find((row) => row.id === id)
            if (error || !current) {
              return { data: null, error: error ?? { message: 'not found' } }
            }
            const updated: TaskRow = { ...current, ...values }
            rows = rows.map((row) => (row.id === id ? updated : row))
            return { data: updated, error: null }
          },
        }),
      }),
    }),
    delete: () => ({
      eq: async (_column: 'id', id: string) => {
        calls.delete++
        const error = failure('delete')
        if (error) return { error }
        rows = rows.filter((row) => row.id !== id)
        return { error: null }
      },
    }),
  }

  return {
    client: { from: () => tasksTable },
    failOn,
    calls,
    getRows: () => rows,
  }
}

export function buildTask(overrides: Partial<TaskRow> = {}): TaskRow {
  return {
    id: 'task-1',
    title: 'サンプルタスク',
    description: '',
    status: 'todo',
    created_at: '2025-12-01T00:00:00.000Z',
    updated_at: '2025-12-01T00:00:00.000Z',
    ...overrides,
  }
}
