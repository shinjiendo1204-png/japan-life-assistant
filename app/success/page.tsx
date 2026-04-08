'use client'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState, Suspense } from 'react'
import { supabase } from '@/lib/supabase'

function SuccessContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState('Processing your payment...')

  useEffect(() => {
    const sessionId = searchParams.get('session_id')
    if (!sessionId) {
      router.push('/')
      return
    }

    const confirmPayment = async () => {
      // ユーザーを取得してからfetch
      const { data: { user } } = await supabase.auth.getUser()

      const res = await fetch('/api/confirm-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          userId: user?.id,
        }),
      })

      const data = await res.json()

      if (data.success) {
        setStatus('Plan activated! Redirecting...')
        setTimeout(() => router.push('/'), 2000)
      } else {
        setStatus('Error: ' + data.error)
      }
    }

    confirmPayment()
  }, [])

  return (
    <main style={{ maxWidth: 480, margin: '6rem auto', padding: '0 1rem', textAlign: 'center' }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>🎉</div>
      <h1 style={{ fontSize: 24, fontWeight: 600, marginBottom: 8 }}>
        Payment successful!
      </h1>
      <p style={{ color: '#666', fontSize: 14 }}>{status}</p>
    </main>
  )
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div style={{ textAlign: 'center', marginTop: '6rem' }}>Loading...</div>}>
      <SuccessContent />
    </Suspense>
  )
}