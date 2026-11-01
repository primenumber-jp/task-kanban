'use client'

import { useId, useState, type FormEvent } from 'react'
import {
  maxDescriptionLength,
  taskStatuses,
  taskStatusLabels,
  validateTaskTitle,
  type TaskInput,
} from '@/lib/tasks/types'

type TaskFormProps = {
  label: string
  submitLabel: string
  initialValues?: TaskInput
  showStatus?: boolean
  resetOnSuccess?: boolean
  // 成功したらtrueを返す
  onSubmit: (values: TaskInput) => Promise<boolean>
  onCancel?: () => void
}

const emptyValues: TaskInput = { title: '', description: '', status: 'todo' }

export default function TaskForm({
  label,
  submitLabel,
  initialValues = emptyValues,
  showStatus = false,
  resetOnSuccess = false,
  onSubmit,
  onCancel,
}: TaskFormProps) {
  const id = useId()
  const [values, setValues] = useState<TaskInput>(initialValues)
  const [validationError, setValidationError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const error = validateTaskTitle(values.title)
    setValidationError(error)
    if (error) return

    setIsSubmitting(true)
    const succeeded = await onSubmit(values)
    setIsSubmitting(false)
    if (succeeded && resetOnSuccess) setValues(emptyValues)
  }

  return (
    <form aria-label={label} onSubmit={handleSubmit} className="flex flex-col gap-2" noValidate>
      <label htmlFor={`${id}-title`} className="text-sm font-medium">
        タイトル
      </label>
      <input
        id={`${id}-title`}
        value={values.title}
        onChange={(e) => setValues({ ...values, title: e.target.value })}
        className="rounded border border-zinc-300 px-2 py-1 dark:border-zinc-700 dark:bg-zinc-900"
      />
      <label htmlFor={`${id}-description`} className="text-sm font-medium">
        説明
      </label>
      <textarea
        id={`${id}-description`}
        value={values.description}
        maxLength={maxDescriptionLength}
        onChange={(e) => setValues({ ...values, description: e.target.value })}
        className="rounded border border-zinc-300 px-2 py-1 dark:border-zinc-700 dark:bg-zinc-900"
      />
      {showStatus && (
        <>
          <label htmlFor={`${id}-status`} className="text-sm font-medium">
            ステータス
          </label>
          <select
            id={`${id}-status`}
            value={values.status}
            onChange={(e) =>
              setValues({
                ...values,
                status: taskStatuses.find((s) => s === e.target.value) ?? 'todo',
              })
            }
            className="rounded border border-zinc-300 px-2 py-1 dark:border-zinc-700 dark:bg-zinc-900"
          >
            {taskStatuses.map((status) => (
              <option key={status} value={status}>
                {taskStatusLabels[status]}
              </option>
            ))}
          </select>
        </>
      )}
      {validationError && (
        <p role="alert" className="text-sm text-red-600">
          {validationError}
        </p>
      )}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded bg-zinc-900 px-3 py-1 text-white disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
        >
          {submitLabel}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="rounded border border-zinc-300 px-3 py-1 disabled:opacity-50 dark:border-zinc-700"
          >
            キャンセル
          </button>
        )}
      </div>
    </form>
  )
}
