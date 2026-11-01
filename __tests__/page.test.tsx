import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import Home from '@/app/page'
import { createFakeSupabase } from './helpers/fakeSupabase'

vi.mock('@supabase/ssr', () => ({
  createBrowserClient: () => createFakeSupabase([]).client,
}))

beforeEach(() => {
  vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://example.supabase.co')
  vi.stubEnv('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY', 'sb_publishable_test')
})

afterEach(() => {
  cleanup()
  vi.unstubAllEnvs()
})

test('ホームページに見出しが表示される', async () => {
  render(<Home />)
  expect(
    screen.getByRole('heading', { level: 1, name: 'タスクカンバン' }),
  ).toBeDefined()
  expect(await screen.findByRole('region', { name: 'Todo' })).toBeDefined()
})
