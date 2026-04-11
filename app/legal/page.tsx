import Link from 'next/link'

export default function LegalNoticePage() {
  return (
    <main style={{ maxWidth: 680, margin: '0 auto', padding: '2rem 1rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <Link href="/" style={{ fontSize: 13, color: '#888', textDecoration: 'none' }}>← Back</Link>
      </div>

      <div style={{ fontSize: 20, fontWeight: 500, letterSpacing: '-0.5px', color: '#111', marginBottom: 32 }}>
        Sort<span style={{ color: '#e53935' }}>Japan</span>
      </div>

      <h1 style={{ fontSize: 26, fontWeight: 500, color: '#111', marginBottom: 8 }}>Act on Specified Commercial Transactions</h1>
      <p style={{ fontSize: 13, color: '#aaa', marginBottom: 32 }}>特定商取引法に基づく表記</p>

      <div style={{ fontSize: 15, lineHeight: 1.8, color: '#444' }}>

        <Section title="Seller / 販売業者">
          {/* ここに氏名または法人名を記入 */}
          [Shinji Endo]
        </Section>

        <Section title="Representative / 運営責任者">
          {/* ここに責任者名を記入 */}
          [Shinji Endo]
        </Section>

        <Section title="Address / 住所">
          {/* ここに住所を記入 */}
          [596-0001 Osaka, Kishiwada, Isonokami-cho, 1-11-33-907] 
        </Section>

        <Section title="Contact Number / 電話番号">
          {/* ここに電話番号を記入 */}
          [080-4709-6388]
        </Section>

        <Section title="Email Address / メールアドレス">
          <a href="mailto:support@sortjapan.com" style={{ color: '#e53935' }}>support@sortjapan.com</a>
        </Section>

        <Section title="Sales Price / 販売価格">
          <div>Standard Plan: $15 / month</div>
          <div>Free Plan: $0</div>
          <div style={{ fontSize: 13, color: '#888', marginTop: 4 }}>
            *Prices are as displayed on the pricing page. Internet connection fees are the responsibility of the customer.
          </div>
        </Section>

        <Section title="Payment Method / 支払方法">
          Credit Card (Processed via Stripe)
          Google Pay (Processed via Stripe)
          Apple Pay (Processed via Stripe)
        </Section>

        <Section title="Payment Timing / 支払時期">
          Payments are processed at the time of initial application and automatically on the same day each subsequent month.
        </Section>

        <Section title="Service Delivery / 商品の引き渡し時期">
          The service is available immediately upon completion of the payment/registration process.
        </Section>

        <Section title="Returns and Cancellations / 返品・キャンセル">
          <div>
            Due to the nature of digital services, no refunds are provided after payment is processed. 
          </div>
          <div style={{ marginTop: 10 }}>
            <span style={{ fontWeight: 500 }}>Cancellation:</span> You may cancel your subscription at any time through the Account settings. Even after cancellation, you will continue to have access to the Standard Plan features until the end of your current billing period. No further charges will be made after the cancellation.
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