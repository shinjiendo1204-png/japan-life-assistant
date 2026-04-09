import Link from 'next/link'

const LANGUAGES = [
  { flag: '🇺🇸', label: 'English' },
  { flag: '🇪🇸', label: 'Español' },
  { flag: '🇧🇷', label: 'Português' },
  { flag: '🇨🇳', label: '中文' },
  { flag: '🇰🇷', label: '한국어' },
  { flag: '🇻🇳', label: 'Tiếng Việt' },
  { flag: '🇵🇭', label: 'Filipino' },
  { flag: '🇳🇵', label: 'नेपाली' },
  { flag: '🇮🇩', label: 'Indonesia' },
  { flag: '🇹🇭', label: 'ภาษาไทย' },
  { flag: '🇲🇲', label: 'မြန်မာ' },
  { flag: '🇫🇷', label: 'Français' },
]

const CATEGORIES = [
  {
    icon: '🏛️',
    title: 'Official & government',
    desc: 'Tax bills, pension notices, residence card renewal, city hall documents — with deadlines and payment steps.',
  },
  {
    icon: '🏠',
    title: 'Housing & rental',
    desc: 'Lease contracts, renewal notices, eviction warnings, repair requests — know your rights as a tenant.',
  },
  {
    icon: '💼',
    title: 'Work & business',
    desc: 'Emails from your boss, salary slips, employment contracts, workplace notices — including cultural context.',
  },
  {
    icon: '🏦',
    title: 'Banking & finance',
    desc: 'Bank notices, credit card bills, loan documents, automatic payment confirmations.',
  },
  {
    icon: '🏥',
    title: 'Healthcare & medical',
    desc: 'Hospital letters, prescriptions, health check results, insurance forms — explained in plain language.',
  },
  {
    icon: '🏫',
    title: 'School & education',
    desc: 'School notices, event announcements, permission slips, PTA letters — never miss a deadline.',
  },
  {
    icon: '💡',
    title: 'Utilities & services',
    desc: 'NHK, electricity, gas, water, internet, delivery notices — cancellation and change procedures too.',
  },
  {
    icon: '🏘️',
    title: 'Neighborhood & daily life',
    desc: 'Building notices, community announcements, noise complaints, construction notices.',
  },
  {
    icon: '⚠️',
    title: 'Legal & urgent notices',
    desc: 'Court documents, seizure warnings, formal demands — know exactly how serious it is and what to do.',
  },
]

export default function LandingPage() {
  return (
    <main style={{ maxWidth: 680, margin: '0 auto', padding: '1.5rem 1rem' }}>

      {/* ナビ */}
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <Link href="/landing" style={{ fontSize: 20, fontWeight: 500, letterSpacing: '-0.5px', color: '#111', textDecoration: 'none' }}>
          Sort<span style={{ color: '#e53935' }}>Japan</span>
        </Link>
        <div style={{ display: 'flex', gap: 8 }}>
          <Link href="/auth" style={{
            fontSize: 13, padding: '7px 16px', borderRadius: 20,
            border: '1px solid #ddd', color: '#666',
            textDecoration: 'none', background: 'transparent',
          }}>
            Sign in
          </Link>
          <Link href="/auth?mode=signup" style={{
            fontSize: 13, padding: '7px 16px', borderRadius: 20,
            background: '#111', color: '#fff',
            textDecoration: 'none', border: 'none',
            fontWeight: 500,
          }}>
            Get started free
          </Link>
        </div>
      </nav>

      {/* ヒーロー */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{
          display: 'inline-block',
          fontSize: 11, fontWeight: 500,
          background: '#fff3f3', color: '#e53935',
          border: '1px solid #ffd0d0',
          borderRadius: 20, padding: '3px 12px',
          marginBottom: 14, letterSpacing: '0.04em',
        }}>
          Supports 12 languages
        </div>
        <h1 style={{
          fontSize: 34, fontWeight: 500, lineHeight: 1.2,
          color: '#111', marginBottom: 14, letterSpacing: '-0.5px',
        }}>
          Any Japanese document,<br />explained instantly.
        </h1>
        <p style={{ fontSize: 15, color: '#666', lineHeight: 1.7, maxWidth: 520, marginBottom: 22 }}>
          Tax bills, work emails, rental contracts, hospital letters — upload anything in Japanese
          and get a clear explanation in your language in seconds. No Japanese needed.
        </p>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' as const }}>
          <Link href="/auth?mode=signup" style={{
            display: 'inline-block',
            padding: '12px 26px', borderRadius: 12,
            background: '#111', color: '#fff',
            textDecoration: 'none', fontSize: 15, fontWeight: 500,
          }}>
            Try free — 1 analysis/month
          </Link>
          <Link href="/pricing" style={{
            display: 'inline-block',
            padding: '12px 20px', borderRadius: 12,
            background: 'transparent', color: '#555',
            textDecoration: 'none', fontSize: 14,
            border: '1px solid #e0e0e0',
          }}>
            See plans →
          </Link>
        </div>
        <p style={{ fontSize: 12, color: '#bbb', marginTop: 8 }}>
          Free plan available · No credit card required
        </p>
      </div>

      {/* サンプル解析結果 */}
      <div style={{
        background: '#f7f7f7',
        borderRadius: 16,
        padding: '1.25rem',
        marginBottom: '2rem',
        border: '0.5px solid #e8e8e8',
      }}>
        <div style={{ fontSize: 11, fontWeight: 500, color: '#aaa', textTransform: 'uppercase' as const, letterSpacing: '0.08em', marginBottom: 14 }}>
          Example result — 住民税通知書
        </div>
        {[
          { icon: '📄', label: 'Document type', value: 'Official · Resident tax notice (住民税通知書)' },
          { icon: '📋', label: 'Summary', value: 'Annual tax bill from your city. Shows the total amount split into 4 installments throughout the year.' },
          { icon: '⏰', label: 'Deadline & amount', value: '¥52,000 total · First payment due June 30' },
          { icon: '✅', label: 'What to do', value: '1. Take the slip to any convenience store. 2. Show the barcode at the register. 3. Pay in cash. Done.' },
          { icon: '💡', label: 'Cultural context', value: 'This is normal — everyone in Japan pays this. Ignoring it leads to penalties and eventually asset seizure.' },
        ].map(item => (
          <div key={item.label} style={{
            borderBottom: '0.5px solid #ebebeb',
            paddingBottom: 10, marginBottom: 10,
          }}>
            <div style={{ fontSize: 11, fontWeight: 500, color: '#999', marginBottom: 3 }}>
              {item.icon} {item.label}
            </div>
            <div style={{ fontSize: 13, color: '#333', lineHeight: 1.5 }}>{item.value}</div>
          </div>
        ))}
        <div style={{ fontSize: 11, color: '#bbb', marginTop: 4 }}>
          ⚠️ This analysis is for reference only.
        </div>
      </div>

      {/* カテゴリ一覧 */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ fontSize: 11, fontWeight: 500, color: '#aaa', textTransform: 'uppercase' as const, letterSpacing: '0.08em', marginBottom: 16 }}>
          What we handle
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 10 }}>
          {CATEGORIES.map(cat => (
            <div key={cat.title} style={{
              background: '#fafafa',
              borderRadius: 12,
              padding: '0.875rem 1rem',
              border: '0.5px solid #ebebeb',
            }}>
              <div style={{ fontSize: 18, marginBottom: 6 }}>{cat.icon}</div>
              <div style={{ fontSize: 13, fontWeight: 500, color: '#111', marginBottom: 3 }}>{cat.title}</div>
              <div style={{ fontSize: 11, color: '#888', lineHeight: 1.5 }}>{cat.desc}</div>
            </div>
          ))}
          {/* 9番目が奇数なのでフルwidth */}
          <div style={{
            gridColumn: '1 / -1',
            background: '#fff3f3',
            borderRadius: 12,
            padding: '0.875rem 1rem',
            border: '0.5px solid #ffd0d0',
            display: 'flex', alignItems: 'flex-start', gap: 12,
          }}>
            <div style={{ fontSize: 18, flexShrink: 0 }}>⚠️</div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 500, color: '#c62828', marginBottom: 3 }}>Legal & urgent notices</div>
              <div style={{ fontSize: 11, color: '#888', lineHeight: 1.5 }}>Court documents, seizure warnings, formal demands — know exactly how serious it is and what to do next.</div>
            </div>
          </div>
        </div>
      </div>

      {/* 言語 */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ fontSize: 11, fontWeight: 500, color: '#aaa', textTransform: 'uppercase' as const, letterSpacing: '0.08em', marginBottom: 14 }}>
          12 languages supported
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 8 }}>
          {LANGUAGES.map(lang => (
            <div key={lang.label} style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: '#f5f5f5', borderRadius: 20,
              padding: '5px 12px', fontSize: 13, color: '#444',
            }}>
              <span style={{ fontSize: 14 }}>{lang.flag}</span>
              {lang.label}
            </div>
          ))}
        </div>
      </div>

      {/* 料金 */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ fontSize: 11, fontWeight: 500, color: '#aaa', textTransform: 'uppercase' as const, letterSpacing: '0.08em', marginBottom: 16 }}>
          Pricing
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
          <div style={{
            border: '1px solid #e8e8e8', borderRadius: 14,
            padding: '1.25rem', background: '#fff',
          }}>
            <div style={{ fontSize: 14, fontWeight: 500, color: '#111', marginBottom: 8 }}>Free</div>
            <div style={{ fontSize: 28, fontWeight: 500, color: '#111', marginBottom: 4 }}>$0</div>
            <div style={{ fontSize: 12, color: '#aaa', marginBottom: 12 }}>1 analysis / month</div>
            <Link href="/auth?mode=signup" style={{
              display: 'block', textAlign: 'center' as const,
              padding: '9px', borderRadius: 8,
              border: '1px solid #111', color: '#111',
              textDecoration: 'none', fontSize: 13,
            }}>
              Get started
            </Link>
          </div>
          <div style={{
            border: '2px solid #111', borderRadius: 14,
            padding: '1.25rem', background: '#fff',
            position: 'relative' as const,
          }}>
            <div style={{
              position: 'absolute' as const, top: -11, left: '50%',
              transform: 'translateX(-50%)',
              background: '#111', color: '#fff',
              fontSize: 10, fontWeight: 500,
              padding: '2px 10px', borderRadius: 20,
              whiteSpace: 'nowrap' as const,
            }}>Most popular</div>
            <div style={{ fontSize: 14, fontWeight: 500, color: '#111', marginBottom: 8 }}>Standard</div>
            <div style={{ fontSize: 28, fontWeight: 500, color: '#111', marginBottom: 4 }}>$15</div>
            <div style={{ fontSize: 12, color: '#aaa', marginBottom: 12 }}>30 analyses / month</div>
            <Link href="/auth?mode=signup" style={{
              display: 'block', textAlign: 'center' as const,
              padding: '9px', borderRadius: 8,
              background: '#111', color: '#fff',
              textDecoration: 'none', fontSize: 13, fontWeight: 500,
            }}>
              Subscribe
            </Link>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div style={{
        background: '#111', borderRadius: 16,
        padding: '2rem', textAlign: 'center' as const,
        marginBottom: '2rem',
      }}>
        <div style={{ fontSize: 20, fontWeight: 500, color: '#fff', marginBottom: 8 }}>
          Stop guessing. Start understanding.
        </div>
        <div style={{ fontSize: 14, color: '#999', marginBottom: 20, lineHeight: 1.6 }}>
          From tax bills to work emails —<br />everything in Japanese, explained in your language.
        </div>
        <Link href="/auth?mode=signup" style={{
          display: 'inline-block',
          padding: '12px 28px', borderRadius: 10,
          background: '#fff', color: '#111',
          textDecoration: 'none', fontSize: 14, fontWeight: 500,
        }}>
          Get started free →
        </Link>
      </div>

    </main>
  )
}
