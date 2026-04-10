'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function PricingPage() {
  const [loading, setLoading] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  const router = useRouter()

  // 1. マウント確認（ハイドレーションエラー防止）
  useEffect(() => {
    setMounted(true)
  }, [])

  // 2. コンポーネント内で定義し、環境変数の不整合でJSがクラッシュするのを防ぐ
  const PLANS = [
    {
      name: 'Free',
      price: '$0',
      period: '/month',
      limit: '1 document / month',
      features: ['1 document analysis per month', 'All 12 languages supported', 'Image upload', 'Text paste support'],
      cta: 'Get started',
      priceId: null,
      highlight: false,
    },
    {
      name: 'Standard',
      price: '$15',
      period: '/month',
      limit: '30 documents / month',
      features: ['30 document analyses per month', 'All 12 languages supported', 'Images upload', 'Text paste support'],
      cta: 'Subscribe',
      // 環境変数が空でもビルドエラーにならないように保護
      priceId: process.env.NEXT_PUBLIC_STRIPE_STANDARD_PRICE_ID || '',
      highlight: true,
    },
  ]

  const handleSubscribe = async (priceId: string | null, planName: string) => {
    // 3. テスト用のalert（これでJSが動いているか一発でわかる）
    if (typeof window !== 'undefined') {
      alert(`Checking plan: ${planName}`);
    }

    if (!priceId) {
      router.push('/auth')
      return
    }

    setLoading(planName)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const user = session?.user

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

  // JSが紐付く（マウントされる）まで何もさせない
  if (!mounted) return null

  return (
    <main style={{ maxWidth: 680, margin: '0 auto', padding: '1.5rem 1rem' }}>
      <nav style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '2rem' }}>
        {/* router.pushをやめ、ブラウザ標準の <a> にして「逃げ道」を作る */}
        <a 
          href="/" 
          style={{ fontSize: 24, color: '#888', textDecoration: 'none', padding: '10px' }}
        >
          ←
        </a>
        <div style={{ fontSize: 20, fontWeight: 500, color: '#111' }}>
          Sort<span style={{ color: '#e53935' }}>Japan</span>
        </div>
      </nav>

      {/* ...プラン表示部分は既存のループを使用... */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
        {PLANS.map(plan => (
          <div key={plan.name} style={{ border: '1px solid #eee', padding: '1.5rem', borderRadius: 16 }}>
             <h3>{plan.name}</h3>
             <button
               type="button"
               onClick={() => handleSubscribe(plan.priceId, plan.name)}
               style={{ width: '100%', padding: '12px', cursor: 'pointer', touchAction: 'manipulation' }}
             >
               {loading === plan.name ? '...' : plan.cta}
             </button>
          </div>
        ))}
      </div>
    </main>
  )
}