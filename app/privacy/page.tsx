import Link from 'next/link'

export default function PrivacyPage() {
  return (
    <main style={{ maxWidth: 680, margin: '0 auto', padding: '2rem 1rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <Link href="/" style={{ fontSize: 13, color: '#888', textDecoration: 'none' }}>← Back</Link>
      </div>

      <div style={{ fontSize: 20, fontWeight: 500, letterSpacing: '-0.5px', color: '#111', marginBottom: 32 }}>
        Sort<span style={{ color: '#e53935' }}>Japan</span>
      </div>

      <h1 style={{ fontSize: 26, fontWeight: 500, color: '#111', marginBottom: 8 }}>Privacy Policy</h1>
      <p style={{ fontSize: 13, color: '#aaa', marginBottom: 32 }}>Last updated: April 2026</p>

      <div style={{ fontSize: 15, lineHeight: 1.8, color: '#444' }}>

        <Section title="1. Information we collect">
          <div>
            <span style={{ fontWeight: 500 }}>Account information:</span> When you register, we collect your email address and a hashed password. We do not store your plain-text password.
          </div>
          <div style={{ marginTop: 10 }}>
            <span style={{ fontWeight: 500 }}>Documents you upload:</span> Files and text you submit for analysis are sent to Anthropic's Claude API for processing. We do not permanently store the content of your uploaded documents on our servers.
          </div>
          <div style={{ marginTop: 10 }}>
            <span style={{ fontWeight: 500 }}>Usage data:</span> We track how many document analyses you have performed in the current month to enforce plan limits. We do not store the content of those analyses long-term.
          </div>
          <div style={{ marginTop: 10 }}>
            <span style={{ fontWeight: 500 }}>Payment information:</span> Payments are processed by Stripe. We do not store your credit card details. We only receive a customer ID and subscription status from Stripe.
          </div>
        </Section>

        <Section title="2. How we use your information">
          We use the information we collect to provide and improve the service, enforce plan usage limits, process payments through Stripe, and respond to your support requests. We do not sell your personal data to third parties.
        </Section>

        <Section title="3. Third-party services">
          <div>SortJapan uses the following third-party services:</div>
          <ul style={{ marginTop: 8, paddingLeft: 20 }}>
            <li>
              <span style={{ fontWeight: 500 }}>Anthropic (Claude API)</span> — processes your document content for AI analysis.{' '}
              <a href="https://www.anthropic.com/privacy" target="_blank" rel="noopener noreferrer" style={{ color: '#e53935' }}>Anthropic's privacy policy</a>
            </li>
            <li>
              <span style={{ fontWeight: 500 }}>Supabase</span> — stores your account data and usage statistics.{' '}
              <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer" style={{ color: '#e53935' }}>Supabase's privacy policy</a>
            </li>
            <li>
              <span style={{ fontWeight: 500 }}>Stripe</span> — processes payments.{' '}
              <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer" style={{ color: '#e53935' }}>Stripe's privacy policy</a>
            </li>
            <li>
              <span style={{ fontWeight: 500 }}>Vercel</span> — hosts the application.{' '}
              <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" style={{ color: '#e53935' }}>Vercel's privacy policy</a>
            </li>
          </ul>
        </Section>

        <Section title="4. Document data">
          Documents you upload are transmitted to Anthropic's API for analysis and are subject to Anthropic's data retention policies. We strongly recommend that you do not upload documents containing highly sensitive personal information such as passport numbers, bank account details, or medical records unless strictly necessary.
        </Section>

        <Section title="5. Data retention">
          Your account information (email, plan status, usage count) is retained for as long as your account is active. You may request deletion of your account and associated data by contacting us at support@sortjapan.com. We will process deletion requests within 30 days.
        </Section>

        <Section title="6. Cookies">
          We use session cookies to keep you logged in. We do not use advertising or tracking cookies. You may disable cookies in your browser settings, but this will prevent you from staying logged in.
        </Section>

        <Section title="7. Children's privacy">
          SortJapan is not intended for users under the age of 16. We do not knowingly collect personal information from children under 16.
        </Section>

        <Section title="8. Your rights">
          Depending on your location, you may have the right to access, correct, or delete your personal data. To exercise these rights, contact us at support@sortjapan.com.
        </Section>

        <Section title="9. Changes to this policy">
          We may update this Privacy Policy from time to time. We will notify you of significant changes via email or a notice on our website. Continued use of the service after changes constitutes acceptance of the updated policy.
        </Section>

        <Section title="10. Contact">
          <div>
            For privacy-related questions, please contact us at:{' '}
            <a href="mailto:support@sortjapan.com" style={{ color: '#e53935' }}>support@sortjapan.com</a>
          </div>
        </Section>

      </div>
    </main>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <h2 style={{ fontSize: 16, fontWeight: 500, color: '#111', marginBottom: 8 }}>{title}</h2>
      <div>{children}</div>
    </div>
  )
}
