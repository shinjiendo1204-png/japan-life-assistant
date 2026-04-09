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
    tagline: 'Japanese documents, explained instantly.',
    subtitle: 'Upload any Japanese mail, contract, or notice. Get a clear explanation in your language — in seconds.',
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
    plans: 'Plans',
    signout: 'Sign out',
    freeLimitTitle: 'Free plan limit reached',
    freeLimitDesc: 'Upgrade to Standard for unlimited document analysis ($15/month)',
    upgrade: 'Upgrade now',
    disclaimer: 'This analysis is for reference only. Confirm with the relevant office before taking action.',
    resultLabel: 'Result',
  },
  es: {
    tagline: 'Documentos japoneses, explicados al instante.',
    subtitle: 'Sube cualquier correo, contrato o aviso japonés. Obtén una explicación clara en tu idioma, en segundos.',
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
    plans: 'Planes',
    signout: 'Cerrar sesión',
    freeLimitTitle: 'Límite del plan gratuito alcanzado',
    freeLimitDesc: 'Actualiza a Standard para análisis ilimitado ($15/mes)',
    upgrade: 'Actualizar ahora',
    disclaimer: 'Este análisis es solo de referencia. Confirme con la oficina correspondiente antes de actuar.',
    resultLabel: 'Resultado',
  },
  pt: {
    tagline: 'Documentos japoneses, explicados na hora.',
    subtitle: 'Envie qualquer correio, contrato ou aviso japonês. Obtenha uma explicação clara no seu idioma em segundos.',
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
    plans: 'Planos',
    signout: 'Sair',
    freeLimitTitle: 'Limite do plano gratuito atingido',
    freeLimitDesc: 'Atualize para Standard para análise ilimitada ($15/mês)',
    upgrade: 'Atualizar agora',
    disclaimer: 'Esta análise é apenas para referência. Confirme com o escritório relevante antes de agir.',
    resultLabel: 'Resultado',
  },
  zh: {
    tagline: '日文文件，即时解读。',
    subtitle: '上传任何日文邮件、合同或通知，即可获得您语言的清晰解释——仅需数秒。',
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
    plans: '套餐',
    signout: '退出登录',
    freeLimitTitle: '已达到免费计划限制',
    freeLimitDesc: '升级到Standard享受无限文件分析（每月$15）',
    upgrade: '立即升级',
    disclaimer: '此分析仅供参考。行动前请向相关机构确认。',
    resultLabel: '结果',
  },
  ko: {
    tagline: '일본어 문서, 즉시 설명.',
    subtitle: '어떤 일본어 우편물, 계약서, 공지든 업로드하세요. 몇 초 안에 모국어로 명확한 설명을 받으세요.',
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
    plans: '요금제',
    signout: '로그아웃',
    freeLimitTitle: '무료 플랜 한도 도달',
    freeLimitDesc: 'Standard로 업그레이드하여 무제한 분석 ($15/월)',
    upgrade: '지금 업그레이드',
    disclaimer: '이 분석은 참고용입니다. 조치 전에 관련 기관에 확인하세요.',
    resultLabel: '결과',
  },
  vi: {
    tagline: 'Tài liệu Nhật Bản, giải thích ngay lập tức.',
    subtitle: 'Tải lên bất kỳ thư, hợp đồng hoặc thông báo tiếng Nhật nào. Nhận giải thích rõ ràng bằng ngôn ngữ của bạn trong vài giây.',
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
    plans: 'Gói dịch vụ',
    signout: 'Đăng xuất',
    freeLimitTitle: 'Đã đạt giới hạn gói miễn phí',
    freeLimitDesc: 'Nâng cấp lên Standard để phân tích không giới hạn ($15/tháng)',
    upgrade: 'Nâng cấp ngay',
    disclaimer: 'Phân tích này chỉ để tham khảo. Xác nhận với cơ quan liên quan trước khi hành động.',
    resultLabel: 'Kết quả',
  },
  tl: {
    tagline: 'Mga Japanese na dokumento, agad na naipaliwanag.',
    subtitle: 'Mag-upload ng anumang Japanese na sulat, kontrata, o abiso. Makakuha ng malinaw na paliwanag sa iyong wika sa loob ng ilang segundo.',
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
    plans: 'Mga Plano',
    signout: 'Mag-sign out',
    freeLimitTitle: 'Naabot na ang limitasyon ng libreng plano',
    freeLimitDesc: 'Mag-upgrade sa Standard para sa walang limitasyong pagsusuri ($15/buwan)',
    upgrade: 'Mag-upgrade ngayon',
    disclaimer: 'Ang pagsusuring ito ay para sa sanggunian lamang. Kumpirmahin sa kaugnay na tanggapan bago kumilos.',
    resultLabel: 'Resulta',
  },
  ne: {
    tagline: 'जापानी कागजात, तुरुन्तै व्याख्या।',
    subtitle: 'कुनै पनि जापानी पत्र, सम्झौता वा सूचना अपलोड गर्नुहोस्। केही सेकेन्डमा आफ्नो भाषामा स्पष्ट व्याख्या पाउनुहोस्।',
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
    plans: 'योजनाहरू',
    signout: 'साइन आउट',
    freeLimitTitle: 'निःशुल्क योजनाको सीमा पुग्यो',
    freeLimitDesc: 'असीमित विश्लेषणको लागि Standard मा अपग्रेड गर्नुहोस् ($15/महिना)',
    upgrade: 'अहिले अपग्रेड गर्नुहोस्',
    disclaimer: 'यो विश्लेषण केवल सन्दर्भको लागि हो। कार्य गर्नु अघि सम्बन्धित कार्यालयसँग पुष्टि गर्नुहोस्।',
    resultLabel: 'नतिजा',
  },
  id: {
    tagline: 'Dokumen Jepang, dijelaskan seketika.',
    subtitle: 'Upload surat, kontrak, atau pemberitahuan Jepang apa pun. Dapatkan penjelasan yang jelas dalam bahasa Anda dalam hitungan detik.',
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
    plans: 'Paket',
    signout: 'Keluar',
    freeLimitTitle: 'Batas paket gratis tercapai',
    freeLimitDesc: 'Upgrade ke Standard untuk analisis tanpa batas ($15/bulan)',
    upgrade: 'Upgrade sekarang',
    disclaimer: 'Analisis ini hanya untuk referensi. Konfirmasi dengan kantor terkait sebelum mengambil tindakan.',
    resultLabel: 'Hasil',
  },
  th: {
    tagline: 'เอกสารภาษาญี่ปุ่น อธิบายได้ทันที',
    subtitle: 'อัปโหลดจดหมาย สัญญา หรือประกาศภาษาญี่ปุ่น รับคำอธิบายที่ชัดเจนในภาษาของคุณภายในไม่กี่วินาที',
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
    plans: 'แผนบริการ',
    signout: 'ออกจากระบบ',
    freeLimitTitle: 'ถึงขีดจำกัดแผนฟรีแล้ว',
    freeLimitDesc: 'อัปเกรดเป็น Standard สำหรับการวิเคราะห์ไม่จำกัด ($15/เดือน)',
    upgrade: 'อัปเกรดตอนนี้',
    disclaimer: 'การวิเคราะห์นี้เพื่อการอ้างอิงเท่านั้น ยืนยันกับสำนักงานที่เกี่ยวข้องก่อนดำเนินการ',
    resultLabel: 'ผลลัพธ์',
  },
  my: {
    tagline: 'ဂျပန်စာရွက်စာတမ်း၊ ချက်ချင်းရှင်းပြ။',
    subtitle: 'ဂျပန်စာပေးစာ၊ စာချုပ် သို့မဟုတ် ကြေညာချက်မဆို အပ်လုဒ်လုပ်ပါ။ မိမိဘာသာစကားဖြင့် ရှင်းလင်းသောရှင်းပြချက်ကို ဆောင်ရွက်ချက်များနှင့်တကွ ရယူပါ',
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
    plans: 'အစီအစဉ်',
    signout: 'ထွက်မည်',
    freeLimitTitle: 'အခမဲ့အစီအစဉ်ကန့်သတ်ချက်ပြည့်သွားပြီ',
    freeLimitDesc: 'အကန့်အသတ်မဲ့ စစ်ဆေးမှုအတွက် Standard သို့ အဆင့်မြှင့်ပါ ($15/လ)',
    upgrade: 'ယခုအဆင့်မြှင့်ပါ',
    disclaimer: 'ဤစစ်ဆေးချက်သည် ကိုးကားရန်သာဖြစ်သည်။ ဆောင်ရွက်မည်ဆိုပါက သက်ဆိုင်ရာရုံးနှင့် အတည်ပြုပါ။',
    resultLabel: 'ရလဒ်',
  },
  fr: {
    tagline: 'Documents japonais, expliqués instantanément.',
    subtitle: 'Téléchargez n\'importe quel courrier, contrat ou avis japonais. Obtenez une explication claire dans votre langue en quelques secondes.',
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
    plans: 'Forfaits',
    signout: 'Se déconnecter',
    freeLimitTitle: 'Limite du forfait gratuit atteinte',
    freeLimitDesc: 'Passez à Standard pour une analyse illimitée (15$/mois)',
    upgrade: 'Mettre à niveau',
    disclaimer: 'Cette analyse est à titre indicatif uniquement. Confirmez auprès du bureau compétent avant d\'agir.',
    resultLabel: 'Résultat',
  },
}

export default function Home() {
  const [authLoading, setAuthLoading] = useState(true)
  const [language, setLanguage] = useState('en')
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [text, setText] = useState('')
  const [output, setOutput] = useState('')
  const [loading, setLoading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [inputMode, setInputMode] = useState<'upload' | 'text'>('upload')
  const [copied, setCopied] = useState(false)
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

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) router.push('/auth')
      else setAuthLoading(false)
    })
  }, [])

  const handleFile = (f: File) => {
  // 10MB制限
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

  if (authLoading) return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: '2rem 1rem' }}>
      <p style={{ color: '#888', fontSize: 14 }}>Loading...</p>
    </div>
  )

  const canAnalyze = inputMode === 'upload' ? !!file : !!text.trim()

  return (
    <main style={{ maxWidth: 680, margin: '0 auto', padding: '1.5rem 1rem' }}>

      {/* ナビゲーション */}
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div style={{ fontSize: 22, fontWeight: 500, letterSpacing: '-0.5px', color: '#111' }}>
          Sort<span style={{ color: '#e53935' }}>Japan</span>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button
            onClick={() => router.push('/pricing')}
            style={{ fontSize: 12, padding: '5px 12px', borderRadius: 20, border: '0.5px solid #ddd', background: 'transparent', color: '#666', cursor: 'pointer' }}
          >
            {t.plans}
          </button>
          <button
            onClick={() => supabase.auth.signOut().then(() => router.push('/auth'))}
            style={{ fontSize: 12, padding: '5px 12px', borderRadius: 20, border: '0.5px solid #ddd', background: 'transparent', color: '#666', cursor: 'pointer' }}
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
              accept="image/*,.pdf"
              style={{ display: 'none' }}
              onChange={e => { if (e.target.files?.[0]) handleFile(e.target.files[0]) }}
            />
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
        }}
      >
        {loading ? t.analyzing : t.analyze}
      </button>

      {/* 結果 */}
      {output === '__FREE_LIMIT__' ? (
        <div style={{
          background: '#fffbeb',
          border: '1px solid #fcd34d',
          borderRadius: 14,
          padding: '1.5rem',
          textAlign: 'center' as const,
        }}>
          <div style={{ fontSize: 28, marginBottom: 10 }}>⚠️</div>
          <div style={{ fontSize: 15, fontWeight: 500, color: '#111', marginBottom: 6 }}>{t.freeLimitTitle}</div>
          <div style={{ fontSize: 13, color: '#666', marginBottom: 16 }}>{t.freeLimitDesc}</div>
          <button
            onClick={() => router.push('/pricing')}
            style={{
              padding: '10px 24px', borderRadius: 10,
              background: '#111', color: '#fff',
              border: 'none', fontSize: 14, fontWeight: 500, cursor: 'pointer',
            }}
          >
            {t.upgrade}
          </button>
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
            onClick={handleCopy}
            style={{
              marginTop: 10, width: '100%', padding: '10px',
              borderRadius: 10, border: '0.5px solid #ddd',
              background: 'transparent', color: '#666',
              fontSize: 13, cursor: 'pointer',
            }}
          >
            {copied ? t.copied : t.copy}
          </button>
        </div>
      ) : null}

      {/* 免責 */}
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
