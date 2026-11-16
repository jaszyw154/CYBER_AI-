import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, EyeOff, Lock, Mail, ShieldCheck, ArrowRight, AlertCircle, CheckCircle, Loader2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

type AuthStage = 'form' | 'verifying' | 'success'

export function LoginPage() {
  const navigate = useNavigate()
  const { login, loading, token } = useAuthStore()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [remember, setRemember] = useState(false)
  const [error, setError] = useState('')
  const [stage, setStage] = useState<AuthStage>('form')

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const loginContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (token) {
      navigate('/', { replace: true })
    }
  }, [token, navigate])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    let animId: number
    let angle = 0
    const resize = () => {
      canvas.width = canvas.clientWidth
      canvas.height = canvas.clientHeight
    }
    resize()
    window.addEventListener('resize', resize)
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      const cx = canvas.width / 2
      const cy = canvas.height / 2
      const maxR = Math.min(canvas.width, canvas.height) * 0.4
      for (let r = maxR * 0.25; r <= maxR; r += maxR * 0.25) {
        ctx.beginPath()
        ctx.arc(cx, cy, r, 0, Math.PI * 2)
        ctx.strokeStyle = `rgba(34,211,238,${0.06 * (1 - r / maxR)})`
        ctx.lineWidth = 0.5
        ctx.stroke()
      }
      ctx.save()
      ctx.translate(cx, cy)
      ctx.rotate(angle)
      const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, maxR)
      grad.addColorStop(0, 'rgba(34,211,238,0.03)')
      grad.addColorStop(1, 'rgba(34,211,238,0)')
      ctx.fillStyle = grad
      ctx.beginPath()
      ctx.moveTo(0, 0)
      ctx.arc(0, 0, maxR, -0.3, 0.3)
      ctx.closePath()
      ctx.fill()
      ctx.beginPath()
      ctx.moveTo(0, 0)
      ctx.lineTo(maxR, 0)
      ctx.strokeStyle = 'rgba(34,211,238,0.08)'
      ctx.lineWidth = 1
      ctx.stroke()
      ctx.restore()
      angle += 0.004
      animId = requestAnimationFrame(draw)
    }
    draw()
    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  useEffect(() => {
    if (!loginContainerRef.current) return
    const handleMouseMove = (e: MouseEvent) => {
      const el = loginContainerRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const x = (e.clientX - rect.left) / rect.width
      const y = (e.clientY - rect.top) / rect.height
      el.style.setProperty('--mouse-x', String(x))
      el.style.setProperty('--mouse-y', String(y))
    }
    const el = loginContainerRef.current
    el.addEventListener('mousemove', handleMouseMove)
    return () => el.removeEventListener('mousemove', handleMouseMove)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!email.trim()) { setError('Email address is required'); return }
    if (!password.trim()) { setError('Password is required'); return }

    setStage('verifying')
    try {
      await login(email.trim(), password)
      setStage('success')
      setTimeout(() => {
        navigate('/', { replace: true })
      }, 2200)
    } catch (err: any) {
      setError(err.message || 'Authentication failed')
      setStage('form')
    }
  }

  const isProcessing = stage === 'verifying' || stage === 'success'

  return (
    <div className="relative flex min-h-screen bg-[#020617] text-slate-100 overflow-hidden">
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(34,211,238,0.08),transparent_50%),radial-gradient(circle_at_70%_80%,rgba(139,92,246,0.06),transparent_50%),linear-gradient(180deg,#020617,#0f172a,#020617)]" />
      <div className="fixed inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(rgba(34,211,238,0.5) 1px,transparent 1px),linear-gradient(90deg,rgba(34,211,238,0.5) 1px,transparent 1px)', backgroundSize: '60px 60px' }} />

      <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center overflow-hidden">
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
        <div className="relative z-10 text-center px-8">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1, ease: 'easeOut' }}>
            <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-cyan-500 via-indigo-500 to-fuchsia-500 shadow-2xl shadow-cyan-500/30">
              <ShieldCheck className="h-12 w-12 text-white" />
            </div>
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }} className="text-5xl font-extrabold tracking-tight text-white">
            CYBER <span className="bg-gradient-to-r from-cyan-400 via-indigo-400 to-fuchsia-400 bg-clip-text text-transparent">AI</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.35 }} className="mt-3 text-lg text-slate-400 font-medium tracking-wide">
            SECURE INTELLIGENCE NETWORK
          </motion.p>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6, duration: 0.8 }} className="mt-12 space-y-4 text-left max-w-xs mx-auto">
            {[
              ['SYSTEM STATUS', 'ONLINE', 'rgba(34,211,238,0.15)', 'text-cyan-400'],
              ['THREAT ENGINE', 'ACTIVE', 'rgba(34,211,238,0.15)', 'text-cyan-400'],
              ['INTELLIGENCE FEED', 'CONNECTED', 'rgba(34,211,238,0.15)', 'text-cyan-400'],
              ['SECURE GATEWAY', 'READY', 'rgba(34,211,238,0.15)', 'text-emerald-400'],
            ].map(([label, value, bg, color], i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 + i * 0.12, duration: 0.5 }}
                className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.03] px-4 py-2.5 backdrop-blur-sm"
              >
                <span className="text-xs tracking-wider text-slate-500">{label}</span>
                <span className={`text-xs font-semibold ${color}`}>{value}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      <div className="flex w-full items-center justify-center lg:w-1/2 relative px-6 py-12">
        <div
          ref={loginContainerRef}
          className="relative w-full max-w-md"
          style={{
            '--mouse-x': '0.5',
            '--mouse-y': '0.5',
          } as React.CSSProperties}
        >
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="relative rounded-[32px] border border-white/[0.08] bg-slate-950/80 p-8 shadow-2xl shadow-cyan-950/30 backdrop-blur-xl"
            style={{
              background: 'radial-gradient(600px circle at calc(var(--mouse-x, 0.5) * 100%) calc(var(--mouse-y, 0.5) * 100%), rgba(34,211,238,0.04), transparent 40%)',
            }}
          >
            <div className="mb-8">
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="mb-2 text-[10px] uppercase tracking-[0.3em] text-cyan-500/70">
                AUTHORIZED ACCESS ONLY
              </motion.p>
              <motion.h2 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-3xl font-bold text-white">
                WELCOME BACK
              </motion.h2>
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="mt-2 text-sm text-slate-400">
                Enter your credentials to access the CYBER AI intelligence platform.
              </motion.p>
            </div>

            <AnimatePresence mode="wait">
              {stage === 'success' ? (
                <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="py-12 text-center">
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200, damping: 15 }}>
                    <CheckCircle className="mx-auto h-16 w-16 text-emerald-400" />
                  </motion.div>
                  <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mt-4 text-xl font-bold text-white">
                    IDENTITY VERIFIED
                  </motion.p>
                  <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="mt-1 text-emerald-400 font-medium">
                    ACCESS GRANTED
                  </motion.p>
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} className="mt-6 text-sm text-slate-500">
                    <Loader2 className="inline h-4 w-4 animate-spin mr-2" />
                    INITIALIZING CYBER AI...
                  </motion.p>
                </motion.div>
              ) : (
                <motion.form key="form" onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-slate-400">EMAIL ADDRESS</label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="analyst@cyberai.io"
                        disabled={isProcessing}
                        className="w-full rounded-2xl border border-white/10 bg-slate-900/80 py-3.5 pl-11 pr-4 text-sm text-white placeholder-slate-600 outline-none transition focus:border-cyan-500/50 focus:bg-slate-900 focus:shadow-[0_0_20px_rgba(34,211,238,0.06)] disabled:opacity-50"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-slate-400">PASSWORD</label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        disabled={isProcessing}
                        className="w-full rounded-2xl border border-white/10 bg-slate-900/80 py-3.5 pl-11 pr-11 text-sm text-white placeholder-slate-600 outline-none transition focus:border-cyan-500/50 focus:bg-slate-900 focus:shadow-[0_0_20px_rgba(34,211,238,0.06)] disabled:opacity-50"
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={remember}
                        onChange={(e) => setRemember(e.target.checked)}
                        className="h-4 w-4 rounded border-white/20 bg-slate-800 text-cyan-500 accent-cyan-500"
                      />
                      <span className="text-slate-400">Remember Me</span>
                    </label>
                    <button type="button" className="text-cyan-400/70 hover:text-cyan-300 transition-colors">
                      Forgot Password
                    </button>
                  </div>

                  <AnimatePresence>
                    {error && (
                      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="flex items-center gap-2 rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                        <AlertCircle className="h-4 w-4 shrink-0" />
                        <span>{error}</span>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <button
                    type="submit"
                    disabled={isProcessing}
                    className="group relative w-full overflow-hidden rounded-2xl bg-gradient-to-r from-cyan-500 to-indigo-500 px-6 py-3.5 text-sm font-bold text-white shadow-xl shadow-cyan-500/20 transition-all hover:shadow-cyan-500/40 disabled:opacity-70"
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      {isProcessing ? (
                        <><Loader2 className="h-4 w-4 animate-spin" /> AUTHENTICATING...</>
                      ) : (
                        <><span>AUTHENTICATE</span> <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></>
                      )}
                    </span>
                    <div className="absolute inset-0 -translate-x-full rounded-2xl bg-gradient-to-r from-cyan-400 to-indigo-400 transition-transform duration-500 group-hover:translate-x-0" />
                  </button>

                  <p className="text-center text-xs text-slate-600">
                    By continuing, you acknowledge the CYBER AI{' '}
                    <button type="button" className="text-cyan-500/70 hover:text-cyan-400">Security Policy</button>.
                  </p>
                </motion.form>
              )}
            </AnimatePresence>
          </motion.div>

          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }} className="mt-6 text-center text-xs text-slate-600">
            <button onClick={() => navigate('/')} className="hover:text-slate-400 transition-colors">← Return to Home</button>
          </motion.p>
        </div>
      </div>
    </div>
  )
}
