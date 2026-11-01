'use client'

import { useState } from 'react'
import { Pencil, Trash2 } from 'lucide-react'
import TaskForm from '@/components/TaskForm'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { Task, TaskInput } from '@/lib/tasks/types'

type TaskCardProps = {
  task: Task
  onUpdate: (id: string, values: TaskInput) => Promise<boolean>
  onDelete: (id: string) => Promise<void>
}

const dateFormatter = new Intl.DateTimeFormat('ja-JP', {
  month: 'short',
  day: 'numeric',
})

export default function TaskCard({ task, onUpdate, onDelete }: TaskCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleUpdate = async (values: TaskInput) => {
    const succeeded = await onUpdate(task.id, values)
    if (succeeded) setIsEditing(false)
    return succeeded
  }

  const handleDelete = async () => {
    if (!window.confirm(`「${task.title}」を削除しますか？`)) return
    setIsDeleting(true)
    await onDelete(task.id)
    setIsDeleting(false)
  }

  return (
    <article aria-label={task.title}>
      {isEditing ? (
        <Card className="ring-2 ring-ring/40">
          <CardContent>
            <TaskForm
              label={`「${task.title}」を編集`}
              submitLabel="保存"
              showStatus
              initialValues={{
                title: task.title,
                description: task.description,
                status: task.status,
              }}
              onSubmit={handleUpdate}
              onCancel={() => setIsEditing(false)}
            />
          </CardContent>
        </Card>
      ) : (
        <Card
          size="sm"
          className="transition-shadow hover:shadow-md data-[deleting=true]:opacity-60"
          data-deleting={isDeleting}
        >
          <CardHeader>
            <CardTitle className="break-words">{task.title}</CardTitle>
            {task.description && (
              <CardDescription className="whitespace-pre-wrap break-words">
                {task.description}
              </CardDescription>
            )}
          </CardHeader>
          <CardContent className="flex items-center justify-between gap-2">
            <time dateTime={task.created_at} className="text-xs text-muted-foreground">
              {dateFormatter.format(new Date(task.created_at))}
            </time>
            <div className="flex gap-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsEditing(true)}
                disabled={isDeleting}
                className="text-muted-foreground"
              >
                <Pencil />
                編集
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                disabled={isDeleting}
                className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
              >
                <Trash2 />
                削除
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </article>
  )
}
