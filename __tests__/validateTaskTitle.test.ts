import { expect, test } from 'vitest'
import { validateTaskTitle } from '@/lib/tasks/types'

test('タイトルが空文字だと入力を求めるエラーを返す', () => {
  expect(validateTaskTitle('')).toBe('タイトルを入力してください')
})

test('タイトルが空白のみだと入力を求めるエラーを返す', () => {
  expect(validateTaskTitle('   　')).toBe('タイトルを入力してください')
})

test('タイトルが1文字ならエラーにならない', () => {
  expect(validateTaskTitle('a')).toBeNull()
})

test('タイトルが100文字ならエラーにならない', () => {
  expect(validateTaskTitle('あ'.repeat(100))).toBeNull()
})

test('タイトルが101文字だと文字数超過のエラーを返す', () => {
  expect(validateTaskTitle('あ'.repeat(101))).toBe(
    'タイトルは100文字以内で入力してください',
  )
})

test('前後の空白を除いて100文字ならエラーにならない', () => {
  expect(validateTaskTitle(`  ${'あ'.repeat(100)}  `)).toBeNull()
})
