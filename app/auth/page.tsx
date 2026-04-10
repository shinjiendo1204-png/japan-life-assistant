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
    if (searchParams.get('mode') === 'signup') {
      setIsLogin(false)
    }
  }, [])

  const handleAfterAuth = async (userId: string) => {
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

  const handleResetPassword = async () => {
    if (!email) {
      setMessage('Please enter your email address first.')
      return
    }
    setLoading(true)
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset`,
      })
      if (error) throw error
      setMessage('Check your email for a password reset link.')
    } catch (e: any) {
      setMessage(e.message)
    } finally {
      setLoading(false)
    }
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

  const isSignup = !isLogin
  const fromAnalyze = searchParams.get('mode') === 'signup' || searchParams.get('from') === 'analyze'

  return (
    <main style={{ maxWidth: 400, margin: '4rem auto', padding: '0 1rem' }}>

      <div style={{ fontSize: 20, fontWeight: 500, letterSpacing: '-0.5px', color: '#111', marginBottom: 24 }}>
        Sort<span style={{ color: '#e53935' }}>Japan</span>
      </div>

      {fromAnalyze && (
        <div style={{
          background: '#f0f4ff',
          border: '1px solid #c7d7ff',
          borderRadius: 12,
          padding: '14px 16px',
          marginBottom: 20,
        }}>
          <div style={{ fontSize: 14, fontWeight: 500, color: '#1a3a8f', marginBottom: 4 }}>
            Sign up to analyze your document
          </div>
          <div style={{ fontSize: 13, color: '#555', lineHeight: 1.5 }}>
            Free plan includes 1 analysis per month — no credit card required.
          </div>
        </div>
      )}

      <h1 style={{ fontSize: 22, fontWeight: 500, marginBottom: 6, color: '#111' }}>
        {isLogin ? 'Sign in' : 'Create your account'}
      </h1>
      <p style={{ color: '#888', marginBottom: 24, fontSize: 14 }}>
        {isLogin ? 'Welcome back.' : 'Free — no credit card required.'}
      </p>

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && handleAuth()}
        style={{
          width: '100%', padding: '11px 14px', borderRadius: 10,
          border: '1px solid #e0e0e0', fontSize: 14, marginBottom: 10,
          boxSizing: 'border-box' as const, background: '#fafafa',
          outline: 'none', color: '#111',
        }}
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && handleAuth()}
        style={{
          width: '100%', padding: '11px 14px', borderRadius: 10,
          border: '1px solid #e0e0e0', fontSize: 14, marginBottom: 16,
          boxSizing: 'border-box' as const, background: '#fafafa',
          outline: 'none', color: '#111',
        }}
      />

      <button
        onClick={handleAuth}
        disabled={loading || !email || !password}
        style={{
          width: '100%', padding: 13, borderRadius: 10,
          background: loading || !email || !password ? '#ccc' : '#111',
          color: '#fff', border: 'none',
          fontSize: 15, fontWeight: 500,
          cursor: loading || !email || !password ? 'default' : 'pointer',
          marginBottom: 10,
          transition: 'background 0.12s',
        }}
      >
        {loading ? 'Loading...' : isLogin ? 'Sign in' : 'Sign up free'}
      </button>

      {isLogin && (
        <p style={{ textAlign: 'center', fontSize: 12, color: '#aaa', marginBottom: 14 }}>
          <span
            onClick={handleResetPassword}
            style={{ cursor: 'pointer', textDecoration: 'underline' }}
          >
            Forgot password?
          </span>
        </p>
      )}

      {isSignup && (
        <div style={{
          background: '#f7f7f7',
          borderRadius: 10,
          padding: '12px 14px',
          marginBottom: 14,
          fontSize: 12,
          color: '#888',
          lineHeight: 1.6,
        }}>
          Free plan: 1 document analysis per month ·{' '}
          <span
            onClick={() => router.push('/pricing')}
            style={{ color: '#111', cursor: 'pointer', textDecoration: 'underline' }}
          >
            See all plans
          </span>
        </div>
      )}

      <p style={{ textAlign: 'center', fontSize: 13, color: '#888' }}>
        {isLogin ? "Don't have an account? " : 'Already have an account? '}
        <span
          onClick={() => setIsLogin(!isLogin)}
          style={{ color: '#111', cursor: 'pointer', textDecoration: 'underline' }}
        >
          {isLogin ? 'Sign up' : 'Sign in'}
        </span>
      </p>

      {message && (
        <p style={{
          marginTop: 14, fontSize: 13, color: '#555',
          textAlign: 'center', padding: '10px',
          background: '#f5f5f5', borderRadius: 8,
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