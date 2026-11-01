import { afterEach, expect, test } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import Home from '@/app/page'

afterEach(() => {
  cleanup()
})

test('ホームページに見出しが表示される', () => {
  render(<Home />)
  expect(
    screen.getByRole('heading', { level: 1, name: /To get started/ }),
  ).toBeDefined()
})
