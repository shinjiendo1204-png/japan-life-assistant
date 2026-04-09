import Link from 'next/link'

export default function TermsPage() {
  return (
    <main style={{ maxWidth: 680, margin: '0 auto', padding: '2rem 1rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <Link href="/" style={{ fontSize: 13, color: '#888', textDecoration: 'none' }}>← Back</Link>
      </div>

      <div style={{ fontSize: 20, fontWeight: 500, letterSpacing: '-0.5px', color: '#111', marginBottom: 32 }}>
        Sort<span style={{ color: '#e53935' }}>Japan</span>
      </div>

      <h1 style={{ fontSize: 26, fontWeight: 500, color: '#111', marginBottom: 8 }}>Terms of Service</h1>
      <p style={{ fontSize: 13, color: '#aaa', marginBottom: 32 }}>Last updated: April 2026</p>

      <div style={{ fontSize: 15, lineHeight: 1.8, color: '#444' }}>

        <Section title="1. Acceptance of terms">
          By accessing or using SortJapan, you agree to be bound by these Terms of Service. If you do not agree, please do not use the service.
        </Section>

        <Section title="2. Description of service">
          SortJapan provides AI-powered analysis of Japanese documents to help foreigners living in Japan understand official correspondence, contracts, and notices. The service is provided "as is" for informational purposes only.
        </Section>

        <Section title="3. Account registration">
          You must provide a valid email address to register. You are responsible for maintaining the confidentiality of your account credentials and for all activity that occurs under your account. You must be at least 16 years of age to use this service.
        </Section>

        <Section title="4. Acceptable use">
          <div>You agree not to:</div>
          <ul style={{ marginTop: 8, paddingLeft: 20 }}>
            <li>Use the service for any unlawful purpose</li>
            <li>Attempt to circumvent usage limits or access controls</li>
            <li>Use automated scripts or bots to make requests</li>
            <li>Resell or redistribute analysis results commercially</li>
            <li>Upload documents containing third-party personal data without their consent</li>
            <li>Attempt to reverse-engineer or extract training data from the AI</li>
          </ul>
        </Section>

        <Section title="5. Subscription and billing">
          Free plan users receive 1 document analysis per month at no cost. Standard plan subscribers pay $15 per month and receive up to 30 document analyses per month. Subscriptions are billed monthly and renew automatically until cancelled. You may cancel at any time, and cancellation takes effect at the end of the current billing period. No refunds are provided for partial months.
        </Section>

        <Section title="6. Intellectual property">
          The SortJapan name, logo, and interface are the property of SortJapan. The AI-generated analysis results are provided for your personal use only and may not be resold or republished without permission.
        </Section>

        <Section title="7. Disclaimer of warranties">
          THE SERVICE IS PROVIDED "AS IS" WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED. WE DO NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, ERROR-FREE, OR THAT AI ANALYSIS WILL BE ACCURATE OR COMPLETE.
        </Section>

        <Section title="8. Limitation of liability">
          TO THE MAXIMUM EXTENT PERMITTED BY LAW, SORTJAPAN SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES RESULTING FROM YOUR USE OF OR INABILITY TO USE THE SERVICE.
        </Section>

        <Section title="9. Termination">
          We reserve the right to suspend or terminate your account if you violate these Terms of Service. Upon termination, your right to use the service ceases immediately.
        </Section>

        <Section title="10. Governing law">
          These Terms are governed by the laws of Japan. Any disputes arising from these Terms shall be subject to the exclusive jurisdiction of the courts of Japan.
        </Section>

        <Section title="11. Changes to terms">
          We may modify these Terms at any time. We will notify you of significant changes. Continued use of the service after changes constitutes acceptance of the new Terms.
        </Section>

        <Section title="12. Contact">
          <div>
            For questions about these Terms, contact us at:{' '}
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
