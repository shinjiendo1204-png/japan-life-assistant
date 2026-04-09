import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const client = new Anthropic()

const DISCLAIMERS: Record<string, string> = {
  en: '\n\n---\n⚠️ This analysis is for reference only. Please confirm with the relevant office or a qualified professional before taking action.',
  es: '\n\n---\n⚠️ Este análisis es solo de referencia. Por favor, confirme con la oficina correspondiente o un profesional antes de actuar.',
  pt: '\n\n---\n⚠️ Esta análise é apenas para referência. Confirme com o escritório relevante ou um profissional antes de agir.',
  zh: '\n\n---\n⚠️ 此分析仅供参考。行动前请向相关机构或专业人士确认。',
  ko: '\n\n---\n⚠️ 이 분석은 참고용입니다. 조치 전에 관련 기관이나 전문가에게 확인하세요.',
  vi: '\n\n---\n⚠️ Phân tích này chỉ để tham khảo. Xác nhận với cơ quan hoặc chuyên gia liên quan trước khi hành động.',
  tl: '\n\n---\n⚠️ Ang pagsusuring ito ay para sa sanggunian lamang. Kumpirmahin sa kaugnay na tanggapan o propesyonal bago kumilos.',
  ne: '\n\n---\n⚠️ यो विश्लेषण केवल सन्दर्भको लागि हो। कार्य गर्नु अघि सम्बन्धित कार्यालय वा विशेषज्ञसँग पुष्टि गर्नुहोस्।',
  id: '\n\n---\n⚠️ Analisis ini hanya untuk referensi. Konfirmasi dengan kantor terkait atau profesional sebelum mengambil tindakan.',
  th: '\n\n---\n⚠️ การวิเคราะห์นี้เพื่อการอ้างอิงเท่านั้น ยืนยันกับสำนักงานที่เกี่ยวข้องหรือผู้เชี่ยวชาญก่อนดำเนินการ',
  my: '\n\n---\n⚠️ ဤစစ်ဆေးချက်သည် ကိုးကားရန်သာဖြစ်သည်။ ဆောင်ရွက်မည်ဆိုပါက သက်ဆိုင်ရာရုံးနှင့် အတည်ပြုပါ။',
  fr: '\n\n---\n⚠️ Cette analyse est à titre indicatif uniquement. Confirmez auprès du bureau compétent ou d\'un professionnel avant d\'agir.',
}

const LANG_NAMES: Record<string, string> = {
  en: 'English',
  es: 'Spanish',
  pt: 'Portuguese',
  zh: 'Chinese (Simplified)',
  ko: 'Korean',
  vi: 'Vietnamese',
  tl: 'Filipino (Tagalog)',
  ne: 'Nepali',
  id: 'Indonesian',
  th: 'Thai',
  my: 'Burmese (Myanmar)',
  fr: 'French',
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const language = (formData.get('language') as string) || 'en'
    const text = formData.get('text') as string | null

    // ① 認証チェック（Authorizationヘッダーからトークンを取得）
    const authHeader = req.headers.get('Authorization')
    const token = authHeader?.replace('Bearer ', '')

    if (!token) {
      return NextResponse.json(
        { error: 'Please sign in to use this service.' },
        { status: 401 }
      )
    }

    // ② Supabaseクライアント（1つだけ作成）
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // トークンでユーザーを確認
    const { data: { user } } = await supabaseAdmin.auth.getUser(token)
    console.log('Auth result:', user?.id ?? 'NOT AUTHENTICATED')

    if (!user) {
      return NextResponse.json(
        { error: 'Please sign in to use this service.' },
        { status: 401 }
      )
    }

    // ③ プロフィール取得
    let { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('plan, usage_count, usage_reset_at')
      .eq('id', user.id)
      .single()

    // profilesに行がなければ自動作成
    if (!profile) {
      await supabaseAdmin.from('profiles').insert({
        id: user.id,
        plan: 'free',
        usage_count: 0,
        usage_reset_at: new Date().toISOString(),
      })
      const { data: newProfile } = await supabaseAdmin
        .from('profiles')
        .select('plan, usage_count, usage_reset_at')
        .eq('id', user.id)
        .single()
      profile = newProfile
    }

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found.' }, { status: 404 })
    }

    console.log('Profile - plan:', profile.plan, 'usage:', profile.usage_count)

    // ④ 月初リセット
    const now = new Date()
    const resetAt = new Date(profile.usage_reset_at)
    if (now.getMonth() !== resetAt.getMonth() || now.getFullYear() !== resetAt.getFullYear()) {
      await supabaseAdmin
        .from('profiles')
        .update({ usage_count: 0, usage_reset_at: now.toISOString() })
        .eq('id', user.id)
      profile.usage_count = 0
    }

    // ⑤ 使用回数制限チェック
    const limits: Record<string, number> = { free: 1, standard: 30 }
    const limit = limits[profile.plan] ?? 1

    if (profile.usage_count >= limit) {
      return NextResponse.json({ error: 'FREE_LIMIT_REACHED' }, { status: 403 })
    }

    // ⑥ 使用回数更新
    await supabaseAdmin
      .from('profiles')
      .update({ usage_count: profile.usage_count + 1 })
      .eq('id', user.id)

    // ⑦ システムプロンプト
    const langName = LANG_NAMES[language] || 'English'

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

    // ⑧ メッセージコンテンツを構築
    let messageContent: Anthropic.MessageParam['content']

    if (file) {
      const bytes = await file.arrayBuffer()
      const base64 = Buffer.from(bytes).toString('base64')
      const mediaType = file.type

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
              media_type: mediaType as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp',
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

    // ⑨ AI生成
    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2048,
      system: [
        {
          type: 'text',
          text: systemPrompt,
          cache_control: { type: 'ephemeral' },  // ← これだけ追加
        }
      ],
      messages: [{ role: 'user', content: messageContent }],
    })
    
    const result =
      message.content[0].type === 'text'
        ? message.content[0].text + (DISCLAIMERS[language] || DISCLAIMERS.en)
        : 'Could not analyze document.'

    return NextResponse.json({ result })

  } catch (e: any) {
    console.error('Analyze error:', e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}