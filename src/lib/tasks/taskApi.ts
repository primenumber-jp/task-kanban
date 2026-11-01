import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/lib/supabase/database.types'
import { isTaskStatus, type Task, type TaskInput } from './types'

type TaskRow = Database['public']['Tables']['tasks']['Row']

function toTask(row: TaskRow): Task {
  return { ...row, status: isTaskStatus(row.status) ? row.status : 'todo' }
}

export async function fetchTasks(): Promise<Task[]> {
  const { data, error } = await createClient()
    .from('tasks')
    .select('*')
    .order('created_at', { ascending: true })
  if (error) throw new Error(error.message)
  return data.map(toTask)
}

export async function createTask(
  input: Omit<TaskInput, 'status'>,
): Promise<Task> {
  const { data, error } = await createClient()
    .from('tasks')
    .insert({ title: input.title.trim(), description: input.description })
    .select()
    .single()
  if (error) throw new Error(error.message)
  return toTask(data)
}

export async function updateTask(id: string, input: TaskInput): Promise<Task> {
  const { data, error } = await createClient()
    .from('tasks')
    .update({ ...input, title: input.title.trim() })
    .eq('id', id)
    .select()
    .single()
  if (error) throw new Error(error.message)
  return toTask(data)
}

export async function deleteTask(id: string): Promise<void> {
  const { error } = await createClient().from('tasks').delete().eq('id', id)
  if (error) throw new Error(error.message)
}
