'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

const LANGUAGES = [
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'pt', label: 'Português', flag: '🇧🇷' },
  { code: 'zh', label: '中文', flag: '🇨🇳' },
  { code: 'ko', label: '한국어', flag: '🇰🇷' },
  { code: 'vi', label: 'Tiếng Việt', flag: '🇻🇳' },
  { code: 'tl', label: 'Filipino', flag: '🇵🇭' },
  { code: 'ne', label: 'नेपाली', flag: '🇳🇵' },
  { code: 'id', label: 'Indonesia', flag: '🇮🇩' },
  { code: 'th', label: 'ภาษาไทย', flag: '🇹🇭' },
  { code: 'my', label: 'မြန်မာ', flag: '🇲🇲' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
]

const UI: Record<string, Record<string, string>> = {
  en: {
    langLabel: 'Language',
    docLabel: 'Document',
    uploadTab: 'Upload file',
    textTab: 'Paste text',
    uploadTitle: 'Drop your document here',
    uploadDesc: 'JPG · PNG · PDF — drag & drop or click to browse',
    changeFile: 'Click to change file',
    textPlaceholder: 'Paste Japanese text here...',
    analyze: 'Analyze document',
    analyzing: 'Analyzing...',
    copy: 'Copy result',
    copied: 'Copied!',
    signout: 'Sign out',
    freeLimitTitle: 'Free plan limit reached',
    freeLimitDesc: 'Upgrade to Standard for 30 analyses per month ($15/month)',
    upgrade: 'Upgrade now',
    disclaimer: 'This analysis is for reference only. Confirm with the relevant office before taking action.',
    resultLabel: 'Result',
  },
  es: {
    langLabel: 'Idioma',
    docLabel: 'Documento',
    uploadTab: 'Subir archivo',
    textTab: 'Pegar texto',
    uploadTitle: 'Suelta tu documento aquí',
    uploadDesc: 'JPG · PNG · PDF — arrastra o haz clic para buscar',
    changeFile: 'Haz clic para cambiar',
    textPlaceholder: 'Pega texto japonés aquí...',
    analyze: 'Analizar documento',
    analyzing: 'Analizando...',
    copy: 'Copiar resultado',
    copied: '¡Copiado!',
    signout: 'Cerrar sesión',
    freeLimitTitle: 'Límite del plan gratuito alcanzado',
    freeLimitDesc: 'Actualiza a Standard para 30 análisis por mes ($15/mes)',
    upgrade: 'Actualizar ahora',
    disclaimer: 'Este análisis es solo de referencia. Confirme con la oficina correspondiente antes de actuar.',
    resultLabel: 'Resultado',
  },
  pt: {
    langLabel: 'Idioma',
    docLabel: 'Documento',
    uploadTab: 'Enviar arquivo',
    textTab: 'Colar texto',
    uploadTitle: 'Solte seu documento aqui',
    uploadDesc: 'JPG · PNG · PDF — arraste ou clique para procurar',
    changeFile: 'Clique para alterar',
    textPlaceholder: 'Cole o texto japonês aqui...',
    analyze: 'Analisar documento',
    analyzing: 'Analisando...',
    copy: 'Copiar resultado',
    copied: 'Copiado!',
    signout: 'Sair',
    freeLimitTitle: 'Limite do plano gratuito atingido',
    freeLimitDesc: 'Atualize para Standard para 30 análises por mês ($15/mês)',
    upgrade: 'Atualizar agora',
    disclaimer: 'Esta análise é apenas para referência. Confirme com o escritório relevante antes de agir.',
    resultLabel: 'Resultado',
  },
  zh: {
    langLabel: '语言',
    docLabel: '文件',
    uploadTab: '上传文件',
    textTab: '粘贴文字',
    uploadTitle: '将文件拖放到此处',
    uploadDesc: 'JPG · PNG · PDF — 拖放或点击浏览',
    changeFile: '点击更换文件',
    textPlaceholder: '在此粘贴日文文字...',
    analyze: '分析文件',
    analyzing: '分析中...',
    copy: '复制结果',
    copied: '已复制！',
    signout: '退出登录',
    freeLimitTitle: '已达到免费计划限制',
    freeLimitDesc: '升级到Standard,每月30次分析（每月$15）',
    upgrade: '立即升级',
    disclaimer: '此分析仅供参考。行动前请向相关机构确认。',
    resultLabel: '结果',
  },
  ko: {
    langLabel: '언어',
    docLabel: '문서',
    uploadTab: '파일 업로드',
    textTab: '텍스트 붙여넣기',
    uploadTitle: '여기에 문서를 드롭하세요',
    uploadDesc: 'JPG · PNG · PDF — 드래그 앤 드롭 또는 클릭',
    changeFile: '클릭하여 변경',
    textPlaceholder: '일본어 텍스트를 여기에 붙여넣기...',
    analyze: '문서 분석',
    analyzing: '분석 중...',
    copy: '결과 복사',
    copied: '복사됨!',
    signout: '로그아웃',
    freeLimitTitle: '무료 플랜 한도 도달',
    freeLimitDesc: 'Standard로 업그레이드하여 월 30회 분석 ($15/월)',
    upgrade: '지금 업그레이드',
    disclaimer: '이 분석은 참고용입니다. 조치 전에 관련 기관에 확인하세요.',
    resultLabel: '결과',
  },
  vi: {
    langLabel: 'Ngôn ngữ',
    docLabel: 'Tài liệu',
    uploadTab: 'Tải lên file',
    textTab: 'Dán văn bản',
    uploadTitle: 'Thả tài liệu của bạn vào đây',
    uploadDesc: 'JPG · PNG · PDF — kéo thả hoặc nhấp để duyệt',
    changeFile: 'Nhấp để thay đổi file',
    textPlaceholder: 'Dán văn bản tiếng Nhật vào đây...',
    analyze: 'Phân tích tài liệu',
    analyzing: 'Đang phân tích...',
    copy: 'Sao chép kết quả',
    copied: 'Đã sao chép!',
    signout: 'Đăng xuất',
    freeLimitTitle: 'Đã đạt giới hạn gói miễn phí',
    freeLimitDesc: 'Nâng cấp lên Standard để phân tích 30 lần/tháng ($15/tháng)',
    upgrade: 'Nâng cấp ngay',
    disclaimer: 'Phân tích này chỉ để tham khảo. Xác nhận với cơ quan liên quan trước khi hành động.',
    resultLabel: 'Kết quả',
  },
  tl: {
    langLabel: 'Wika',
    docLabel: 'Dokumento',
    uploadTab: 'Mag-upload ng file',
    textTab: 'I-paste ang teksto',
    uploadTitle: 'I-drop ang iyong dokumento dito',
    uploadDesc: 'JPG · PNG · PDF — i-drag at i-drop o i-click para mag-browse',
    changeFile: 'I-click para baguhin',
    textPlaceholder: 'I-paste ang Japanese na teksto dito...',
    analyze: 'Suriin ang dokumento',
    analyzing: 'Sinusuri...',
    copy: 'Kopyahin ang resulta',
    copied: 'Nakopya na!',
    signout: 'Mag-sign out',
    freeLimitTitle: 'Naabot na ang limitasyon ng libreng plano',
    freeLimitDesc: 'Mag-upgrade sa Standard para sa 30 pagsusuri/buwan ($15/buwan)',
    upgrade: 'Mag-upgrade ngayon',
    disclaimer: 'Ang pagsusuring ito ay para sa sanggunian lamang. Kumpirmahin sa kaugnay na tanggapan bago kumilos.',
    resultLabel: 'Resulta',
  },
  ne: {
    langLabel: 'भाषा',
    docLabel: 'कागजात',
    uploadTab: 'फाइल अपलोड',
    textTab: 'टेक्स्ट टाँस्नुहोस्',
    uploadTitle: 'यहाँ आफ्नो कागजात छोड्नुहोस्',
    uploadDesc: 'JPG · PNG · PDF — ड्र्याग गर्नुहोस् वा क्लिक गर्नुहोस्',
    changeFile: 'परिवर्तन गर्न क्लिक गर्नुहोस्',
    textPlaceholder: 'यहाँ जापानी टेक्स्ट टाँस्नुहोस्...',
    analyze: 'कागजात विश्लेषण गर्नुहोस्',
    analyzing: 'विश्लेषण गर्दै...',
    copy: 'नतिजा प्रतिलिपि गर्नुहोस्',
    copied: 'प्रतिलिपि भयो!',
    signout: 'साइन आउट',
    freeLimitTitle: 'निःशुल्क योजनाको सीमा पुग्यो',
    freeLimitDesc: 'महिनामा ३० विश्लेषणको लागि Standard मा अपग्रेड गर्नुहोस् ($15/महिना)',
    upgrade: 'अहिले अपग्रेड गर्नुहोस्',
    disclaimer: 'यो विश्लेषण केवल सन्दर्भको लागि हो। कार्य गर्नु अघि सम्बन्धित कार्यालयसँग पुष्टि गर्नुहोस्।',
    resultLabel: 'नतिजा',
  },
  id: {
    langLabel: 'Bahasa',
    docLabel: 'Dokumen',
    uploadTab: 'Upload file',
    textTab: 'Tempel teks',
    uploadTitle: 'Jatuhkan dokumen Anda di sini',
    uploadDesc: 'JPG · PNG · PDF — seret & jatuhkan atau klik untuk menelusuri',
    changeFile: 'Klik untuk ganti file',
    textPlaceholder: 'Tempel teks Jepang di sini...',
    analyze: 'Analisis dokumen',
    analyzing: 'Menganalisis...',
    copy: 'Salin hasil',
    copied: 'Disalin!',
    signout: 'Keluar',
    freeLimitTitle: 'Batas paket gratis tercapai',
    freeLimitDesc: 'Upgrade ke Standard untuk 30 analisis/bulan ($15/bulan)',
    upgrade: 'Upgrade sekarang',
    disclaimer: 'Analisis ini hanya untuk referensi. Konfirmasi dengan kantor terkait sebelum mengambil tindakan.',
    resultLabel: 'Hasil',
  },
  th: {
    langLabel: 'ภาษา',
    docLabel: 'เอกสาร',
    uploadTab: 'อัปโหลดไฟล์',
    textTab: 'วางข้อความ',
    uploadTitle: 'วางเอกสารของคุณที่นี่',
    uploadDesc: 'JPG · PNG · PDF — ลากและวางหรือคลิกเพื่อเรียกดู',
    changeFile: 'คลิกเพื่อเปลี่ยนไฟล์',
    textPlaceholder: 'วางข้อความภาษาญี่ปุ่นที่นี่...',
    analyze: 'วิเคราะห์เอกสาร',
    analyzing: 'กำลังวิเคราะห์...',
    copy: 'คัดลอกผลลัพธ์',
    copied: 'คัดลอกแล้ว!',
    signout: 'ออกจากระบบ',
    freeLimitTitle: 'ถึงขีดจำกัดแผนฟรีแล้ว',
    freeLimitDesc: 'อัปเกรดเป็น Standard สำหรับ 30 ครั้ง/เดือน ($15/เดือน)',
    upgrade: 'อัปเกรดตอนนี้',
    disclaimer: 'การวิเคราะห์นี้เพื่อการอ้างอิงเท่านั้น ยืนยันกับสำนักงานที่เกี่ยวข้องก่อนดำเนินการ',
    resultLabel: 'ผลลัพธ์',
  },
  my: {
    langLabel: 'ဘာသာစကား',
    docLabel: 'စာရွက်စာတမ်း',
    uploadTab: 'ဖိုင်တင်မည်',
    textTab: 'စာသားကူးထည့်',
    uploadTitle: 'ဤနေရာတွင် ဖိုင်ချပါ',
    uploadDesc: 'JPG · PNG · PDF — ဆွဲချ သို့မဟုတ် နှိပ်၍ ရှာဖွေပါ',
    changeFile: 'ပြောင်းလဲရန် နှိပ်ပါ',
    textPlaceholder: 'ဂျပန်စာသားကို ဤနေရာတွင် ကူးထည့်ပါ...',
    analyze: 'စာရွက်စာတမ်း စစ်ဆေးမည်',
    analyzing: 'စစ်ဆေးနေသည်...',
    copy: 'ရလဒ်ကူးယူ',
    copied: 'ကူးယူပြီး!',
    signout: 'ထွက်မည်',
    freeLimitTitle: 'အခမဲ့အစီအစဉ်ကန့်သတ်ချက်ပြည့်သွားပြီ',
    freeLimitDesc: 'တစ်လလျှင် ၃၀ ကြိမ်စစ်ဆေးရန် Standard သို့ အဆင့်မြှင့်ပါ ($15/လ)',
    upgrade: 'ယခုအဆင့်မြှင့်ပါ',
    disclaimer: 'ဤစစ်ဆေးချက်သည် ကိုးကားရန်သာဖြစ်သည်။ ဆောင်ရွက်မည်ဆိုပါက သက်ဆိုင်ရာရုံးနှင့် အတည်ပြုပါ။',
    resultLabel: 'ရလဒ်',
  },
  fr: {
    langLabel: 'Langue',
    docLabel: 'Document',
    uploadTab: 'Télécharger un fichier',
    textTab: 'Coller du texte',
    uploadTitle: 'Déposez votre document ici',
    uploadDesc: 'JPG · PNG · PDF — glisser-déposer ou cliquer pour parcourir',
    changeFile: 'Cliquer pour changer',
    textPlaceholder: 'Coller le texte japonais ici...',
    analyze: 'Analyser le document',
    analyzing: 'Analyse en cours...',
    copy: 'Copier le résultat',
    copied: 'Copié !',
    signout: 'Se déconnecter',
    freeLimitTitle: 'Limite du forfait gratuit atteinte',
    freeLimitDesc: 'Passez à Standard pour 30 analyses par mois (15$/mois)',
    upgrade: 'Mettre à niveau',
    disclaimer: 'Cette analyse est à titre indicatif uniquement. Confirmez auprès du bureau compétent avant d\'agir.',
    resultLabel: 'Résultat',
  },
}

export default function Home() {
  const [mounted, setMounted] = useState(false) // スマホハング対策
  const [authLoading, setAuthLoading] = useState(true)
  const [plan, setPlan] = useState<string>('free')
  const [language, setLanguage] = useState('en')
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [text, setText] = useState('')
  const [output, setOutput] = useState('')
  const [loading, setLoading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [inputMode, setInputMode] = useState<'upload' | 'text'>('upload')
  const [copied, setCopied] = useState(false)
  const [usageCount, setUsageCount] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const t = UI[language] || UI['en']

  const sectionLabel: React.CSSProperties = {
    fontSize: 11,
    fontWeight: 500,
    color: '#999',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    marginBottom: 10,
  }

  const handleRemoveFile = (e: React.MouseEvent) => {
    e.stopPropagation() 
    setFile(null)
    setPreview(null)
    setOutput('')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  useEffect(() => {
    setMounted(true) // コンポーネントがクライアントで読み込まれたことを示す
    
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) {
        router.push('/landing')
      } else {
        try {
          const { data } = await supabase
            .from('profiles')
            .select('plan, usage_count')
            .eq('id', user.id)
            .single()
          
          if (data) {
            setPlan(data.plan || 'free')
            setUsageCount(data.usage_count || 0)
          }
        } catch (err) {
          console.error("Profile fetch error:", err)
        } finally {
          setAuthLoading(false)
        }
      }
    }).catch(() => {
      setAuthLoading(false)
    })
  }, [router])

  // マウント前はハイドレーションエラーを避けるために何も返さない
  if (!mounted) return null

  const handleFile = (f: File) => {
    if (f.size > 10 * 1024 * 1024) {
      setOutput('File is too large. Please upload a file under 10MB.')
      return
    }
    setFile(f)
    setOutput('')
    setPreview(f.type.startsWith('image/') ? URL.createObjectURL(f) : null)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const f = e.dataTransfer.files[0]
    if (f) handleFile(f)
  }

  const handlePortal = async () => {
    if (isStandard) {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        const res = await fetch('/api/portal', {
          method: 'POST',
          headers: session ? { 'Authorization': `Bearer ${session.access_token}` } : {},
        })
        const data = await res.json()
        if (data.url) window.location.href = data.url
        else alert(data.error || 'Could not open billing portal.')
      } catch {
        alert('Error opening billing portal.')
      }
    } else {
      router.push('/pricing')
    }
  }

  const handleAnalyze = async () => {
    if (!file && !text.trim()) return
    setLoading(true)
    setOutput('')
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const formData = new FormData()
      if (file) formData.append('file', file)
      if (text) formData.append('text', text)
      formData.append('language', language)
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: session ? { 'Authorization': `Bearer ${session.access_token}` } : {},
        body: formData,
      })
      const data = await res.json()
      setOutput(data.error === 'FREE_LIMIT_REACHED' ? '__FREE_LIMIT__' : data.result || data.error)
    } catch {
      setOutput('Error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const isStandard = plan === 'standard'
  const canAnalyze = inputMode === 'upload' ? !!file : !!text.trim()

  if (authLoading) return (
    <main style={{ maxWidth: 680, margin: '0 auto', padding: '1.5rem 1rem' }}>
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div style={{ fontSize: 22, fontWeight: 500, letterSpacing: '-0.5px', color: '#111' }}>
          Sort<span style={{ color: '#e53935' }}>Japan</span>
        </div>
      </nav>
      <div style={{ width: '100%', height: 200, background: '#f7f7f7', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontSize: 13, color: '#bbb' }}>Loading...</div>
      </div>
    </main>
  )

  return (
    <main style={{ maxWidth: 680, margin: '0 auto', padding: '1.5rem 1rem' }}>

      {/* ナビゲーション */}
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div
          onClick={() => router.push('/')}
          style={{ fontSize: 22, fontWeight: 500, letterSpacing: '-0.5px', color: '#111', cursor: 'pointer' }}
        >
          Sort<span style={{ color: '#e53935' }}>Japan</span>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {!isStandard && (
            <button
              type="button"
              onClick={() => router.push('/pricing')}
              style={{
                fontSize: 13, padding: '7px 16px', borderRadius: 20,
                border: 'none', background: '#111', color: '#fff',
                cursor: 'pointer', fontWeight: 500, touchAction: 'manipulation'
              }}
            >
              ✦ Upgrade
            </button>
          )}
          <button
            type="button"
            onClick={handlePortal}
            style={{
              fontSize: 13, padding: '7px 16px', borderRadius: 20,
              border: '1px solid #ddd', background: 'transparent', color: '#666',
              cursor: 'pointer', touchAction: 'manipulation'
            }}
          >
            Account
          </button>
          <button
            type="button"
            onClick={() => supabase.auth.signOut().then(() => router.push('/auth'))}
            style={{
              fontSize: 13, padding: '7px 16px', borderRadius: 20,
              border: '1px solid #ddd', background: 'transparent', color: '#666',
              cursor: 'pointer', touchAction: 'manipulation'
            }}
          >
            {t.signout}
          </button>
        </div>
      </nav>

      {/* ヒーロー */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: 28, fontWeight: 500, lineHeight: 1.3, color: '#111', marginBottom: 10 }}>
          {t.tagline}
        </h1>
        <p style={{ fontSize: 15, color: '#666', lineHeight: 1.6, maxWidth: 520 }}>
          {t.subtitle}
        </p>
      </div>

      {/* 言語選択 */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={sectionLabel}>{t.langLabel}</div>
        <div style={{ background: '#f7f7f7', borderRadius: 14, padding: 10 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
            {LANGUAGES.map(lang => (
              <button
                key={lang.code}
                type="button"
                onClick={() => setLanguage(lang.code)}
                style={{
                  display: 'flex',
                  flexDirection: 'column' as const,
                  alignItems: 'center',
                  gap: 4,
                  padding: '10px 6px',
                  borderRadius: 10,
                  border: language === lang.code ? '1.5px solid #111' : '1px solid transparent',
                  background: language === lang.code ? '#fff' : 'transparent',
                  cursor: 'pointer',
                  transition: 'all 0.12s',
                  touchAction: 'manipulation'
                }}
              >
                <span style={{ fontSize: 20, lineHeight: 1 }}>{lang.flag}</span>
                <span style={{
                  fontSize: 11,
                  color: language === lang.code ? '#111' : '#888',
                  fontWeight: language === lang.code ? 500 : 400,
                  lineHeight: 1.2,
                  textAlign: 'center' as const,
                }}>
                  {lang.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ドキュメント入力 */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={sectionLabel}>{t.docLabel}</div>
        <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
          {(['upload', 'text'] as const).map(mode => (
            <button
              key={mode}
              type="button"
              onClick={() => setInputMode(mode)}
              style={{
                fontSize: 13,
                padding: '6px 16px',
                borderRadius: 20,
                border: 'none',
                background: inputMode === mode ? '#111' : '#eee',
                color: inputMode === mode ? '#fff' : '#666',
                cursor: 'pointer',
                fontWeight: inputMode === mode ? 500 : 400,
                transition: 'all 0.12s',
                touchAction: 'manipulation'
              }}
            >
              {mode === 'upload' ? t.uploadTab : t.textTab}
            </button>
          ))}
        </div>

        {inputMode === 'upload' && (
          <div
            onDrop={handleDrop}
            onDragOver={e => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onClick={() => fileInputRef.current?.click()}
            style={{
              position: 'relative',
              border: `1.5px dashed ${dragOver ? '#111' : file ? '#4caf50' : '#ccc'}`,
              borderRadius: 14,
              padding: '2.5rem 1.5rem',
              textAlign: 'center' as const,
              cursor: 'pointer',
              background: dragOver ? '#fafafa' : file ? '#f0fff4' : '#fafafa',
              transition: 'all 0.15s',
            }}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              style={{ display: 'none' }}
              onChange={e => { if (e.target.files?.[0]) handleFile(e.target.files[0]) }}
            />
            {file && (
              <button
                onClick={handleRemoveFile}
                style={{
                  position: 'absolute', top: 12, right: 12,
                  width: 28, height: 28, borderRadius: '50%',
                  background: 'rgba(0,0,0,0.6)', color: '#fff',
                  border: 'none', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', fontSize: 16, cursor: 'pointer',
                  zIndex: 10
                }}
              >
                ✕
              </button>
            )}
            {preview ? (
              <>
                <img src={preview} alt="preview" style={{ maxHeight: 180, maxWidth: '100%', borderRadius: 8, marginBottom: 8 }} />
                <div style={{ fontSize: 13, color: '#4caf50', fontWeight: 500 }}>{file?.name}</div>
                <div style={{ fontSize: 12, color: '#aaa', marginTop: 4 }}>{t.changeFile}</div>
              </>
            ) : file ? (
              <>
                <div style={{ fontSize: 28, marginBottom: 8 }}>📄</div>
                <div style={{ fontSize: 13, color: '#4caf50', fontWeight: 500 }}>{file.name}</div>
                <div style={{ fontSize: 12, color: '#aaa', marginTop: 4 }}>{t.changeFile}</div>
              </>
            ) : (
              <>
                <div style={{ fontSize: 28, marginBottom: 10 }}>📬</div>
                <div style={{ fontSize: 15, fontWeight: 500, color: '#333', marginBottom: 6 }}>{t.uploadTitle}</div>
                <div style={{ fontSize: 13, color: '#aaa' }}>{t.uploadDesc}</div>
              </>
            )}
          </div>
        )}

        {inputMode === 'text' && (
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder={t.textPlaceholder}
            rows={6}
            style={{
              width: '100%',
              padding: '14px',
              borderRadius: 14,
              border: '1px solid #e0e0e0',
              fontSize: 14,
              resize: 'vertical' as const,
              fontFamily: 'inherit',
              boxSizing: 'border-box' as const,
              background: '#fafafa',
              color: '#111',
              outline: 'none',
            }}
          />
        )}
      </div>

      {/* 解析ボタン */}
      <button
        type="button"
        onClick={handleAnalyze}
        disabled={loading || !canAnalyze}
        style={{
          width: '100%',
          padding: '14px',
          borderRadius: 12,
          background: loading || !canAnalyze ? '#ccc' : '#111',
          color: '#fff',
          border: 'none',
          fontSize: 15,
          fontWeight: 500,
          cursor: loading || !canAnalyze ? 'default' : 'pointer',
          marginBottom: '1.5rem',
          transition: 'background 0.12s',
          touchAction: 'manipulation'
        }}
      >
        {loading ? t.analyzing : t.analyze}
      </button>

      {/* 結果 */}
      {output === '__FREE_LIMIT__' ? (
        <div>
          <div style={{
            background: '#111',
            borderRadius: 14,
            padding: '1.5rem',
            marginBottom: 12,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 500, color: '#fff', marginBottom: 4 }}>
                  {isStandard
                    ? `Monthly limit reached (${usageCount}/30)`
                    : t.freeLimitTitle
                  }
                </div>
                <div style={{ fontSize: 13, color: '#aaa', lineHeight: 1.5, marginBottom: 14 }}>
                  {isStandard
                    ? 'Your 30 analyses for this month are used up. Your limit resets on the 1st of next month.'
                    : t.freeLimitDesc
                  }
                </div>
                {!isStandard && (
                  <button
                    type="button"
                    onClick={() => router.push('/pricing')}
                    style={{
                      padding: '9px 20px', borderRadius: 8,
                      background: '#fff', color: '#111',
                      border: 'none', fontSize: 13, fontWeight: 500, cursor: 'pointer',
                      touchAction: 'manipulation'
                    }}
                  >
                    {t.upgrade} →
                  </button>
                )}
              </div>
              <div style={{ fontSize: 36, flexShrink: 0 }}>
                {isStandard ? '📅' : '🔓'}
              </div>
            </div>
          </div>

          {!isStandard && (
            <div style={{
              background: '#f7f7f7',
              borderRadius: 12,
              padding: '1rem',
              border: '0.5px solid #e8e8e8',
            }}>
              <div style={{ fontSize: 11, fontWeight: 500, color: '#aaa', textTransform: 'uppercase' as const, letterSpacing: '0.06em', marginBottom: 10 }}>
                Standard plan — $15/month
              </div>
              {[
                '30 document analyses per month',
                'All 12 languages supported',
                'Image, PDF & text paste',
                'Cancel anytime',
              ].map(item => (
                <div key={item} style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  fontSize: 13, color: '#444', padding: '4px 0',
                }}>
                  <span style={{ color: '#4caf50', fontWeight: 500 }}>✓</span>
                  {item}
                </div>
              ))}
            </div>
          )}
        </div>
      ) : output ? (
        <div>
          <div style={sectionLabel}>{t.resultLabel}</div>
          <div style={{
            background: '#f7f7f7',
            borderRadius: 14,
            padding: '1.25rem',
            border: '0.5px solid #e8e8e8',
            whiteSpace: 'pre-wrap' as const,
            fontSize: 14,
            lineHeight: 1.8,
            color: '#222',
          }}>
            {output}
          </div>
          <button
            type="button"
            onClick={handleCopy}
            style={{
              marginTop: 10, width: '100%', padding: '10px',
              borderRadius: 10, border: '0.5px solid #ddd',
              background: 'transparent', color: '#666',
              fontSize: 13, cursor: 'pointer', touchAction: 'manipulation'
            }}
          >
            {copied ? t.copied : t.copy}
          </button>
        </div>
      ) : null}

      <p style={{
        fontSize: 11, color: '#bbb',
        textAlign: 'center' as const,
        marginTop: '2rem', lineHeight: 1.5, padding: '0 1rem',
      }}>
        ⚠️ {t.disclaimer}
      </p>

    </main>
  )
}