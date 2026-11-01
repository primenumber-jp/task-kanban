'use client'

import { useId, useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select'
import { Textarea } from '@/components/ui/textarea'
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

  const errorId = `${id}-error`

  return (
    <form aria-label={label} onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
      <div className="flex flex-col gap-2">
        <Label htmlFor={`${id}-title`}>タイトル</Label>
        <Input
          id={`${id}-title`}
          value={values.title}
          placeholder="例：デザインレビューの準備"
          aria-invalid={validationError ? true : undefined}
          aria-describedby={validationError ? errorId : undefined}
          onChange={(e) => setValues({ ...values, title: e.target.value })}
        />
        {validationError && (
          <p id={errorId} role="alert" className="text-xs text-destructive">
            {validationError}
          </p>
        )}
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor={`${id}-description`}>説明</Label>
        <Textarea
          id={`${id}-description`}
          value={values.description}
          maxLength={maxDescriptionLength}
          placeholder="詳細やメモ（任意）"
          className="max-h-48"
          onChange={(e) => setValues({ ...values, description: e.target.value })}
        />
      </div>
      {showStatus && (
        <div className="flex flex-col gap-2">
          <Label htmlFor={`${id}-status`}>ステータス</Label>
          <NativeSelect
            id={`${id}-status`}
            value={values.status}
            className="w-full"
            onChange={(e) =>
              setValues({
                ...values,
                status: taskStatuses.find((s) => s === e.target.value) ?? 'todo',
              })
            }
          >
            {taskStatuses.map((status) => (
              <NativeSelectOption key={status} value={status}>
                {taskStatusLabels[status]}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </div>
      )}
      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel} disabled={isSubmitting}>
            キャンセル
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting} className={onCancel ? undefined : 'w-full'}>
          {submitLabel}
        </Button>
      </div>
    </form>
  )
}
