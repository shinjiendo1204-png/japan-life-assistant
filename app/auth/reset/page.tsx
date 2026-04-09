'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const router = useRouter()

  const handleReset = async () => {
    if (!password || password.length < 6) {
      setMessage('Password must be at least 6 characters.')
      return
    }
    setLoading(true)
    try {
      const { error } = await supabase.auth.updateUser({ password })
      if (error) throw error
      setMessage('Password updated successfully. Redirecting...')
      setTimeout(() => router.push('/'), 2000)
    } catch (e: any) {
      setMessage(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main style={{ maxWidth: 400, margin: '4rem auto', padding: '0 1rem' }}>
      <div style={{ fontSize: 20, fontWeight: 500, letterSpacing: '-0.5px', color: '#111', marginBottom: 24 }}>
        Sort<span style={{ color: '#e53935' }}>Japan</span>
      </div>

      <h1 style={{ fontSize: 22, fontWeight: 500, marginBottom: 6, color: '#111' }}>
        Set new password
      </h1>
      <p style={{ color: '#888', marginBottom: 24, fontSize: 14 }}>
        Enter your new password below.
      </p>

      <input
        type="password"
        placeholder="New password (min. 6 characters)"
        value={password}
        onChange={e => setPassword(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && handleReset()}
        style={{
          width: '100%', padding: '11px 14px', borderRadius: 10,
          border: '1px solid #e0e0e0', fontSize: 14, marginBottom: 16,
          boxSizing: 'border-box' as const, background: '#fafafa',
          outline: 'none', color: '#111',
        }}
      />

      <button
        onClick={handleReset}
        disabled={loading || !password}
        style={{
          width: '100%', padding: 13, borderRadius: 10,
          background: loading || !password ? '#ccc' : '#111',
          color: '#fff', border: 'none',
          fontSize: 15, fontWeight: 500,
          cursor: loading || !password ? 'default' : 'pointer',
          marginBottom: 14,
        }}
      >
        {loading ? 'Updating...' : 'Update password'}
      </button>

      {message && (
        <p style={{
          fontSize: 13, color: '#555',
          textAlign: 'center', padding: '10px',
          background: '#f5f5f5', borderRadius: 8,
        }}>
          {message}
        </p>
      )}
    </main>
  )
}