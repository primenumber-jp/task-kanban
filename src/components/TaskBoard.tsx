'use client'

import { useEffect, useState } from 'react'
import {
  Circle,
  CircleAlert,
  CircleCheck,
  CircleDashed,
  Loader2,
  Plus,
  type LucideIcon,
} from 'lucide-react'
import TaskCard from '@/components/TaskCard'
import TaskForm from '@/components/TaskForm'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { createTask, deleteTask, fetchTasks, updateTask } from '@/lib/tasks/taskApi'
import {
  taskStatuses,
  taskStatusLabels,
  type Task,
  type TaskInput,
  type TaskStatus,
} from '@/lib/tasks/types'

const statusIcons: Record<TaskStatus, LucideIcon> = {
  todo: Circle,
  in_progress: CircleDashed,
  done: CircleCheck,
}

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

  if (isLoading) {
    return (
      <p className="flex items-center justify-center gap-2 py-24 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" aria-hidden="true" />
        読み込み中...
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {error && (
        <Alert variant="destructive">
          <CircleAlert aria-hidden="true" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <div className="grid items-start gap-6 lg:grid-cols-[18rem_1fr]">
        <Card className="lg:sticky lg:top-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="size-4" aria-hidden="true" />
              新しいタスク
            </CardTitle>
            <CardDescription>追加したタスクは Todo 列に入ります</CardDescription>
          </CardHeader>
          <CardContent>
            <TaskForm
              label="タスクを追加"
              submitLabel="追加"
              resetOnSuccess
              onSubmit={handleCreate}
            />
          </CardContent>
        </Card>
        <div className="grid items-start gap-4 md:grid-cols-3">
          {taskStatuses.map((status) => {
            const headingId = `column-${status}`
            const columnTasks = tasks.filter((task) => task.status === status)
            const StatusIcon = statusIcons[status]
            return (
              <section
                key={status}
                aria-labelledby={headingId}
                className="flex flex-col gap-3 rounded-xl bg-muted/60 p-3 ring-1 ring-foreground/5"
              >
                <div className="flex items-center gap-2 px-1">
                  <StatusIcon className="size-4 text-muted-foreground" aria-hidden="true" />
                  <h2 id={headingId} className="text-sm font-semibold">
                    {taskStatusLabels[status]}
                  </h2>
                  <Badge variant="secondary" className="ml-auto tabular-nums ring-1 ring-foreground/10">
                    {columnTasks.length}
                  </Badge>
                </div>
                {columnTasks.length === 0 ? (
                  <p className="rounded-lg border border-dashed border-foreground/15 py-8 text-center text-sm text-muted-foreground">
                    タスクはありません
                  </p>
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
    </div>
  )
}
