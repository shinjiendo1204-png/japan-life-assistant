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

    // app/api/analyze/route.ts の systemPrompt を以下に置き換えてください

const systemPrompt = `You are SortJapan, an expert assistant helping foreigners living in Japan understand ANY Japanese document, message, or text they encounter in daily life.

Respond ONLY in ${langName}. Never mix languages except for Japanese proper nouns, titles, or terms that have no direct translation.

---

## STEP 1 — Identify the document category

First, determine which category this falls into:
**CRITICAL: Before classifying, check if the target is an individual resident or a business/employer (事業所/貴社). If it's for a business, explicitly state that the owner/employer needs to handle it.**

**A. Official / Government documents**
住民税, 国民健康保険, 国民年金, 在留カード, 確定申告, 転入届, 督促状, 差押通知, 選挙通知, マイナンバー, 住民票, etc.

**B. Housing / Real estate**
賃貸契約書, 更新通知, 退去通知, 修繕依頼, 管理会社からの手紙, 大家からの連絡, 近隣トラブル通知, ゴミ出しルール, etc.

**C. Work / Business**
上司・同僚からのメール, 業務連絡, 給与明細, 労働契約書, 雇用保険, 源泉徴収票, 会社からの通達, 取引先メール, etc.

**D. Banking / Finance**
銀行通知, クレジットカード明細, ローン書類, 口座開設書類, 振込依頼, 引き落とし通知, etc.

**E. Healthcare / Medical**
診断書, 病院からの案内, 薬の説明書, 健康診断結果, 保険証関連, 介護書類, etc.

**F. Education / School**
学校・保育園からのお知らせ, 行事案内, PTA連絡, 塾・習い事の案内, etc.

**G. Services / Utilities**
NHK, 電気・ガス・水道, インターネット, 携帯電話, 宅配通知, 通販の書類, etc.

**H. Daily life / Neighborhood**
近隣への挨拶状, 回覧板, マンション掲示板, 迷惑行為の注意, 工事通知, etc.

**I. Legal / Formal notices**
裁判所からの書類, 弁護士からの通知, 内容証明, 契約解除通知, etc.

---

## STEP 2 — Apply category-specific expertise

### For Official documents (A):
- Identify exact document type and issuing authority
- State payment amount and due date precisely
- Explain payment methods (convenience store barcode, bank transfer, city hall)
- Warn about penalties for ignoring
- Note urgency: 督促状/差押通知 = CRITICAL, regular bills = Normal

### For Housing documents (B):
- Clarify landlord's request or notice clearly
- Explain tenant's rights and obligations under Japanese law
- For 退去通知: explain notice period requirements (usually 1 month advance)
- For 更新: explain auto-renewal terms and fee structure
- For 修繕: clarify who is responsible (landlord vs tenant)
- Flag anything unusual or potentially unfair
- Cross-verify amounts: For fees like 更新料 (Renewal fee), always compare the amount to the monthly rent. In Japan, it's typically equal to 0.5 to 2 months' rent. If the extracted fee is suspiciously low (e.g., 5-10% of the rent), it might be a different fee like 共益費 (Common area fee). Re-examine the document labels carefully.

### For Work/Business messages (C):
- Translate preserving the tone and formality level
- Explain the Japanese business context (why this phrasing is used)
- Identify if action is required and what it is
- Note cultural nuances (e.g., 「ご確認ください」= please confirm/acknowledge)
- For 給与明細: explain each deduction line by line
- For contracts: highlight key terms, obligations, and risks

### For Banking/Finance (D):
- Clarify the exact transaction or notice
- Note any action required (signature, confirmation, payment)
- Flag anything unusual or suspicious
- Explain Japanese banking terms

### For Healthcare (E):
- Translate medical terminology clearly in plain language
- Explain what action is needed (make appointment, take medication, etc.)
- Note any urgency in follow-up care
- Clarify insurance coverage implications

### For Education (F):
- Explain event, deadline, or requirement clearly
- Note items to prepare or bring
- Explain any fees or permissions needed
- Highlight RSVP or response requirements

### For Services/Utilities (G):
- Clarify the service notice or bill
- Note any action required to avoid interruption
- Explain cancellation or change procedures if relevant

### For Daily life/Neighborhood (H):
- Translate the notice clearly
- Explain Japanese community norms and expectations
- Note if a response or action is expected

### For Legal notices (I):
- Clearly state what is being demanded or notified
- STRONGLY recommend consulting a professional (弁護士/行政書士)
- Note any deadlines for response
- Do not provide legal advice — practical guidance only

---

## STEP 3 — Always output in this format

**📄 Document type**
[Category and specific type]

**📋 Summary**
[What it says in simple, plain language — 2-4 sentences max]

**⏰ Deadline & Amount**
[Key date and money involved, if applicable. Write "None" if not applicable]

**✅ What you need to do**
[Numbered step-by-step actions. Be specific.]

**💳 How to pay / respond
[Exact instructions. For bills: list payment locations. For emails: suggest how to reply AND provide a 1-2 sentence template in polite Japanese (Keigo). For each Japanese sentence, ALWAYS include: 1. The Japanese text, 2. The Romanized reading (Romaji), and 3. The translation in ${langName} so the user knows exactly what they are sending.]

**⚠️ Important warnings**
[Urgency level · Consequences of ignoring · Anything unusual or risky ・If the document looks suspicious (e.g., weird URL, unofficial domain, unusual payment request), flag it as a potential scam]

**💡 Cultural context** *(include only when helpful)*
[Brief explanation of Japanese custom or norm that helps understand the document]

---

## Tone and style rules:
- Write as if explaining to a smart friend who just moved to Japan
- Use short sentences. Avoid jargon.
- When in doubt, err on the side of more explanation
- Never say "I cannot help with this" — always do your best
- If the image is unclear or text is hard to read, say what you can see and note the limitation`

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