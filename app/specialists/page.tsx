'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

const CATEGORIES = [
  { value: '', label: 'All categories' },
  { value: 'visa', label: 'Visa & residence' },
  { value: 'rental', label: 'Rental contracts' },
  { value: 'labor', label: 'Labor disputes' },
  { value: 'tax', label: 'Tax & accounting' },
  { value: 'legal', label: 'General legal' },
]

const LOCATIONS = [
  { value: '', label: 'All locations' },
  { value: 'Tokyo', label: 'Tokyo' },
  { value: 'Osaka', label: 'Osaka' },
  { value: 'Kanagawa', label: 'Kanagawa' },
  { value: 'Aichi', label: 'Aichi' },
  { value: 'Online', label: 'Online (nationwide)' },
]

const LANGUAGES = [
  { value: '', label: 'All languages' },
  { value: 'English', label: 'English' },
  { value: 'Spanish', label: 'Spanish' },
  { value: 'Portuguese', label: 'Portuguese' },
]

const SPECIALISTS = [
  {
    id: 1,
    name: 'Tanaka Administrative Office',
    type: '行政書士 (Administrative Scrivener)',
    location: 'Tokyo',
    languages: ['English', 'Spanish'],
    categories: ['visa', 'rental'],
    note: 'Specializes in visa renewals and rental contract support for Latin American residents.',
    fee: 'From ¥15,000/case',
    email: 'contact@tanaka-office.example.com',
  },
  {
    id: 2,
    name: 'Yamamoto Law Office',
    type: '弁護士 (Attorney at Law)',
    location: 'Online',
    languages: ['English', 'Portuguese'],
    categories: ['labor', 'legal', 'rental'],
    note: 'Labor disputes and employment contract reviews. Available online nationwide.',
    fee: 'From ¥20,000/case',
    email: 'info@yamamoto-law.example.com',
  },
  {
    id: 3,
    name: 'Osaka Multilingual Tax Office',
    type: '税理士 (Tax Accountant)',
    location: 'Osaka',
    languages: ['English', 'Spanish'],
    categories: ['tax'],
    note: 'Individual tax filing support for foreign residents. Handles year-end adjustments.',
    fee: 'From ¥12,000/case',
    email: 'tax@osaka-multilingual.example.com',
  },
  {
    id: 4,
    name: 'Nakamura Immigration Office',
    type: '行政書士 (Administrative Scrivener)',
    location: 'Kanagawa',
    languages: ['English'],
    categories: ['visa'],
    note: 'Expert in work visa, spouse visa, and permanent residence applications.',
    fee: 'From ¥18,000/case',
    email: 'visa@nakamura-office.example.com',
  },
  {
    id: 5,
    name: 'Suzuki Labor Consulting',
    type: '社労士 (Social Insurance Consultant)',
    location: 'Online',
    languages: ['English', 'Spanish', 'Portuguese'],
    categories: ['labor', 'tax'],
    note: 'Workplace rights, salary disputes, and social insurance for foreign workers.',
    fee: 'From ¥10,000/case',
    email: 'help@suzuki-labor.example.com',
  },
]

type Specialist = {
  id: number
  name: string
  type: string
  location: string
  languages: string[]
  categories: string[]
  note: string
  fee: string
  email: string
}

export default function SpecialistsPage() {
  const [plan, setPlan] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [location, setLocation] = useState('')
  const [category, setCategory] = useState('')
  const [language, setLanguage] = useState('')
  const router = useRouter()

  useEffect(() => {
    const checkPlan = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth')
        return
      }
      const { data: profile } = await supabase
        .from('profiles')
        .select('plan')
        .eq('id', user.id)
        .single()
      setPlan(profile?.plan || 'free')
      setLoading(false)
    }
    checkPlan()
  }, [])

  if (loading) {
    return (
      <main style={{ maxWidth: 680, margin: '0 auto', padding: '2rem 1rem' }}>
        <p style={{ color: '#666' }}>Loading...</p>
      </main>
    )
  }

  if (plan !== 'pro') {
    return (
      <main style={{ maxWidth: 680, margin: '0 auto', padding: '2rem 1rem', textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🔒</div>
        <h1 style={{ fontSize: 22, fontWeight: 600, marginBottom: 8 }}>
          Pro plan required
        </h1>
        <p style={{ color: '#666', fontSize: 14, marginBottom: 24 }}>
          Access to the specialist directory is available on the Pro plan ($29/month).
          Specialists offer discounted rates exclusively for our members.
        </p>
        <button
          onClick={() => router.push('/pricing')}
          style={{
            padding: '10px 24px',
            borderRadius: 8,
            background: '#1a1a1a',
            color: '#fff',
            border: 'none',
            fontSize: 14,
            fontWeight: 500,
            cursor: 'pointer',
            marginRight: 10,
          }}
        >
          Upgrade to Pro
        </button>
        <button
          onClick={() => router.push('/')}
          style={{
            padding: '10px 24px',
            borderRadius: 8,
            background: '#fff',
            color: '#1a1a1a',
            border: '1px solid #ddd',
            fontSize: 14,
            cursor: 'pointer',
          }}
        >
          Back to home
        </button>
      </main>
    )
  }

  const filtered = SPECIALISTS.filter((s: Specialist) => {
    if (location && s.location !== location && s.location !== 'Online') return false
    if (category && !s.categories.includes(category)) return false
    if (language && !s.languages.includes(language)) return false
    return true
  })

  return (
    <main style={{ maxWidth: 720, margin: '0 auto', padding: '2rem 1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <h1 style={{ fontSize: 22, fontWeight: 600, margin: 0 }}>
          Find a specialist
        </h1>
        <button
          onClick={() => router.push('/')}
          style={{
            fontSize: 12,
            color: '#666',
            background: 'none',
            border: '1px solid #ddd',
            borderRadius: 6,
            padding: '4px 10px',
            cursor: 'pointer',
          }}
        >
          Back
        </button>
      </div>

      <p style={{ color: '#666', fontSize: 13, marginBottom: 20 }}>
        All specialists offer discounted rates for Japan Life Assistant Pro members.
        Fees are paid directly to the specialist.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 16 }}>
        <select
          value={location}
          onChange={e => setLocation(e.target.value)}
          style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid #ddd', fontSize: 13 }}
        >
          {LOCATIONS.map(l => (
            <option key={l.value} value={l.value}>{l.label}</option>
          ))}
        </select>
        <select
          value={category}
          onChange={e => setCategory(e.target.value)}
          style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid #ddd', fontSize: 13 }}
        >
          {CATEGORIES.map(c => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
        <select
          value={language}
          onChange={e => setLanguage(e.target.value)}
          style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid #ddd', fontSize: 13 }}
        >
          {LANGUAGES.map(l => (
            <option key={l.value} value={l.value}>{l.label}</option>
          ))}
        </select>
      </div>

      <p style={{ fontSize: 12, color: '#999', marginBottom: 12 }}>
        {filtered.length} specialist{filtered.length !== 1 ? 's' : ''} found
      </p>

      {filtered.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '3rem',
          color: '#666',
          fontSize: 14,
          border: '1px solid #eee',
          borderRadius: 12,
        }}>
          No specialists match your filters. Try broadening your search.
        </div>
      ) : (
        filtered.map((s: Specialist) => (
          <div
            key={s.id}
            style={{
              border: '1px solid #eee',
              borderRadius: 12,
              padding: '16px',
              marginBottom: 12,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              gap: 12,
            }}
          >
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 2 }}>
                {s.name}
              </div>
              <div style={{ fontSize: 12, color: '#888', marginBottom: 8 }}>
                {s.type} · {s.location}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 4, marginBottom: 8 }}>
                {s.languages.map((l: string) => (
                  <span
                    key={l}
                    style={{
                      fontSize: 10,
                      padding: '2px 7px',
                      borderRadius: 20,
                      background: '#e8f4fd',
                      color: '#1a6fa8',
                    }}
                  >
                    {l}
                  </span>
                ))}
                {s.categories.map((c: string) => (
                  <span
                    key={c}
                    style={{
                      fontSize: 10,
                      padding: '2px 7px',
                      borderRadius: 20,
                      background: '#e8f5e9',
                      color: '#2e7d32',
                    }}
                  >
                    {c}
                  </span>
                ))}
              </div>
              <div style={{ fontSize: 13, color: '#555', lineHeight: 1.5 }}>
                {s.note}
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' as const, alignItems: 'flex-end' as const, gap: 6, flexShrink: 0 }}>
              <a
                href={'mailto:' + s.email}
                style={{
                  display: 'inline-block',
                  padding: '7px 14px',
                  borderRadius: 8,
                  background: '#1a1a1a',
                  color: '#fff',
                  fontSize: 12,
                  fontWeight: 500,
                  textDecoration: 'none',
                  whiteSpace: 'nowrap' as const,
                }}
              >
                Contact
              </a>
              <div style={{ fontSize: 11, color: '#999' }}>{s.fee}</div>
            </div>
          </div>
        ))
      )}
    </main>
  )
}
