'use client'

import { useState } from 'react'
import TaskForm from '@/components/TaskForm'
import type { Task, TaskInput } from '@/lib/tasks/types'

type TaskCardProps = {
  task: Task
  onUpdate: (id: string, values: TaskInput) => Promise<boolean>
  onDelete: (id: string) => Promise<void>
}

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
    <article
      aria-label={task.title}
      className="rounded-lg border border-zinc-200 bg-white p-3 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
    >
      {isEditing ? (
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
      ) : (
        <>
          <h3 className="font-medium break-words">{task.title}</h3>
          {task.description && (
            <p className="mt-1 whitespace-pre-wrap text-sm text-zinc-600 dark:text-zinc-400">
              {task.description}
            </p>
          )}
          <div className="mt-2 flex gap-2 text-sm">
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              disabled={isDeleting}
              className="rounded border border-zinc-300 px-2 py-0.5 disabled:opacity-50 dark:border-zinc-700"
            >
              編集
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting}
              className="rounded border border-red-300 px-2 py-0.5 text-red-600 disabled:opacity-50"
            >
              削除
            </button>
          </div>
        </>
      )}
    </article>
  )
}
