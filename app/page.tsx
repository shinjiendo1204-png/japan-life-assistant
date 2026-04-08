'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

const CATEGORIES = [
  { value: 'city_hall', label: 'City Hall / Municipal Office' },
  { value: 'rental', label: 'Rental Contract' },
  { value: 'workplace', label: 'Workplace / Email' },
  { value: 'visa', label: 'Visa / Residence' },
  { value: 'tax', label: 'Tax / Pension' },
  { value: 'other', label: 'Other' },
]

const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Español' },
  { value: 'pt', label: 'Português' },
]

export default function Home() {
  const [user, setUser] = useState<any>(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [input, setInput] = useState('')
  const [category, setCategory] = useState('city_hall')
  const [language, setLanguage] = useState('en')
  const [output, setOutput] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.push('/auth')
      } else {
        setUser(user)
        setAuthLoading(false)
      }
    })
  }, [])

  if (authLoading) return (
    <main style={{ maxWidth: 680, margin: '0 auto', padding: '2rem 1rem' }}>
      <p style={{ color: '#666' }}>Loading...</p>
    </main>
  )

  const handleSubmit = async () => {
    if (!input.trim()) return
    setLoading(true)
    setOutput('')
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input, category, language }),
      })
      const data = await res.json()
      setOutput(data.result || data.error)
    } catch (e) {
      setOutput('Error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main style={{ maxWidth: 680, margin: '0 auto', padding: '2rem 1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between',
  alignItems: 'center', marginBottom: 8 }}>
  <h1 style={{ fontSize: 24, fontWeight: 600, margin: 0 }}>
    Japan Life Assistant
  </h1>
  <div style={{ display: 'flex', gap: 8 }}>
    <button
      onClick={() => router.push('/specialists')}
      style={{ fontSize: 12, color: '#1a1a1a', background: 'none',
        border: '1px solid #ddd', borderRadius: 6, padding: '4px 10px',
        cursor: 'pointer' }}
    >
      Find specialist
    </button>
    <button
      onClick={() => supabase.auth.signOut().then(() => router.push('/auth'))}
      style={{ fontSize: 12, color: '#666', background: 'none',
        border: '1px solid #ddd', borderRadius: 6, padding: '4px 10px',
        cursor: 'pointer' }}
    >
      Sign out
    </button>
  </div>
</div>
      <p style={{ color: '#666', marginBottom: 24, fontSize: 14 }}>
        Get help with Japanese paperwork, contracts, and official documents — in your language.
      </p>

      <div style={{ marginBottom: 12 }}>
        <label style={{ fontSize: 13, color: '#666', display: 'block', marginBottom: 6 }}>
          Language
        </label>
        <select
          value={language}
          onChange={e => setLanguage(e.target.value)}
          style={{ width: '100%', padding: '8px 12px', borderRadius: 8,
            border: '1px solid #ddd', fontSize: 14 }}
        >
          {LANGUAGES.map(l => (
            <option key={l.value} value={l.value}>{l.label}</option>
          ))}
        </select>
      </div>

      <div style={{ marginBottom: 12 }}>
        <label style={{ fontSize: 13, color: '#666', display: 'block', marginBottom: 6 }}>
          Category
        </label>
        <select
          value={category}
          onChange={e => setCategory(e.target.value)}
          style={{ width: '100%', padding: '8px 12px', borderRadius: 8,
            border: '1px solid #ddd', fontSize: 14 }}
        >
          {CATEGORIES.map(c => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
      </div>

      <div style={{ marginBottom: 16 }}>
        <label style={{ fontSize: 13, color: '#666', display: 'block', marginBottom: 6 }}>
          Describe your situation
        </label>
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="e.g. I need to register my new address at city hall. What documents do I need and what should I say?"
          rows={5}
          style={{ width: '100%', padding: '10px 12px', borderRadius: 8,
            border: '1px solid #ddd', fontSize: 14, resize: 'vertical',
            fontFamily: 'inherit', boxSizing: 'border-box' }}
        />
      </div>

      <button
        onClick={handleSubmit}
        disabled={loading || !input.trim()}
        style={{ width: '100%', padding: '12px', borderRadius: 8,
          background: loading ? '#ccc' : '#1a1a1a', color: '#fff',
          border: 'none', fontSize: 15, fontWeight: 500,
          cursor: loading ? 'default' : 'pointer' }}
      >
        {loading ? 'Generating...' : 'Get Help'}
      </button>

      {output && (
        <div style={{ marginTop: 24 }}>
          <div style={{ background: '#f9f9f9', borderRadius: 8,
            padding: '16px', border: '1px solid #eee', whiteSpace: 'pre-wrap',
            fontSize: 14, lineHeight: 1.7 }}>
            {output}
          </div>
        </div>
      )}
    </main>
  )
}