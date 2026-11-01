import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import TaskBoard from '@/components/TaskBoard'
import { buildTask, createFakeSupabase } from './helpers/fakeSupabase'

type FakeSupabase = ReturnType<typeof createFakeSupabase>

const holder = vi.hoisted(() => ({ fake: null as FakeSupabase | null }))

vi.mock('@supabase/ssr', () => ({
  createBrowserClient: () => holder.fake?.client,
}))

function setup(rows = [buildTask()]) {
  holder.fake = createFakeSupabase(rows)
  const user = userEvent.setup()
  render(<TaskBoard />)
  return { user, fake: holder.fake }
}

const column = (name: 'Todo' | 'In Progress' | 'Done') =>
  screen.getByRole('region', { name })

const card = (title: string) => screen.getByRole('article', { name: title })

const addForm = () => screen.getByRole('form', { name: 'タスクを追加' })

async function waitForLoaded() {
  await screen.findByRole('region', { name: 'Todo' })
}

beforeEach(() => {
  vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://example.supabase.co')
  vi.stubEnv('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY', 'sb_publishable_test')
})

afterEach(() => {
  cleanup()
  holder.fake = null
  vi.unstubAllEnvs()
  vi.restoreAllMocks()
})

describe('一覧表示', () => {
  test('読み込み中はローディング表示が出る', () => {
    setup()
    expect(screen.getByText('読み込み中...')).toBeDefined()
  })

  test('各タスクがステータスに対応する列に表示される', async () => {
    setup([
      buildTask({ id: '1', title: '未着手のタスク', status: 'todo' }),
      buildTask({ id: '2', title: '進行中のタスク', status: 'in_progress' }),
      buildTask({ id: '3', title: '完了したタスク', status: 'done' }),
    ])
    await waitForLoaded()

    expect(within(column('Todo')).getByText('未着手のタスク')).toBeDefined()
    expect(
      within(column('In Progress')).getByText('進行中のタスク'),
    ).toBeDefined()
    expect(within(column('Done')).getByText('完了したタスク')).toBeDefined()
  })

  test('タスクが0件だと全ての列に空の表示が出る', async () => {
    setup([])
    await waitForLoaded()

    expect(screen.getAllByText('タスクはありません')).toHaveLength(3)
  })

  test('取得に失敗するとエラーメッセージが表示される', async () => {
    holder.fake = createFakeSupabase([])
    holder.fake.failOn.add('select')
    render(<TaskBoard />)

    expect((await screen.findByRole('alert')).textContent).toBe(
      'タスクの取得に失敗しました',
    )
  })
})

describe('追加', () => {
  test('タイトルを入力して追加するとTodo列にすぐ表示されフォームが空になる', async () => {
    const { user } = setup([])
    await waitForLoaded()

    const titleInput = within(addForm()).getByLabelText('タイトル')
    await user.type(titleInput, '新しいタスク')
    await user.type(within(addForm()).getByLabelText('説明'), '詳細メモ')
    await user.click(within(addForm()).getByRole('button', { name: '追加' }))

    const added = await within(column('Todo')).findByRole('article', {
      name: '新しいタスク',
    })
    expect(within(added).getByText('詳細メモ')).toBeDefined()
    expect((titleInput as HTMLInputElement).value).toBe('')
  })

  test('タイトルが空のまま追加するとエラーになりDBへ送信されない', async () => {
    const { user, fake } = setup([])
    await waitForLoaded()

    await user.click(within(addForm()).getByRole('button', { name: '追加' }))

    expect(within(addForm()).getByRole('alert').textContent).toBe(
      'タイトルを入力してください',
    )
    expect(fake.calls.insert).toBe(0)
  })

  test('タイトルが空白のみだとエラーになりDBへ送信されない', async () => {
    const { user, fake } = setup([])
    await waitForLoaded()

    await user.type(within(addForm()).getByLabelText('タイトル'), '   ')
    await user.click(within(addForm()).getByRole('button', { name: '追加' }))

    expect(within(addForm()).getByRole('alert').textContent).toBe(
      'タイトルを入力してください',
    )
    expect(fake.calls.insert).toBe(0)
  })

  test('タイトルが100文字なら追加できる', async () => {
    const { user } = setup([])
    await waitForLoaded()
    const title = 'あ'.repeat(100)

    await user.type(within(addForm()).getByLabelText('タイトル'), title)
    await user.click(within(addForm()).getByRole('button', { name: '追加' }))

    expect(
      await within(column('Todo')).findByRole('article', { name: title }),
    ).toBeDefined()
  })

  test('タイトルが101文字だとエラーになりDBへ送信されない', async () => {
    const { user, fake } = setup([])
    await waitForLoaded()

    await user.type(
      within(addForm()).getByLabelText('タイトル'),
      'あ'.repeat(101),
    )
    await user.click(within(addForm()).getByRole('button', { name: '追加' }))

    expect(within(addForm()).getByRole('alert').textContent).toBe(
      'タイトルは100文字以内で入力してください',
    )
    expect(fake.calls.insert).toBe(0)
  })

  test('DBへの追加に失敗するとエラーが表示され一覧に追加されない', async () => {
    const { user, fake } = setup([])
    await waitForLoaded()
    fake.failOn.add('insert')

    await user.type(within(addForm()).getByLabelText('タイトル'), '失敗するタスク')
    await user.click(within(addForm()).getByRole('button', { name: '追加' }))

    expect((await screen.findByRole('alert')).textContent).toBe(
      'タスクの追加に失敗しました',
    )
    expect(screen.queryByRole('article', { name: '失敗するタスク' })).toBeNull()
  })
})

describe('編集', () => {
  test('タイトルと説明を変更して保存するとすぐ一覧に反映される', async () => {
    const { user } = setup([buildTask({ title: '元のタイトル' })])
    await waitForLoaded()

    await user.click(within(card('元のタイトル')).getByRole('button', { name: '編集' }))
    const editing = card('元のタイトル')
    const titleInput = within(editing).getByLabelText('タイトル')
    await user.clear(titleInput)
    await user.type(titleInput, '新しいタイトル')
    await user.type(within(editing).getByLabelText('説明'), '追記した説明')
    await user.click(within(editing).getByRole('button', { name: '保存' }))

    const updated = await screen.findByRole('article', { name: '新しいタイトル' })
    expect(within(updated).getByText('追記した説明')).toBeDefined()
    expect(screen.queryByRole('article', { name: '元のタイトル' })).toBeNull()
  })

  test('ステータスを順に進めると列を移動し、Todoに戻すと元の列に戻る', async () => {
    const { user } = setup([buildTask({ title: '移動するタスク' })])
    await waitForLoaded()

    const changeStatus = async (label: string) => {
      await user.click(
        within(card('移動するタスク')).getByRole('button', { name: '編集' }),
      )
      const editing = card('移動するタスク')
      await user.selectOptions(within(editing).getByLabelText('ステータス'), label)
      await user.click(within(editing).getByRole('button', { name: '保存' }))
    }

    await changeStatus('In Progress')
    expect(
      await within(column('In Progress')).findByRole('article', { name: '移動するタスク' }),
    ).toBeDefined()

    await changeStatus('Done')
    expect(
      await within(column('Done')).findByRole('article', { name: '移動するタスク' }),
    ).toBeDefined()

    await changeStatus('Todo')
    expect(
      await within(column('Todo')).findByRole('article', { name: '移動するタスク' }),
    ).toBeDefined()
    expect(within(column('Done')).queryByRole('article')).toBeNull()
  })

  test('編集中にキャンセルすると変更が破棄され元の表示に戻る', async () => {
    const { user, fake } = setup([buildTask({ title: '元のタイトル' })])
    await waitForLoaded()

    await user.click(within(card('元のタイトル')).getByRole('button', { name: '編集' }))
    const editing = card('元のタイトル')
    await user.type(within(editing).getByLabelText('タイトル'), '途中まで入力')
    await user.click(within(editing).getByRole('button', { name: 'キャンセル' }))

    const restored = card('元のタイトル')
    expect(within(restored).queryByLabelText('タイトル')).toBeNull()
    expect(within(restored).getByRole('button', { name: '編集' })).toBeDefined()
    expect(fake.calls.update).toBe(0)
  })

  test('タイトルを空にして保存するとエラーになりDBへ送信されない', async () => {
    const { user, fake } = setup([buildTask({ title: '元のタイトル' })])
    await waitForLoaded()

    await user.click(within(card('元のタイトル')).getByRole('button', { name: '編集' }))
    const editing = card('元のタイトル')
    await user.clear(within(editing).getByLabelText('タイトル'))
    await user.click(within(editing).getByRole('button', { name: '保存' }))

    expect(within(editing).getByRole('alert').textContent).toBe(
      'タイトルを入力してください',
    )
    expect(fake.calls.update).toBe(0)
  })

  test('DBの更新に失敗するとエラーが表示され元の内容のまま残る', async () => {
    const { user, fake } = setup([buildTask({ title: '元のタイトル' })])
    await waitForLoaded()
    fake.failOn.add('update')

    await user.click(within(card('元のタイトル')).getByRole('button', { name: '編集' }))
    const editing = card('元のタイトル')
    await user.clear(within(editing).getByLabelText('タイトル'))
    await user.type(within(editing).getByLabelText('タイトル'), '新しいタイトル')
    await user.click(within(editing).getByRole('button', { name: '保存' }))

    expect(await screen.findByText('タスクの更新に失敗しました')).toBeDefined()
    expect(card('元のタイトル')).toBeDefined()
    expect(screen.queryByRole('article', { name: '新しいタイトル' })).toBeNull()
  })
})

describe('削除', () => {
  test('確認ダイアログでOKを押すと一覧からすぐ消える', async () => {
    const { user, fake } = setup([buildTask({ title: '消すタスク' })])
    await waitForLoaded()
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true)

    await user.click(within(card('消すタスク')).getByRole('button', { name: '削除' }))

    expect(confirmSpy).toHaveBeenCalledWith('「消すタスク」を削除しますか？')
    expect(await screen.findAllByText('タスクはありません')).toHaveLength(3)
    expect(fake.getRows()).toHaveLength(0)
  })

  test('確認ダイアログでキャンセルするとタスクは残りDBへ送信されない', async () => {
    const { user, fake } = setup([buildTask({ title: '残すタスク' })])
    await waitForLoaded()
    vi.spyOn(window, 'confirm').mockReturnValue(false)

    await user.click(within(card('残すタスク')).getByRole('button', { name: '削除' }))

    expect(card('残すタスク')).toBeDefined()
    expect(fake.calls.delete).toBe(0)
  })

  test('DBの削除に失敗するとエラーが表示されタスクは残る', async () => {
    const { user, fake } = setup([buildTask({ title: '残るタスク' })])
    await waitForLoaded()
    fake.failOn.add('delete')
    vi.spyOn(window, 'confirm').mockReturnValue(true)

    await user.click(within(card('残るタスク')).getByRole('button', { name: '削除' }))

    expect((await screen.findByRole('alert')).textContent).toBe(
      'タスクの削除に失敗しました',
    )
    expect(card('残るタスク')).toBeDefined()
  })
})
