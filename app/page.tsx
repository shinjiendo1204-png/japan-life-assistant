'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function Home() {
  const [user, setUser] = useState<any>(null)
  const [plan, setPlan] = useState<string>('free')
  const [authLoading, setAuthLoading] = useState(true)
  const [language, setLanguage] = useState<'en' | 'es' | 'pt'>('en')
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [text, setText] = useState('')
  const [output, setOutput] = useState('')
  const [loading, setLoading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [inputMode, setInputMode] = useState<'upload' | 'text'>('upload')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) {
        router.push('/auth')
        return
      }
      setUser(user)
      const { data: profile } = await supabase
        .from('profiles')
        .select('plan')
        .eq('id', user.id)
        .single()
      setPlan(profile?.plan || 'free')
      setAuthLoading(false)
    })
  }, [])

  const handleFile = (f: File) => {
    setFile(f)
    setOutput('')
    if (f.type.startsWith('image/')) {
      const url = URL.createObjectURL(f)
      setPreview(url)
    } else {
      setPreview(null)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const f = e.dataTransfer.files[0]
    if (f) handleFile(f)
  }

  const handleAnalyze = async () => {
    if (!file && !text.trim()) return
    setLoading(true)
    setOutput('')

    try {
      const formData = new FormData()
      if (file) formData.append('file', file)
      if (text) formData.append('text', text)
      formData.append('language', language)

      const res = await fetch('/api/analyze', {
        method: 'POST',
        body: formData,
      })
      const data = await res.json()

      if (data.error === 'FREE_LIMIT_REACHED') {
        setOutput('__FREE_LIMIT__')
      } else {
        setOutput(data.result || data.error)
      }
    } catch (e) {
      setOutput('Error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const labels = {
    en: {
      tagline: 'Japanese paperwork, sorted.',
      subtitle: 'Upload any Japanese document — mail, contracts, notices — and get an instant explanation in your language.',
      upload: 'Upload file',
      uploadDesc: 'Drag & drop or click to upload\nJPG, PNG, PDF supported',
      orText: 'or paste text',
      textPlaceholder: 'Paste Japanese text here...',
      analyze: 'Analyze Document',
      analyzing: 'Analyzing...',
      copy: 'Copy result',
      copied: 'Copied!',
      pricing: 'View plans',
      signout: 'Sign out',
      freeLimitTitle: 'Free plan limit reached',
      freeLimitDesc: 'Upgrade to Standard for unlimited document analysis ($15/month)',
      upgrade: 'Upgrade now',
    },
    es: {
      tagline: 'Trámites japoneses, resueltos.',
      subtitle: 'Sube cualquier documento japonés — correo, contratos, avisos — y obtén una explicación instantánea en tu idioma.',
      upload: 'Subir archivo',
      uploadDesc: 'Arrastra y suelta o haz clic para subir\nJPG, PNG, PDF admitidos',
      orText: 'o pega el texto',
      textPlaceholder: 'Pega texto japonés aquí...',
      analyze: 'Analizar Documento',
      analyzing: 'Analizando...',
      copy: 'Copiar resultado',
      copied: '¡Copiado!',
      pricing: 'Ver planes',
      signout: 'Cerrar sesión',
      freeLimitTitle: 'Límite del plan gratuito alcanzado',
      freeLimitDesc: 'Actualiza a Standard para análisis ilimitado ($15/mes)',
      upgrade: 'Actualizar ahora',
    },
    pt: {
      tagline: 'Burocracia japonesa, resolvida.',
      subtitle: 'Envie qualquer documento japonês — correio, contratos, avisos — e obtenha uma explicação instantânea no seu idioma.',
      upload: 'Enviar arquivo',
      uploadDesc: 'Arraste e solte ou clique para enviar\nJPG, PNG, PDF suportados',
      orText: 'ou cole o texto',
      textPlaceholder: 'Cole o texto japonês aqui...',
      analyze: 'Analisar Documento',
      analyzing: 'Analisando...',
      copy: 'Copiar resultado',
      copied: 'Copiado!',
      pricing: 'Ver planos',
      signout: 'Sair',
      freeLimitTitle: 'Limite do plano gratuito atingido',
      freeLimitDesc: 'Atualize para Standard para análise ilimitada ($15/mês)',
      upgrade: 'Atualizar agora',
    },
  }

  const t = labels[language]
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (authLoading) return (
    <main style={{ maxWidth: 680, margin: '0 auto', padding: '2rem 1rem' }}>
      <p style={{ color: '#666' }}>Loading...</p>
    </main>
  )

  return (
    <main style={{ maxWidth: 680, margin: '0 auto', padding: '2rem 1rem' }}>

      {/* ナビゲーション */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 36 }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.5px' }}>SortJapan</div>
          <div style={{ fontSize: 12, color: '#999', marginTop: 1 }}>{t.tagline}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {/* 言語切替 */}
          <div style={{ display: 'flex', background: '#f5f5f5', borderRadius: 20, padding: 3, gap: 2 }}>
            {(['en', 'es', 'pt'] as const).map(lang => (
              <button
                key={lang}
                onClick={() => setLanguage(lang)}
                style={{
                  fontSize: 11, padding: '3px 10px', borderRadius: 16,
                  background: language === lang ? '#fff' : 'transparent',
                  color: language === lang ? '#1a1a1a' : '#999',
                  border: 'none', cursor: 'pointer', fontWeight: language === lang ? 500 : 400,
                  boxShadow: language === lang ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                }}
              >
                {lang.toUpperCase()}
              </button>
            ))}
          </div>
          <button
            onClick={() => router.push('/pricing')}
            style={{ fontSize: 12, color: '#666', background: 'none', border: '1px solid #ddd', borderRadius: 6, padding: '5px 10px', cursor: 'pointer' }}
          >
            {t.pricing}
          </button>
          <button
            onClick={() => supabase.auth.signOut().then(() => router.push('/auth'))}
            style={{ fontSize: 12, color: '#666', background: 'none', border: '1px solid #ddd', borderRadius: 6, padding: '5px 10px', cursor: 'pointer' }}
          >
            {t.signout}
          </button>
        </div>
      </div>

      {/* ヒーロー */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8, lineHeight: 1.3 }}>
          {t.subtitle}
        </h1>
      </div>

      {/* 入力モード切替 */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {(['upload', 'text'] as const).map(mode => (
          <button
            key={mode}
            onClick={() => setInputMode(mode)}
            style={{
              fontSize: 13, padding: '6px 16px', borderRadius: 20,
              background: inputMode === mode ? '#1a1a1a' : '#fff',
              color: inputMode === mode ? '#fff' : '#666',
              border: inputMode === mode ? 'none' : '1px solid #ddd',
              cursor: 'pointer', fontWeight: inputMode === mode ? 500 : 400,
            }}
          >
            {mode === 'upload'
              ? (language === 'en' ? '📎 Upload file' : language === 'es' ? '📎 Subir archivo' : '📎 Enviar arquivo')
              : (language === 'en' ? '✏️ Paste text' : language === 'es' ? '✏️ Pegar texto' : '✏️ Colar texto')}
          </button>
        ))}
      </div>

      {/* アップロードエリア */}
      {inputMode === 'upload' && (
        <div
          onDrop={handleDrop}
          onDragOver={e => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onClick={() => fileInputRef.current?.click()}
          style={{
            border: `2px dashed ${dragOver ? '#1a1a1a' : file ? '#4caf50' : '#ddd'}`,
            borderRadius: 12,
            padding: '2rem',
            textAlign: 'center',
            cursor: 'pointer',
            background: dragOver ? '#fafafa' : file ? '#f0fff4' : '#fff',
            transition: 'all 0.2s',
            marginBottom: 16,
          }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,.pdf"
            style={{ display: 'none' }}
            onChange={e => { if (e.target.files?.[0]) handleFile(e.target.files[0]) }}
          />
          {preview ? (
            <div>
              <img src={preview} alt="preview" style={{ maxHeight: 200, maxWidth: '100%', borderRadius: 8, marginBottom: 8 }} />
              <div style={{ fontSize: 13, color: '#4caf50', fontWeight: 500 }}>{file?.name}</div>
              <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>
                {language === 'en' ? 'Click to change file' : language === 'es' ? 'Haz clic para cambiar' : 'Clique para alterar'}
              </div>
            </div>
          ) : file ? (
            <div>
              <div style={{ fontSize: 32, marginBottom: 8 }}>📄</div>
              <div style={{ fontSize: 13, color: '#4caf50', fontWeight: 500 }}>{file.name}</div>
              <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>
                {language === 'en' ? 'Click to change file' : language === 'es' ? 'Haz clic para cambiar' : 'Clique para alterar'}
              </div>
            </div>
          ) : (
            <div>
              <div style={{ fontSize: 32, marginBottom: 8 }}>📬</div>
              <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 4 }}>{t.upload}</div>
              <div style={{ fontSize: 12, color: '#999', whiteSpace: 'pre-line' }}>{t.uploadDesc}</div>
            </div>
          )}
        </div>
      )}

      {/* テキスト入力エリア */}
      {inputMode === 'text' && (
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder={t.textPlaceholder}
          rows={6}
          style={{
            width: '100%', padding: '12px', borderRadius: 12,
            border: '1px solid #ddd', fontSize: 14, resize: 'vertical' as const,
            fontFamily: 'inherit', boxSizing: 'border-box' as const,
            marginBottom: 16,
          }}
        />
      )}

      {/* 解析ボタン */}
      <button
        onClick={handleAnalyze}
        disabled={loading || (inputMode === 'upload' ? !file : !text.trim())}
        style={{
          width: '100%', padding: '13px', borderRadius: 10,
          background: loading || (inputMode === 'upload' ? !file : !text.trim()) ? '#ccc' : '#1a1a1a',
          color: '#fff', border: 'none', fontSize: 15, fontWeight: 500,
          cursor: loading || (inputMode === 'upload' ? !file : !text.trim()) ? 'default' : 'pointer',
          marginBottom: 20,
        }}
      >
        {loading ? t.analyzing : t.analyze}
      </button>

      {/* 結果表示 */}
      {output === '__FREE_LIMIT__' ? (
        <div style={{
          background: '#fff8e1', border: '1px solid #ffe082', borderRadius: 12,
          padding: '20px', textAlign: 'center',
        }}>
          <div style={{ fontSize: 24, marginBottom: 8 }}>⚠️</div>
          <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>{t.freeLimitTitle}</div>
          <div style={{ fontSize: 13, color: '#666', marginBottom: 16 }}>{t.freeLimitDesc}</div>
          <button
            onClick={() => router.push('/pricing')}
            style={{
              padding: '10px 24px', borderRadius: 8, background: '#1a1a1a',
              color: '#fff', border: 'none', fontSize: 14, fontWeight: 500, cursor: 'pointer',
            }}
          >
            {t.upgrade}
          </button>
        </div>
      ) : output ? (
        <div>
          <div style={{
            background: '#f9f9f9', borderRadius: 12, padding: '20px',
            border: '1px solid #eee', whiteSpace: 'pre-wrap' as const,
            fontSize: 14, lineHeight: 1.8,
          }}>
            {output}
          </div>
          <button
            onClick={handleCopy}
            style={{
              marginTop: 10, width: '100%', padding: '10px',
              borderRadius: 8, fontSize: 13, background: '#fff',
              color: '#1a1a1a', border: '1px solid #ddd', cursor: 'pointer',
            }}
          >
            {copied ? t.copied : t.copy}
          </button>
        </div>
      ) : null}

    </main>
  )
}