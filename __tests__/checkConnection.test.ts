import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import { checkSupabaseConnection } from '@/lib/supabase/checkConnection'

const testUrl = 'https://example.supabase.co'
const testKey = 'sb_publishable_test'

beforeEach(() => {
  vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', testUrl)
  vi.stubEnv('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY', testKey)
})

afterEach(() => {
  vi.unstubAllEnvs()
  vi.unstubAllGlobals()
})

test('Supabaseが200を返すと接続成功になる', async () => {
  const fetchMock = vi.fn().mockResolvedValue(new Response('{}', { status: 200 }))
  vi.stubGlobal('fetch', fetchMock)

  const result = await checkSupabaseConnection()

  expect(result).toEqual({ ok: true, url: testUrl })
  expect(fetchMock).toHaveBeenCalledWith(`${testUrl}/auth/v1/health`, {
    headers: { apikey: testKey },
  })
})

test('キーが無効でSupabaseが401を返すと接続失敗になる', async () => {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue(
      new Response('', { status: 401, statusText: 'Unauthorized' }),
    ),
  )

  const result = await checkSupabaseConnection()

  expect(result).toEqual({ ok: false, message: 'HTTP 401 Unauthorized' })
})

test('ネットワークエラーが起きると接続失敗になる', async () => {
  vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('fetch failed')))

  const result = await checkSupabaseConnection()

  expect(result).toEqual({ ok: false, message: 'fetch failed' })
})

test('環境変数が未設定だとリクエストせずに接続失敗になる', async () => {
  vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', '')
  const fetchMock = vi.fn()
  vi.stubGlobal('fetch', fetchMock)

  const result = await checkSupabaseConnection()

  expect(result.ok).toBe(false)
  expect(fetchMock).not.toHaveBeenCalled()
})
