'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function AuthContent() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    // ?mode=signup で来た場合はサインアップモードにする
    if (searchParams.get('mode') === 'signup') {
      setIsLogin(false)
    }
  }, [])

  const handleAfterAuth = async (userId: string) => {
    // pendingPriceIdがあれば決済へ
    const pendingPriceId = localStorage.getItem('pendingPriceId')
    if (pendingPriceId) {
      localStorage.removeItem('pendingPriceId')
      localStorage.removeItem('pendingPlanName')

      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId: pendingPriceId, userId }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
        return
      }
    }
    router.push('/')
  }

  const handleAuth = async () => {
    setLoading(true)
    setMessage('')
    try {
      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        await handleAfterAuth(data.user.id)
      } else {
        const { data, error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        if (data.user) {
          await handleAfterAuth(data.user.id)
        } else {
          setMessage('Check your email to confirm your account.')
        }
      }
    } catch (e: any) {
      setMessage(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main style={{ maxWidth: 400, margin: '4rem auto', padding: '0 1rem' }}>
      <h1 style={{ fontSize: 22, fontWeight: 600, marginBottom: 8 }}>
        Japan Life Assistant
      </h1>
      <p style={{ color: '#666', marginBottom: 24, fontSize: 14 }}>
        {isLogin ? 'Sign in to your account' : 'Create a free account'}
      </p>

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        style={{
          width: '100%', padding: '10px 12px', borderRadius: 8,
          border: '1px solid #ddd', fontSize: 14, marginBottom: 10,
          boxSizing: 'border-box' as const,
        }}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        style={{
          width: '100%', padding: '10px 12px', borderRadius: 8,
          border: '1px solid #ddd', fontSize: 14, marginBottom: 16,
          boxSizing: 'border-box' as const,
        }}
      />

      <button
        onClick={handleAuth}
        disabled={loading}
        style={{
          width: '100%', padding: 12, borderRadius: 8,
          background: '#1a1a1a', color: '#fff', border: 'none',
          fontSize: 15, fontWeight: 500, cursor: 'pointer', marginBottom: 12,
        }}
      >
        {loading ? 'Loading...' : isLogin ? 'Sign In' : 'Sign Up'}
      </button>

      <p style={{ textAlign: 'center', fontSize: 13, color: '#666' }}>
        {isLogin ? "Don't have an account? " : 'Already have an account? '}
        <span
          onClick={() => setIsLogin(!isLogin)}
          style={{ color: '#1a1a1a', cursor: 'pointer', textDecoration: 'underline' }}
        >
          {isLogin ? 'Sign Up' : 'Sign In'}
        </span>
      </p>

      {message && (
        <p style={{
          marginTop: 12, fontSize: 13, color: '#666',
          textAlign: 'center', padding: '10px', background: '#f5f5f5', borderRadius: 8,
        }}>
          {message}
        </p>
      )}
    </main>
  )
}

export default function AuthPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AuthContent />
    </Suspense>
  )
}