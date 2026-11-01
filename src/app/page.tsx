import TaskBoard from '@/components/TaskBoard'

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-10">
      <h1 className="text-2xl font-semibold">タスクカンバン</h1>
      <TaskBoard />
    </main>
  )
}
