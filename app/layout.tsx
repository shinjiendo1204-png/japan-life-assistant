import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'SortJapan — Japanese documents, explained instantly',
  description: 'Upload any Japanese mail, contract, or notice. Get a clear explanation in your language in seconds.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', background: '#fff', color: '#111' }}>
        {children}
        <footer style={{
          borderTop: '0.5px solid #ebebeb',
          padding: '2rem 1rem',
          marginTop: '3rem',
        }}>
          <div style={{ maxWidth: 680, margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' as const, gap: 12 }}>
              <div style={{ fontSize: 14, fontWeight: 500, color: '#111', letterSpacing: '-0.3px' }}>
                Sort<span style={{ color: '#e53935' }}>Japan</span>
              </div>
              <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' as const }}>
                <a href="/disclaimer" style={{ fontSize: 12, color: '#888', textDecoration: 'none' }}>Disclaimer</a>
                <a href="/privacy" style={{ fontSize: 12, color: '#888', textDecoration: 'none' }}>Privacy Policy</a>
                <a href="/terms" style={{ fontSize: 12, color: '#888', textDecoration: 'none' }}>Terms of Service</a>
                <a href="/legal" style={{ fontSize: 12, color: '#888', textDecoration: 'none' }}>Legal Notice</a>
                <a href="mailto:support@sortjapan.com" style={{ fontSize: 12, color: '#888', textDecoration: 'none' }}>Contact</a>
              </div>
            </div>
            <div style={{ marginTop: 12, fontSize: 11, color: '#bbb', lineHeight: 1.5 }}>
              © {new Date().getFullYear()} SortJapan. All rights reserved. · This service provides AI-generated document analysis for informational purposes only. Always confirm with relevant authorities before taking action.
            </div>
          </div>
        </footer>
      </body>
    </html>
  )
}
