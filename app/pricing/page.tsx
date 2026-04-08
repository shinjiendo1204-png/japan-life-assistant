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
      '1 document analysis per month',
      'English, Spanish & Portuguese',
      'Image & PDF support',
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
      'Unlimited document analysis',
      'English, Spanish & Portuguese',
      'Image & PDF support',
      'Text paste support',
      'Copy & save results',
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
        router.push('/auth?mode=signup')
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
    <main style={{ maxWidth: 560, margin: '0 auto', padding: '2rem 1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 32, gap: 12 }}>
        <button
          onClick={() => router.push('/')}
          style={{ fontSize: 13, color: '#666', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
        >
          ← Back
        </button>
        <div style={{ fontSize: 18, fontWeight: 700 }}>SortJapan</div>
      </div>

      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 6 }}>Simple pricing</h1>
      <p style={{ color: '#666', fontSize: 14, marginBottom: 32 }}>Cancel anytime. No hidden fees.</p>

      <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 16 }}>
        {PLANS.map(plan => (
          <div
            key={plan.name}
            style={{
              border: plan.highlight ? '2px solid #1a1a1a' : '1px solid #eee',
              borderRadius: 14, padding: '24px',
              position: 'relative' as const,
            }}
          >
            {plan.highlight && (
              <div style={{
                position: 'absolute' as const, top: -12, left: 24,
                background: '#1a1a1a', color: '#fff', fontSize: 11,
                padding: '3px 12px', borderRadius: 20, fontWeight: 500,
              }}>
                Most popular
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 4 }}>{plan.name}</div>
                <div>
                  <span style={{ fontSize: 32, fontWeight: 700 }}>{plan.price}</span>
                  <span style={{ color: '#666', fontSize: 14 }}>{plan.period}</span>
                </div>
              </div>
              <button
                onClick={() => handleSubscribe(plan.priceId, plan.name)}
                disabled={loading === plan.name}
                style={{
                  padding: '10px 20px', borderRadius: 8,
                  background: plan.highlight ? '#1a1a1a' : '#fff',
                  color: plan.highlight ? '#fff' : '#1a1a1a',
                  border: plan.highlight ? 'none' : '1px solid #1a1a1a',
                  fontSize: 14, fontWeight: 500, cursor: 'pointer',
                  whiteSpace: 'nowrap' as const,
                }}
              >
                {loading === plan.name ? 'Loading...' : plan.cta}
              </button>
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {plan.features.map(f => (
                <li key={f} style={{ fontSize: 13, color: '#444', padding: '4px 0', display: 'flex', gap: 8 }}>
                  <span style={{ color: '#4caf50' }}>✓</span>{f}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </main>
  )
}