import { createBrowserClient } from '@supabase/ssr'
import { getSupabaseEnv } from './env'

// クライアントコンポーネント用のSupabaseクライアント
export function createClient() {
  const { url, publishableKey } = getSupabaseEnv()
  return createBrowserClient(url, publishableKey)
}
