import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

const client = new Anthropic()

const DISCLAIMERS = {
  en: '\n\n---\n⚠️ This analysis is for reference only. Please confirm with the relevant office or a qualified professional before taking action.',
  es: '\n\n---\n⚠️ Este análisis es solo de referencia. Por favor, confirme con la oficina correspondiente o un profesional antes de actuar.',
  pt: '\n\n---\n⚠️ Esta análise é apenas para referência. Confirme com o escritório relevante ou um profissional antes de agir.',
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const language = (formData.get('language') as string) || 'en'
    const text = formData.get('text') as string | null

    // 認証チェック
    const cookieStore = await cookies()
    const supabaseServer = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { get: (name) => cookieStore.get(name)?.value } }
    )
    const { data: { user } } = await supabaseServer.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Please sign in.' }, { status: 401 })
    }

    // プロフィール・使用回数チェック
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('plan, usage_count, usage_reset_at')
      .eq('id', user.id)
      .single()

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found.' }, { status: 404 })
    }

    // 月初リセット
    const now = new Date()
    const resetAt = new Date(profile.usage_reset_at)
    if (now.getMonth() !== resetAt.getMonth() || now.getFullYear() !== resetAt.getFullYear()) {
      await supabaseAdmin
        .from('profiles')
        .update({ usage_count: 0, usage_reset_at: now.toISOString() })
        .eq('id', user.id)
      profile.usage_count = 0
    }

    // 使用回数制限
    const limits: Record<string, number> = { free: 1, standard: 9999, pro: 9999 }
    const limit = limits[profile.plan] ?? 1
    if (profile.usage_count >= limit) {
      return NextResponse.json({
        error: profile.plan === 'free'
          ? 'FREE_LIMIT_REACHED'
          : 'Usage limit reached.'
      }, { status: 403 })
    }

    // 使用回数更新
    await supabaseAdmin
      .from('profiles')
      .update({ usage_count: profile.usage_count + 1 })
      .eq('id', user.id)

    const langName = language === 'en' ? 'English' : language === 'es' ? 'Spanish' : 'Portuguese'

    const systemPrompt = `You are SortJapan, an expert assistant specialized in helping foreigners living in Japan understand Japanese official documents, mail, and paperwork.

Respond ONLY in ${langName}. Never mix languages in your response except for Japanese document titles or proper nouns.

## Your expertise includes:

### Common Japanese documents you may encounter:
- 住民税通知書 (Resident tax notice) — Annual tax bill, payable at convenience stores or by bank transfer. Usually arrives May-June.
- 国民健康保険 (National Health Insurance) — Monthly premium notice, sent to household head.
- 国民年金 (National Pension) — Monthly payment notice (~¥16,000/month). Blue envelope = regular notice. Ignoring causes penalties.
- 督促状 (Payment reminder/Final notice) — URGENT. Red or pink envelope = overdue payment. Must act immediately.
- 差押予告通知 (Pre-seizure notice) — CRITICAL. Risk of asset seizure. Consult specialist immediately.
- 転入届/転出届 (Move-in/Move-out notice) — Must register new address at city hall within 14 days of moving.
- 確定申告 (Tax return) — Annual filing, usually February-March.
- 在留カード更新 (Residence card renewal) — Must renew before expiry date shown on card.
- 賃貸契約書 (Rental contract) — Key points: 礼金(key money), 敷金(deposit), 解約予告(cancellation notice period).
- 給与明細 (Pay slip) — Breakdown of salary, deductions, social insurance.
- NHK受信料 (NHK fee) — TV license fee notice. Optional if you have no TV.
- 粗大ごみ (Bulky waste) — Application for large item disposal. Must pre-register.

### Payment methods in Japan:
- Convenience store (コンビニ): Most bills have a barcode for 7-Eleven, Lawson, FamilyMart
- Bank transfer (口座振替): Automatic deduction
- City hall (市役所): In-person payment
- Online banking (インターネットバンキング)

### Key rules:
1. Always identify the URGENCY level (Normal / Important / URGENT)
2. Always state the DEADLINE clearly
3. Always explain HOW to pay or respond, step by step
4. Warn about CONSEQUENCES of ignoring (if applicable)
5. Never provide legal advice — provide practical guidance only

## Response format (always use this structure):

**📄 Document type**
[What kind of document is this]

**📋 Summary**
[What it says in simple terms]

**⏰ Deadline & Amount**
[Key date and amount if applicable]

**✅ What you need to do**
[Step-by-step action items]

**💳 How to pay / respond**
[Specific instructions]

**⚠️ Important warnings**
[Anything urgent or unusual]`

    let messageContent: Anthropic.MessageParam['content']

    if (file) {
      const bytes = await file.arrayBuffer()
      const base64 = Buffer.from(bytes).toString('base64')
      const mediaType = file.type as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp' | 'application/pdf'

      if (mediaType === 'application/pdf') {
        messageContent = [
          {
            type: 'document',
            source: {
              type: 'base64',
              media_type: 'application/pdf',
              data: base64,
            },
          } as any,
          {
            type: 'text',
            text: `Please analyze this Japanese document and explain it in ${langName}.`,
          },
        ]
      } else {
        messageContent = [
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: mediaType,
              data: base64,
            },
          },
          {
            type: 'text',
            text: `Please analyze this Japanese document and explain it in ${langName}.`,
          },
        ]
      }
    } else if (text) {
      messageContent = `Please analyze this Japanese document text and explain it in ${langName}:\n\n${text}`
    } else {
      return NextResponse.json({ error: 'No file or text provided.' }, { status: 400 })
    }

    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2048,
      system: systemPrompt,
      messages: [{ role: 'user', content: messageContent }],
    })

    const result =
      message.content[0].type === 'text'
        ? message.content[0].text + (DISCLAIMERS[language as keyof typeof DISCLAIMERS] || DISCLAIMERS.en)
        : 'Could not analyze document.'

    return NextResponse.json({ result })
  } catch (e: any) {
    console.error('Analyze error:', e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}