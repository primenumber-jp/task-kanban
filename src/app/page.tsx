import { SquareKanban } from 'lucide-react'
import TaskBoard from '@/components/TaskBoard'

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-8 px-4 py-10 sm:px-6">
      <header className="flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
          <SquareKanban className="size-5" aria-hidden="true" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">タスクカンバン</h1>
          <p className="text-sm text-muted-foreground">
            タスクを Todo・In Progress・Done で管理します
          </p>
        </div>
      </header>
      <TaskBoard />
    </main>
  )
}
