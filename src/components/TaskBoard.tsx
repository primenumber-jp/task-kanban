'use client'

import { useEffect, useState } from 'react'
import TaskCard from '@/components/TaskCard'
import TaskForm from '@/components/TaskForm'
import { createTask, deleteTask, fetchTasks, updateTask } from '@/lib/tasks/taskApi'
import {
  taskStatuses,
  taskStatusLabels,
  type Task,
  type TaskInput,
} from '@/lib/tasks/types'

export default function TaskBoard() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let ignore = false
    fetchTasks()
      .then((loaded) => {
        if (!ignore) setTasks(loaded)
      })
      .catch(() => {
        if (!ignore) setError('タスクの取得に失敗しました')
      })
      .finally(() => {
        if (!ignore) setIsLoading(false)
      })
    return () => {
      ignore = true
    }
  }, [])

  const handleCreate = async (values: TaskInput) => {
    try {
      const created = await createTask(values)
      setTasks((current) => [...current, created])
      setError(null)
      return true
    } catch {
      setError('タスクの追加に失敗しました')
      return false
    }
  }

  const handleUpdate = async (id: string, values: TaskInput) => {
    try {
      const updated = await updateTask(id, values)
      setTasks((current) =>
        current.map((task) => (task.id === id ? updated : task)),
      )
      setError(null)
      return true
    } catch {
      setError('タスクの更新に失敗しました')
      return false
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteTask(id)
      setTasks((current) => current.filter((task) => task.id !== id))
      setError(null)
    } catch {
      setError('タスクの削除に失敗しました')
    }
  }

  if (isLoading) return <p>読み込み中...</p>

  return (
    <div className="flex flex-col gap-6">
      {error && (
        <p role="alert" className="rounded bg-red-50 px-3 py-2 text-red-700 dark:bg-red-950 dark:text-red-300">
          {error}
        </p>
      )}
      <div className="max-w-md">
        <TaskForm
          label="タスクを追加"
          submitLabel="追加"
          resetOnSuccess
          onSubmit={handleCreate}
        />
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {taskStatuses.map((status) => {
          const headingId = `column-${status}`
          const columnTasks = tasks.filter((task) => task.status === status)
          return (
            <section
              key={status}
              aria-labelledby={headingId}
              className="flex flex-col gap-3 rounded-lg bg-zinc-100 p-3 dark:bg-zinc-900"
            >
              <h2 id={headingId} className="font-semibold">
                {taskStatusLabels[status]}
              </h2>
              {columnTasks.length === 0 ? (
                <p className="text-sm text-zinc-500">タスクはありません</p>
              ) : (
                columnTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onUpdate={handleUpdate}
                    onDelete={handleDelete}
                  />
                ))
              )}
            </section>
          )
        })}
      </div>
    </div>
  )
}
