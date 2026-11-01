import type { Database } from '@/lib/supabase/database.types'

type TaskRow = Database['public']['Tables']['tasks']['Row']

export const taskStatuses = ['todo', 'in_progress', 'done'] as const

export type TaskStatus = (typeof taskStatuses)[number]

export type Task = Omit<TaskRow, 'status'> & { status: TaskStatus }

export type TaskInput = {
  title: string
  description: string
  status: TaskStatus
}

export const taskStatusLabels: Record<TaskStatus, string> = {
  todo: 'Todo',
  in_progress: 'In Progress',
  done: 'Done',
}

export const maxTitleLength = 100
export const maxDescriptionLength = 500

export function isTaskStatus(value: string): value is TaskStatus {
  return (taskStatuses as readonly string[]).includes(value)
}

// エラーがあればメッセージを、なければnullを返す
export function validateTaskTitle(title: string): string | null {
  const trimmed = title.trim()
  if (trimmed.length === 0) return 'タイトルを入力してください'
  if ([...trimmed].length > maxTitleLength) {
    return `タイトルは${maxTitleLength}文字以内で入力してください`
  }
  return null
}
