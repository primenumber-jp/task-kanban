import { getSupabaseEnv } from './env'

export type ConnectionResult =
  | { ok: true; url: string }
  | { ok: false; message: string }

// SupabaseのAuthヘルスチェックAPIで、URLとキーが有効か確認する
export async function checkSupabaseConnection(): Promise<ConnectionResult> {
  let url: string
  let publishableKey: string
  try {
    ;({ url, publishableKey } = getSupabaseEnv())
  } catch (error) {
    return { ok: false, message: (error as Error).message }
  }

  try {
    const response = await fetch(`${url}/auth/v1/health`, {
      headers: { apikey: publishableKey },
    })
    if (!response.ok) {
      return {
        ok: false,
        message: `HTTP ${response.status} ${response.statusText}`,
      }
    }
    return { ok: true, url }
  } catch (error) {
    return { ok: false, message: (error as Error).message }
  }
}
