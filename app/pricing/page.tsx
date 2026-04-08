'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

const PLANS = [
  {
    name: 'Free',
    price: '$0',
    period: '/month',
    features: [
      '1 request per month',
      'English & Spanish support',
      'Document drafts',
      'Step-by-step guidance',
    ],
    cta: 'Get Started',
    priceId: null,
    highlight: false,
  },
  {
    name: 'Standard',
    price: '$15',
    period: '/month',
    features: [
      'Unlimited requests',
      'English, Spanish & Portuguese',
      'Document drafts',
      'Step-by-step guidance',
      'All categories',
    ],
    cta: 'Subscribe',
    priceId: process.env.NEXT_PUBLIC_STRIPE_STANDARD_PRICE_ID,
    highlight: true,
  },
  {
    name: 'Pro',
    price: '$29',
    period: '/month',
    features: [
      'Everything in Standard',
      'Access to specialist directory',
      'Filter by location & category',
      'English & Spanish specialists',
      'Discounted consultation fees',
    ],
    cta: 'Subscribe',
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID,
    highlight: false,
  },
]

export default function PricingPage() {
  const [loading, setLoading] = useState<string | null>(null)
  const router = useRouter()

  const handleSubscribe = async (priceId: string | null | undefined, planName: string) => {
    // Freeプランはサインアップページへ
    if (!priceId) {
      router.push('/auth')
      return
    }

    setLoading(planName)

    try {
      // ログイン確認
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        // 未ログイン → priceIdを記憶してサインアップへ
        localStorage.setItem('pendingPriceId', priceId)
        localStorage.setItem('pendingPlanName', planName)
        router.push('/auth?mode=signup')
        return
      }

      // ログイン済み → そのまま決済へ
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId, userId: user.id }),
      })
      const data = await res.json()
      if (data.url) window.location.href = data.url
      if (data.error) console.error(data.error)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(null)
    }
  }

  return (
    <main style={{ maxWidth: 800, margin: '0 auto', padding: '2rem 1rem' }}>
      <h1 style={{ fontSize: 28, fontWeight: 600, textAlign: 'center', marginBottom: 8 }}>
        Simple, transparent pricing
      </h1>
      <p style={{ textAlign: 'center', color: '#666', marginBottom: 40, fontSize: 15 }}>
        Cancel anytime. No hidden fees.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
        {PLANS.map(plan => (
          <div
            key={plan.name}
            style={{
              border: plan.highlight ? '2px solid #1a1a1a' : '1px solid #eee',
              borderRadius: 12,
              padding: '24px 20px',
              background: '#fff',
              position: 'relative',
            }}
          >
            {plan.highlight && (
              <div style={{
                position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)',
                background: '#1a1a1a', color: '#fff', fontSize: 11, fontWeight: 500,
                padding: '3px 12px', borderRadius: 20,
              }}>
                Most popular
              </div>
            )}
            <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 4 }}>{plan.name}</h2>
            <div style={{ marginBottom: 20 }}>
              <span style={{ fontSize: 32, fontWeight: 700 }}>{plan.price}</span>
              <span style={{ color: '#666', fontSize: 14 }}>{plan.period}</span>
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px', fontSize: 14 }}>
              {plan.features.map(f => (
                <li key={f} style={{ padding: '5px 0', color: '#444', display: 'flex', gap: 8 }}>
                  <span style={{ color: '#1a1a1a', fontWeight: 600 }}>✓</span>
                  {f}
                </li>
              ))}
            </ul>
            <button
              onClick={() => handleSubscribe(plan.priceId, plan.name)}
              disabled={loading === plan.name}
              style={{
                width: '100%', padding: '10px', borderRadius: 8,
                background: plan.highlight ? '#1a1a1a' : '#fff',
                color: plan.highlight ? '#fff' : '#1a1a1a',
                border: plan.highlight ? 'none' : '1px solid #1a1a1a',
                fontSize: 14, fontWeight: 500, cursor: 'pointer',
              }}
            >
              {loading === plan.name ? 'Loading...' : plan.cta}
            </button>
          </div>
        ))}
      </div>
    </main>
  )
}