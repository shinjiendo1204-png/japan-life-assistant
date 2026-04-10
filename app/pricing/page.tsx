'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function PricingPage() {
  const [loading, setLoading] = useState<string | null>(null)
  const router = useRouter()

  const handleSubscribe = (planName: string) => {
    // Supabase も Stripe も一旦無視。JS が動いているかだけを確認。
    alert("Click detected on: " + planName)
    setLoading(planName)
    // 物理的に移動させる
    window.location.href = "/auth"
  }

  return (
    <main style={{ maxWidth: 680, margin: '0 auto', padding: '1.5rem 1rem' }}>
      {/* 1. 絶対に動く戻るボタン（aタグ） */}
      <nav style={{ marginBottom: '2rem' }}>
        <a href="/" style={{ fontSize: 30, textDecoration: 'none', color: '#888' }}>←</a>
      </nav>

      <h1 style={{ fontSize: 24, marginBottom: '2rem' }}>Simple Pricing</h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 15 }}>
        {/* Free Plan */}
        <div style={{ border: '1px solid #ddd', padding: 20, borderRadius: 12 }}>
          <h2>Free</h2>
          <button
            type="button"
            onClick={() => handleSubscribe('Free')}
            style={{ width: '100%', padding: 10, cursor: 'pointer', touchAction: 'manipulation' }}
          >
            {loading === 'Free' ? '...' : 'Get Started'}
          </button>
        </div>

        {/* Standard Plan */}
        <div style={{ border: '2px solid #111', padding: 20, borderRadius: 12 }}>
          <h2>Standard</h2>
          <button
            type="button"
            onClick={() => handleSubscribe('Standard')}
            style={{ width: '100%', padding: 10, cursor: 'pointer', touchAction: 'manipulation' }}
          >
            {loading === 'Standard' ? '...' : 'Subscribe'}
          </button>
        </div>
      </div>
    </main>
  )
}