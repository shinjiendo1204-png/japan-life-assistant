import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

const client = new Anthropic()

const DISCLAIMERS = {
  en: '\n\n---\n⚠️ This document is for reference only. Please confirm with the relevant office or a qualified professional before submission or taking action.',
  es: '\n\n---\n⚠️ Este documento es solo de referencia. Por favor, confirme con la oficina correspondiente o un profesional calificado antes de presentarlo o actuar.',
  pt: '\n\n---\n⚠️ Este documento é apenas para referência. Confirme com o escritório relevante ou um profissional qualificado antes de apresentar ou tomar alguma medida.',
}

const CATEGORY_LABELS: Record<string, string> = {
  city_hall: 'city hall / municipal office procedures',
  rental: 'rental contracts and housing',
  workplace: 'workplace communication and emails',
  visa: 'visa and residence procedures',
  tax: 'tax and pension procedures',
  other: 'general life in Japan',
}

const PLAN_LIMITS: Record<string, number> = {
  free: 1,
  standard: 9999,
  pro: 9999,
}

export async function POST(req: NextRequest) {
  // リクエストボディを最初に読む（一度しか読めないため）
  const { input, category, language } = await req.json()

  // ① 認証チェック
  const cookieStore = await cookies()
  const supabaseServer = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: (name) => cookieStore.get(name)?.value } }
  )

  const { data: { user } } = await supabaseServer.auth.getUser()

  if (!user) {
    return NextResponse.json(
      { error: 'Please sign in to use this service.' },
      { status: 401 }
    )
  }

  // ② プロフィール取得
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: profile, error: profileError } = await supabaseAdmin
    .from('profiles')
    .select('plan, usage_count, usage_reset_at')
    .eq('id', user.id)
    .single()

  if (profileError || !profile) {
    return NextResponse.json(
      { error: 'Profile not found.' },
      { status: 404 }
    )
  }

  // ③ 月初リセット
  const now = new Date()
  const resetAt = new Date(profile.usage_reset_at)
  const needsReset =
    now.getMonth() !== resetAt.getMonth() ||
    now.getFullYear() !== resetAt.getFullYear()

  if (needsReset) {
    await supabaseAdmin
      .from('profiles')
      .update({ usage_count: 0, usage_reset_at: now.toISOString() })
      .eq('id', user.id)
    profile.usage_count = 0
  }

  // ④ 使用回数チェック
  const limit = PLAN_LIMITS[profile.plan] ?? 1

  if (profile.usage_count >= limit) {
    const message =
      profile.plan === 'free'
        ? 'You have reached your free plan limit (1 per month). Upgrade to Standard for unlimited access.'
        : 'Usage limit reached. Please contact support.'
    return NextResponse.json({ error: message }, { status: 403 })
  }

  // ⑤ 使用回数を増やす
  await supabaseAdmin
    .from('profiles')
    .update({ usage_count: profile.usage_count + 1 })
    .eq('id', user.id)

  // ⑥ AI生成
  const categoryLabel = CATEGORY_LABELS[category] || 'life in Japan'

  const systemPrompt = `You are a helpful assistant for foreigners living in Japan. 
You specialize in ${categoryLabel}.
The user will write in ${language === 'en' ? 'English' : language === 'es' ? 'Spanish' : 'Portuguese'}.
Always respond in the same language the user wrote in.

Your job is to:
1. Explain what the user needs to know clearly and simply
2. If they need a document or letter in Japanese, provide a draft they can use
3. List what documents or items they need to bring
4. Give step-by-step guidance when needed

Be practical, clear, and supportive. The user may be stressed about bureaucratic procedures.
Never provide legal advice — provide practical guidance and document drafts only.`

  const message = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: `Category: ${categoryLabel}\n\n${input}`,
      },
    ],
    system: systemPrompt,
  })

  const result =
    message.content[0].type === 'text'
      ? message.content[0].text +
        (DISCLAIMERS[language as keyof typeof DISCLAIMERS] || DISCLAIMERS.en)
      : 'Could not generate response.'

  return NextResponse.json({ result })
}