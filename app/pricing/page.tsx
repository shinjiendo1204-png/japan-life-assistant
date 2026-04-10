'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

const SUPPORTED_LANGUAGES = [
  '🇺🇸 English', '🇪🇸 Español', '🇧🇷 Português', '🇨🇳 中文',
  '🇰🇷 한국어', '🇻🇳 Tiếng Việt', '🇵🇭 Filipino', '🇳🇵 नेपाली',
  '🇮🇩 Indonesia', '🇹🇭 ภาษาไทย', '🇲🇲 မြန်မာ', '🇫🇷 Français',
]

const PLANS = [
  {
    name: 'Free',
    price: '$0',
    period: '/month',
    limit: '1 document / month',
    features: [
      '1 document analysis per month',
      'All 12 languages supported',
      'Image & PDF upload',
      'Text paste support',
    ],
    cta: 'Get started',
    priceId: null,
    highlight: false,
  },
  {
    name: 'Standard',
    price: '$15',
    period: '/month',
    limit: '30 documents / month',
    features: [
      '30 document analyses per month',
      'All 12 languages supported',
      'Images upload',
      'Text paste support',
    ],
    cta: 'Subscribe',
    priceId: process.env.NEXT_PUBLIC_STRIPE_STANDARD_PRICE_ID,
    highlight: true,
  },
]

export default function PricingPage() {
  const [loading, setLoading] = useState<string | null>(null)
  const router = useRouter()

  const handleSubscribe = async (priceId: string | null | undefined, planName: string) => {
    if (!priceId) {
      router.push('/auth')
      return
    }
    setLoading(planName)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        localStorage.setItem('pendingPriceId', priceId)
        router.push('/auth?mode=signup&from=standard')
        return
      }
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId, userId: user.id }),
      })
      const data = await res.json()
      if (data.url) window.location.href = data.url
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(null)
    }
  }

  return (
    <main style={{ maxWidth: 680, margin: '0 auto', padding: '1.5rem 1rem' }}>

      {/* ナビ */}
      <nav style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '2rem' }}>
        <button
          onClick={() => router.push('/')}
          style={{ fontSize: 13, color: '#888', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
        >
          ←
        </button>
        <div style={{ fontSize: 20, fontWeight: 500, letterSpacing: '-0.5px', color: '#111' }}>
          Sort<span style={{ color: '#e53935' }}>Japan</span>
        </div>
      </nav>

      {/* ヘッダー */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: 26, fontWeight: 500, color: '#111', marginBottom: 8 }}>
          Simple, transparent pricing
        </h1>
        <p style={{ fontSize: 14, color: '#888', lineHeight: 1.6 }}>
          Cancel anytime. No hidden fees. Supports 12 languages.
        </p>
      </div>

      {/* プランカード（横並び） */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: 14,
        marginBottom: '2rem',
      }}>
        {PLANS.map(plan => (
          <div
            key={plan.name}
            style={{
              border: plan.highlight ? '2px solid #111' : '1px solid #e8e8e8',
              borderRadius: 16,
              padding: '1.5rem',
              background: '#fff',
              position: 'relative' as const,
            }}
          >
            {plan.highlight && (
              <div style={{
                position: 'absolute' as const,
                top: -12,
                left: '50%',
                transform: 'translateX(-50%)',
                background: '#111',
                color: '#fff',
                fontSize: 10,
                fontWeight: 500,
                padding: '3px 12px',
                borderRadius: 20,
                whiteSpace: 'nowrap' as const,
              }}>
                Most popular
              </div>
            )}

            <div style={{ marginBottom: '1rem' }}>
              <div style={{ fontSize: 15, fontWeight: 500, color: '#111', marginBottom: 8 }}>
                {plan.name}
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 2, marginBottom: 4 }}>
                <span style={{ fontSize: 32, fontWeight: 500, color: '#111' }}>{plan.price}</span>
                <span style={{ fontSize: 13, color: '#aaa' }}>{plan.period}</span>
              </div>
              <div style={{
                display: 'inline-block',
                fontSize: 11,
                color: '#888',
                background: '#f5f5f5',
                padding: '3px 8px',
                borderRadius: 6,
              }}>
                {plan.limit}
              </div>
            </div>

            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1.25rem' }}>
              {plan.features.map(f => (
                <li key={f} style={{
                  fontSize: 13,
                  color: '#555',
                  padding: '4px 0',
                  display: 'flex',
                  gap: 8,
                  alignItems: 'flex-start',
                }}>
                  <span style={{ color: '#4caf50', flexShrink: 0, marginTop: 1 }}>✓</span>
                  {f}
                </li>
              ))}
            </ul>

            <button
              onClick={() => handleSubscribe(plan.priceId, plan.name)}
              disabled={loading === plan.name}
              style={{
                width: '100%',
                padding: '11px',
                borderRadius: 10,
                background: plan.highlight ? '#111' : '#fff',
                color: plan.highlight ? '#fff' : '#111',
                border: plan.highlight ? 'none' : '1px solid #111',
                fontSize: 14,
                fontWeight: 500,
                cursor: loading === plan.name ? 'default' : 'pointer',
                opacity: loading === plan.name ? 0.6 : 1,
              }}
            >
              {loading === plan.name ? 'Loading...' : plan.cta}
            </button>
          </div>
        ))}
      </div>

      {/* 対応言語 */}
      <div style={{
        background: '#f7f7f7',
        borderRadius: 14,
        padding: '1.25rem',
      }}>
        <div style={{
          fontSize: 11,
          fontWeight: 500,
          color: '#999',
          textTransform: 'uppercase' as const,
          letterSpacing: '0.08em',
          marginBottom: 12,
        }}>
          12 languages supported on all plans
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '6px 0',
        }}>
          {SUPPORTED_LANGUAGES.map(lang => (
            <div key={lang} style={{ fontSize: 13, color: '#555' }}>
              {lang}
            </div>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div style={{ marginTop: '2rem' }}>
        <div style={{
          fontSize: 11,
          fontWeight: 500,
          color: '#999',
          textTransform: 'uppercase' as const,
          letterSpacing: '0.08em',
          marginBottom: 14,
        }}>
          FAQ
        </div>
        {[
          {
            q: 'What counts as one document analysis?',
            a: 'Each time you upload a file or paste text and click "Analyze document", that counts as one use.',
          },
          {
            q: 'Why is there a 30-document limit on Standard?',
            a: 'The average household receives about 10–20 official documents per month. 30 is enough for any individual, while preventing commercial misuse.',
          },
          {
            q: 'Can I cancel anytime?',
            a: 'Yes. Cancel from your account settings at any time. You keep access until the end of your billing period.',
          },
          {
            q: 'Is my data safe?',
            a: 'Documents you upload are processed by AI and are not stored permanently. We do not share your data with third parties.',
          },
        ].map(item => (
          <div key={item.q} style={{
            borderBottom: '0.5px solid #eee',
            paddingBottom: 14,
            marginBottom: 14,
          }}>
            <div style={{ fontSize: 14, fontWeight: 500, color: '#111', marginBottom: 4 }}>
              {item.q}
            </div>
            <div style={{ fontSize: 13, color: '#666', lineHeight: 1.6 }}>
              {item.a}
            </div>
          </div>
        ))}
      </div>

    </main>
  )
}
