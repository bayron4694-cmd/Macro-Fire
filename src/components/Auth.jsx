import { useState } from 'react'
import { signIn, signUp } from '../lib/supabase'

const T = {
  bg:"#FAFAF8", surface:"#FFFFFF", border:"#EBEBE6",
  text:"#0D0D0D", sub:"#6B6B6B", muted:"#B0B0A8",
  prot:"#2E6B4F", protBg:"#EEF5F1",
  err:"#9B2C2C", errBg:"#FDF0F0",
}

export default function Auth() {
  const [mode, setMode]         = useState('login') // 'login' | 'register'
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [name, setName]         = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState(null)
  const [success, setSuccess]   = useState(null)

  const inp = {
    background: T.bg, border: `1.5px solid ${T.border}`, borderRadius: 10,
    color: T.text, padding: '12px 14px', fontSize: 14,
    outline: 'none', width: '100%', transition: 'border-color 0.15s',
  }

  const handleSubmit = async () => {
    if (!email || !password) { setError('Completa email y contraseña'); return }
    setLoading(true); setError(null); setSuccess(null)
    try {
      if (mode === 'register') {
        const { error: e } = await signUp(email, password)
        if (e) throw e
        setSuccess('¡Cuenta creada! Revisa tu email para confirmar.')
      } else {
        const { error: e } = await signIn(email, password)
        if (e) throw e
      }
    } catch (e) {
      setError(e.message === 'Invalid login credentials'
        ? 'Email o contraseña incorrectos'
        : e.message)
    }
    setLoading(false)
  }

  return (
    <div style={{ minHeight: '100vh', background: T.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ width: '100%', maxWidth: 400 }}>

        {/* Brand */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, background: T.text, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, margin: '0 auto 14px' }}>⚡</div>
          <div style={{ fontSize: 22, fontFamily: "'Syne', sans-serif", fontWeight: 800, letterSpacing: '0.02em', color: T.text }}>MACRO FIRE</div>
          <div style={{ fontSize: 11, color: T.muted, letterSpacing: '0.16em', marginTop: 4 }}>TRACK · CALCULATE · ANALYZE</div>
        </div>

        {/* Card */}
        <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 20, padding: 28, boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: T.text, marginBottom: 20 }}>
            {mode === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
          </div>

          {mode === 'register' && (
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: T.sub, marginBottom: 5 }}>Nombre</div>
              <input value={name} onChange={e => setName(e.target.value)} placeholder="Tu nombre" style={inp}/>
            </div>
          )}

          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: T.sub, marginBottom: 5 }}>Email</div>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="tu@email.com" style={inp} onKeyDown={e => e.key === 'Enter' && handleSubmit()}/>
          </div>

          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: T.sub, marginBottom: 5 }}>Contraseña</div>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Mínimo 6 caracteres" style={inp} onKeyDown={e => e.key === 'Enter' && handleSubmit()}/>
          </div>

          {error && (
            <div style={{ background: T.errBg, border: `1px solid ${T.err}22`, borderRadius: 10, padding: '10px 14px', color: T.err, fontSize: 13, fontWeight: 600, marginBottom: 14 }}>
              {error}
            </div>
          )}

          {success && (
            <div style={{ background: T.protBg, border: `1px solid ${T.prot}33`, borderRadius: 10, padding: '10px 14px', color: T.prot, fontSize: 13, fontWeight: 600, marginBottom: 14 }}>
              {success}
            </div>
          )}

          <button onClick={handleSubmit} disabled={loading} style={{ background: T.text, border: 'none', borderRadius: 12, color: '#fff', fontWeight: 700, padding: '14px 20px', cursor: loading ? 'not-allowed' : 'pointer', fontSize: 14, width: '100%', opacity: loading ? 0.6 : 1, transition: 'opacity 0.15s' }}>
            {loading ? 'Cargando…' : mode === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
          </button>

          <div style={{ textAlign: 'center', marginTop: 16, fontSize: 13, color: T.muted }}>
            {mode === 'login' ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}{' '}
            <button onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(null); setSuccess(null) }} style={{ background: 'none', border: 'none', color: T.prot, fontWeight: 700, cursor: 'pointer', fontSize: 13, fontFamily: 'inherit' }}>
              {mode === 'login' ? 'Regístrate' : 'Inicia sesión'}
            </button>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: 20, fontSize: 11, color: T.muted }}>
          Tu información está protegida con encriptación
        </div>
      </div>
    </div>
  )
}
