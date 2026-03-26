import type React from "react"
import { useState } from "react"
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Eye, EyeOff, Apple, ArrowRight, Check, X, ShieldCheck } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"
import { api } from "@/services/api"
import { toast } from "sonner"
import fynxLogo from "@/assets/FYNX CABRA SF.png"

export default function LoginPage() {
  const [isLoginTab, setIsLoginTab] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const navigate = useNavigate()

  // --- Awwwards Authentication Overlay Setup ---
  const [authSuccess, setAuthSuccess] = useState(false)
  const [loggedInName, setLoggedInName] = useState("")

  // --- Awwwards Mouse Parallax Orbs Setup ---
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  const smoothX1 = useSpring(mouseX, { damping: 40, stiffness: 60 })
  const smoothY1 = useSpring(mouseY, { damping: 40, stiffness: 60 })

  const smoothX2 = useSpring(mouseX, { damping: 20, stiffness: 30 })
  const smoothY2 = useSpring(mouseY, { damping: 20, stiffness: 30 })

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    mouseX.set(e.clientX - rect.left)
    mouseY.set(e.clientY - rect.top)
  }
  // ------------------------------------------

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [registerEmail, setRegisterEmail] = useState("")
  const [registerPassword, setRegisterPassword] = useState("")

  const [passwordCriteria, setPasswordCriteria] = useState({
    minLength: false,
    hasUpperCase: false,
    hasNumber: false,
    hasSpecialChar: false
  })

  const validatePassword = (pass: string) => {
    setPasswordCriteria({
      minLength: pass.length >= 8,
      hasUpperCase: /[A-Z]/.test(pass),
      hasNumber: /[0-9]/.test(pass),
      hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(pass)
    })
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPass = e.target.value
    setRegisterPassword(newPass)
    validatePassword(newPass)
  }

  const { login } = useAuth()

  const handleSocialLogin = (provider: string) => {
    setIsLoading(true)
    setTimeout(() => {
      setLoggedInName("Hóspede")
      setIsLoading(false)
      setAuthSuccess(true)
      setTimeout(() => navigate("/dashboard"), 2000)
    }, 1500)
  }

  const handleLogin = async () => {
    try {
      setIsLoading(true)
      const response = await api.post('/auth/login', { email, password })
      login(response.data.token, response.data.user)
      setIsLoading(false)
      setLoggedInName(response.data.user.name.split(' ')[0])
      setAuthSuccess(true)
      setTimeout(() => navigate("/dashboard"), 2000)
    } catch (error: any) {
      toast.error("Erro ao fazer login", {
        description: error.response?.data?.error || 'Credenciais inválidas. Verifique seu email e senha.'
      })
      setIsLoading(false)
    }
  }

  const handleRegister = async () => {
    const isValidPassword = Object.values(passwordCriteria).every(Boolean)
    if (!isValidPassword) {
      toast.error("Senha inválida", {
        description: "A senha deve atender a todos os requisitos."
      })
      return
    }

    try {
      setIsLoading(true)
      const response = await api.post('/auth/register', {
        name,
        email: registerEmail,
        password: registerPassword
      })
      login(response.data.token, response.data.user)
      setIsLoading(false)
      setLoggedInName(response.data.user.name.split(' ')[0])
      setAuthSuccess(true)
      setTimeout(() => navigate("/dashboard"), 2000)
    } catch (error: any) {
      toast.error("Erro ao criar conta", {
        description: error.response?.data?.error || 'Não foi possível completar o registro.'
      })
      setIsLoading(false)
    }
  }

  const formItemVariants: any = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "circOut" } }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-3 bg-[#0e0e13]" style={{ fontFamily: '"Manrope", sans-serif' }}>
      
      {/* Left Side - The Sovereign Vault (Awwwards Style, 2/3 width) */}
      <div 
        className="hidden lg:flex lg:col-span-2 flex-col relative overflow-hidden bg-[#0A0A0E] p-12 items-center justify-center cursor-default group"
        onMouseMove={handleMouseMove}
      >
        {/* Subtle Luxury Noise Overlay */}
        <div className="absolute inset-0 opacity-[0.03] z-[1] pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }} />

        {/* Deep Mouse-Tracking Ambient Orbs */}
        <motion.div 
          style={{ x: useTransform(smoothX1, (v) => v - 450), y: useTransform(smoothY1, (v) => v - 450) }} 
          className="absolute top-0 left-0 pointer-events-none z-0 opacity-40 group-hover:opacity-60 transition-opacity duration-1000"
        >
          <motion.div animate={{ scale: [1, 1.1, 0.9, 1] }} transition={{ duration: 20, repeat: Number.POSITIVE_INFINITY }} className="w-[900px] h-[900px] bg-[#9D4EDD] rounded-full blur-[180px] mix-blend-screen" />
        </motion.div>
        
        <motion.div 
          style={{ x: useTransform(smoothX2, (v) => v - 350), y: useTransform(smoothY2, (v) => v - 350) }} 
          className="absolute top-0 left-0 pointer-events-none z-0 opacity-20 group-hover:opacity-40 transition-opacity duration-1000 delay-100"
        >
          <motion.div animate={{ scale: [1, 0.8, 1.2, 1] }} transition={{ duration: 25, repeat: Number.POSITIVE_INFINITY }} className="w-[700px] h-[700px] bg-[#C4FF0E] rounded-full blur-[140px] mix-blend-screen" />
        </motion.div>

        {/* Awwwards: Negative Filter Watermark Blur Reveal - UPDATED TO TOP LEFT */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, filter: 'blur(30px)', x: -40, y: -20 }}
          animate={{ opacity: 0.08, scale: 1, filter: 'blur(0px)', x: 0, y: 0 }}
          transition={{ duration: 4, ease: "circOut" }}
          className="absolute top-8 left-8 text-[220px] font-black text-white mix-blend-difference select-none tracking-tighter leading-none z-0 pointer-events-none" 
          style={{ fontFamily: '"Space Grotesk", sans-serif' }}
        >
          Fynx
        </motion.div>

        {/* Center Content Container */}
        <div className="flex-1 flex flex-col items-center justify-center relative z-10 w-full max-w-2xl mx-auto mt-2">
          
          {/* Majestic Goat Logo Reveal & Float */}
          <motion.div
            initial={{ opacity: 0, y: 60, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 1.5, ease: "circOut" }}
            className="mb-8"
          >
            <motion.img
              animate={{ y: [-15, 15, -15] }}
              transition={{ duration: 8, ease: "easeInOut", repeat: Number.POSITIVE_INFINITY }}
              src={fynxLogo}
              alt="The GOAT Standard Logo"
              className="w-[420px] h-[420px] object-contain drop-shadow-[0_40px_80px_rgba(157,78,221,0.4)] mx-auto relative z-20"
            />
          </motion.div>

          {/* Typography - CENTER ALIGNED, Dramatic Scale */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.3, ease: "circOut" }}
            className="w-full relative text-center flex flex-col items-center pt-2"
          >
            <h1 
              className="text-[64px] leading-[1.05] font-extrabold text-[#f8f5fd] tracking-tight" 
              style={{ fontFamily: '"Space Grotesk", sans-serif' }}
            >
              dinheiro no <br />
              modo{' '}
              <motion.span 
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: { opacity: 0 },
                  visible: { opacity: 1, transition: { staggerChildren: 0.18, delayChildren: 0.8 } }
                }}
                className="text-[#C4FF0E] italic inline-flex overflow-hidden pb-1 drop-shadow-[0_0_24px_rgba(196,255,14,0.4)]"
              >
                {Array.from("G.O.A.T").map((char, index) => (
                  <motion.span 
                    key={index} 
                    variants={{
                      hidden: { opacity: 0, scale: 0.5, y: 40, filter: 'blur(10px)' },
                      visible: { opacity: 1, scale: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.8, ease: "circOut" } }
                    }}
                  >
                    {char}
                  </motion.span>
                ))}
              </motion.span>
            </h1>
            <p className="text-[#f8f5fd]/70 text-[18px] font-medium max-w-sm pt-6 leading-relaxed" style={{ fontFamily: '"Manrope", sans-serif' }}>
              Performance institucional. Soberania financeira definitiva no cofre de elite.
            </p>
          </motion.div>

          {/* Center Divider / Spacing */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.8 }}
            transition={{ duration: 2, delay: 1 }}
            className="mt-14 flex items-center justify-center w-full"
          >
            <span 
              className="text-[12px] tracking-[0.4em] font-bold text-[#f8f5fd]/40 uppercase" 
              style={{ fontFamily: '"Manrope", sans-serif' }}
            >
              The New Standard
            </span>
          </motion.div>
        </div>

        {/* Footer Elements */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1.2, ease: "circOut" }}
          className="relative z-20 w-full flex flex-col items-center justify-center mt-auto pt-10 pb-4 gap-6"
        >
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-3 bg-[#0A0A0E]/40 backdrop-blur-2xl rounded-full px-5 py-3 shadow-[0_0_40px_rgba(196,255,14,0.08)] border border-[#C4FF0E]/15 cursor-pointer"
          >
            <div className="bg-[#C4FF0E] rounded-full p-1.5 flex items-center justify-center shadow-[0_0_16px_rgba(196,255,14,0.5)]">
              <Check className="w-3.5 h-3.5 text-[#0A0A0E] stroke-[4]" />
            </div>
            <span className="text-[11px] uppercase font-bold tracking-[0.08em] text-[#f8f5fd]">Protocolo de segurança ativo</span>
          </motion.div>
          <p className="text-[10px] tracking-[0.08em] text-[#f8f5fd]/30 uppercase font-black text-center">
            © 2024 FYNX VAULT.  PREMIUM ASSET MANAGEMENT.
          </p>
        </motion.div>
      </div>

      {/* Right Side - Functional Vault (1/3 width) */}
      <div className="flex flex-col items-center justify-center p-6 lg:p-12 lg:col-span-1 relative z-10 bg-[#0e0e13]">
        <motion.div 
          className="w-full max-w-[420px]"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.4 } }
          }}
        >
          
          {/* Tab Toggle using Background Shifts */}
          <motion.div variants={formItemVariants} className="flex bg-[#000000] rounded-lg p-1.5 mb-14 w-max mx-auto shadow-[0_0_24px_rgba(248,245,253,0.03)] border-none">
            <button
              onClick={() => setIsLoginTab(true)}
              className={`px-8 py-2.5 rounded-md text-[13px] font-bold tracking-wide transition-all duration-300 ${
                isLoginTab ? "bg-[#25252c] text-[#f8f5fd] shadow-[0_4px_12px_rgba(0,0,0,0.5)]" : "text-[#f8f5fd]/50 hover:text-[#f8f5fd]"
              }`}
            >
              Entrar
            </button>
            <button
              onClick={() => setIsLoginTab(false)}
              className={`px-8 py-2.5 rounded-md text-[13px] font-bold tracking-wide transition-all duration-300 ${
                !isLoginTab ? "bg-[#25252c] text-[#f8f5fd] shadow-[0_4px_12px_rgba(0,0,0,0.5)]" : "text-[#f8f5fd]/50 hover:text-[#f8f5fd]"
              }`}
            >
              Cadastrar
            </button>
          </motion.div>

          <motion.div variants={formItemVariants} className="mb-10 text-center">
            <h2 className="text-[32px] font-bold text-[#f8f5fd] tracking-[-0.02em] mb-3" style={{ fontFamily: '"Space Grotesk", sans-serif' }}>
              Bem-vindo ao Vault
            </h2>
            <p className="text-[#f8f5fd]/60 text-[14px]">
              Insira suas credenciais para gerenciar seus ativos.
            </p>
          </motion.div>

          {/* Social Logins */}
          <motion.div variants={formItemVariants} className="grid grid-cols-2 gap-4 mb-10">
            <motion.div whileHover={{ y: -2, scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                variant="ghost"
                disabled={isLoading}
                onClick={() => handleSocialLogin("google")}
                className="w-full bg-[#25252c] border-transparent hover:bg-[#25252c]/80 text-[#f8f5fd] h-[52px] transition-colors rounded-lg font-bold tracking-wide shadow-[0_0_24px_rgba(248,245,253,0.02)]"
              >
                <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Google
              </Button>
            </motion.div>
            <motion.div whileHover={{ y: -2, scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                variant="ghost"
                disabled={isLoading}
                onClick={() => handleSocialLogin("apple")}
                className="w-full bg-[#25252c] border-transparent hover:bg-[#25252c]/80 text-[#f8f5fd] h-[52px] transition-colors rounded-lg font-bold tracking-wide shadow-[0_0_24px_rgba(248,245,253,0.02)]"
              >
                <Apple className="w-5 h-5 mr-2" />
                Apple
              </Button>
            </motion.div>
          </motion.div>

          <motion.div variants={formItemVariants} className="flex items-center justify-center mb-10 opacity-70">
            <span className="text-[11px] tracking-[0.2em] text-[#f8f5fd]/50 uppercase font-bold">OU</span>
          </motion.div>

          <AnimatePresence mode="wait">
            {isLoginTab ? (
              <motion.form
                key="login"
                onSubmit={(e) => { e.preventDefault(); handleLogin(); }}
                initial={{ opacity: 0, filter: 'blur(8px)', y: 15 }}
                animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
                exit={{ opacity: 0, filter: 'blur(8px)', y: -15 }}
                transition={{ duration: 0.3, ease: "circOut" }}
                className="space-y-6"
              >
                <div className="space-y-2">
                  <label className="text-[11px] font-bold tracking-[0.05em] text-[#f8f5fd]/70 uppercase ml-1">Email</label>
                  <motion.div whileFocus={{ scale: 1.01 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }}>
                    <Input
                      type="email"
                      placeholder="nome@exemplo.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-[#25252c] border-transparent focus-visible:ring-1 focus-visible:ring-[#9D4EDD]/40 text-[#f8f5fd] placeholder:text-[#f8f5fd]/30 h-14 rounded-lg pl-4 text-base shadow-[0_0_20px_rgba(248,245,253,0.02)] transition-shadow"
                    />
                  </motion.div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-[11px] font-bold tracking-[0.05em] text-[#f8f5fd]/70 uppercase ml-1">Senha</label>
                  <motion.div className="relative" whileFocus={{ scale: 1.01 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }}>
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="bg-[#25252c] border-transparent focus-visible:ring-1 focus-visible:ring-[#9D4EDD]/40 text-[#f8f5fd] placeholder:text-[#f8f5fd]/30 h-14 rounded-lg pl-4 pr-12 text-base shadow-[0_0_20px_rgba(248,245,253,0.02)] transition-shadow"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[#f8f5fd]/40 hover:text-[#f8f5fd] transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </motion.div>
                </div>

                <div className="flex items-center justify-between pt-1 pb-6 relative z-10">
                  <div className="flex items-center gap-3">
                    <div className="relative flex items-center">
                      <input
                        id="remember-me"
                        type="checkbox"
                        checked={rememberMe}
                        onChange={() => setRememberMe(!rememberMe)}
                        className="peer appearance-none w-5 h-5 rounded-md bg-[#25252c] checked:bg-[#C4FF0E] checked:border-transparent cursor-pointer transition-all"
                      />
                      <Check className="w-3.5 h-3.5 text-[#0A0A0E] font-bold absolute left-[3px] pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity" />
                    </div>
                    <label htmlFor="remember-me" className="text-[13px] font-medium text-[#f8f5fd]/70 cursor-pointer select-none hover:text-[#f8f5fd] transition-colors">
                      Lembrar de mim
                    </label>
                  </div>
                  <button className="text-[13px] text-[#9D4EDD] hover:text-[#c782ff] font-bold transition-colors">
                    Esqueceu sua senha?
                  </button>
                </div>

                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    onClick={handleLogin}
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-[#d095ff] to-[#c782ff] hover:opacity-90 text-[#490078] font-bold h-14 rounded-lg group shadow-[0_0_48px_rgba(208,149,255,0.15)] hover:shadow-[0_0_48px_rgba(208,149,255,0.3)] border-transparent transition-all duration-300 relative overflow-hidden"
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-[#490078]/30 border-t-[#490078] rounded-full animate-spin" />
                    ) : (
                      <>
                        <motion.div 
                          className="absolute inset-0 bg-white/30" 
                          initial={{ x: "-100%", skewX: -20 }}
                          whileHover={{ x: "200%", transition: { duration: 0.8, ease: "easeInOut" } }}
                        />
                        <span className="flex items-center gap-2 tracking-[0.02em] text-[15px] relative z-10">
                          ENTRAR NO VAULT <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </span>
                      </>
                    )}
                  </Button>
                </motion.div>
              </motion.form>
            ) : (
              <motion.form
                key="register"
                onSubmit={(e) => { e.preventDefault(); handleRegister(); }}
                initial={{ opacity: 0, filter: 'blur(8px)', y: 15 }}
                animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
                exit={{ opacity: 0, filter: 'blur(8px)', y: -15 }}
                transition={{ duration: 0.3, ease: "circOut" }}
                className="space-y-5"
              >
                <div className="space-y-2">
                  <label className="text-[11px] font-bold tracking-[0.05em] text-[#f8f5fd]/70 uppercase ml-1">Nome Completo</label>
                  <motion.div whileFocus={{ scale: 1.01 }}>
                    <Input
                      type="text"
                      placeholder="Seu nome"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="bg-[#25252c] border-transparent focus-visible:ring-1 focus-visible:ring-[#9D4EDD]/40 text-[#f8f5fd] placeholder:text-[#f8f5fd]/30 h-14 rounded-lg pl-4 text-base"
                    />
                  </motion.div>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-bold tracking-[0.05em] text-[#f8f5fd]/70 uppercase ml-1">Email</label>
                  <motion.div whileFocus={{ scale: 1.01 }}>
                    <Input
                      type="email"
                      placeholder="nome@exemplo.com"
                      value={registerEmail}
                      onChange={(e) => setRegisterEmail(e.target.value)}
                      className="bg-[#25252c] border-transparent focus-visible:ring-1 focus-visible:ring-[#9D4EDD]/40 text-[#f8f5fd] placeholder:text-[#f8f5fd]/30 h-14 rounded-lg pl-4 text-base"
                    />
                  </motion.div>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-bold tracking-[0.05em] text-[#f8f5fd]/70 uppercase ml-1">Senha</label>
                  <motion.div className="relative" whileFocus={{ scale: 1.01 }}>
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={registerPassword}
                      onChange={handlePasswordChange}
                      className="bg-[#25252c] border-transparent focus-visible:ring-1 focus-visible:ring-[#9D4EDD]/40 text-[#f8f5fd] placeholder:text-[#f8f5fd]/30 h-14 rounded-lg pl-4 pr-12 text-base"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[#f8f5fd]/40 hover:text-[#f8f5fd] transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </motion.div>
                  
                  <div className="pt-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className={`flex items-center text-[11px] font-medium transition-colors duration-300 ${passwordCriteria.minLength ? "text-[#C4FF0E]" : "text-[#f8f5fd]/40"}`}>
                        {passwordCriteria.minLength ? <Check className="w-3.5 h-3.5 mr-1.5 stroke-[3]" /> : <X className="w-3.5 h-3.5 mr-1.5" />}
                        Mín. 8 caracteres
                      </div>
                      <div className={`flex items-center text-[11px] font-medium transition-colors duration-300 ${passwordCriteria.hasUpperCase ? "text-[#C4FF0E]" : "text-[#f8f5fd]/40"}`}>
                        {passwordCriteria.hasUpperCase ? <Check className="w-3.5 h-3.5 mr-1.5 stroke-[3]" /> : <X className="w-3.5 h-3.5 mr-1.5" />}
                        Letra maiúscula
                      </div>
                      <div className={`flex items-center text-[11px] font-medium transition-colors duration-300 ${passwordCriteria.hasNumber ? "text-[#C4FF0E]" : "text-[#f8f5fd]/40"}`}>
                        {passwordCriteria.hasNumber ? <Check className="w-3.5 h-3.5 mr-1.5 stroke-[3]" /> : <X className="w-3.5 h-3.5 mr-1.5" />}
                        Número
                      </div>
                      <div className={`flex items-center text-[11px] font-medium transition-colors duration-300 ${passwordCriteria.hasSpecialChar ? "text-[#C4FF0E]" : "text-[#f8f5fd]/40"}`}>
                        {passwordCriteria.hasSpecialChar ? <Check className="w-3.5 h-3.5 mr-1.5 stroke-[3]" /> : <X className="w-3.5 h-3.5 mr-1.5" />}
                        Caractere especial
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-6">
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      onClick={handleRegister}
                      disabled={isLoading}
                      className="w-full bg-gradient-to-r from-[#d095ff] to-[#c782ff] hover:opacity-90 text-[#490078] font-bold h-14 rounded-lg group shadow-[0_0_48px_rgba(208,149,255,0.15)] hover:shadow-[0_0_48px_rgba(208,149,255,0.3)] border-transparent transition-all duration-300 relative overflow-hidden"
                    >
                      {isLoading ? (
                        <div className="w-5 h-5 border-2 border-[#490078]/30 border-t-[#490078] rounded-full animate-spin" />
                      ) : (
                        <>
                          <motion.div 
                            className="absolute inset-0 bg-white/30" 
                            initial={{ x: "-100%", skewX: -20 }}
                            whileHover={{ x: "200%", transition: { duration: 0.8, ease: "easeInOut" } }}
                          />
                          <span className="flex items-center gap-2 tracking-[0.02em] text-[15px] relative z-10">
                            CRIAR ACESSO <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                          </span>
                        </>
                      )}
                    </Button>
                  </motion.div>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Form Footer Links - No Divider Rules apply here to layout too */}
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 0.4 }} 
          transition={{ duration: 1, delay: 0.8 }}
          className="absolute bottom-8 right-8 hidden lg:flex items-center gap-8"
        >
          <a href="#" className="text-[11px] tracking-[0.1em] text-[#f8f5fd] hover:text-white uppercase font-bold transition-colors">Privacy</a>
          <a href="#" className="text-[11px] tracking-[0.1em] text-[#f8f5fd] hover:text-white uppercase font-bold transition-colors">Terms</a>
          <a href="#" className="text-[11px] tracking-[0.1em] text-[#f8f5fd] hover:text-white uppercase font-bold transition-colors">Security</a>
        </motion.div>
      </div>

      {/* Success Auth Overlay */}
      <AnimatePresence>
        {authSuccess && (
          <motion.div 
            initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            animate={{ opacity: 1, backdropFilter: 'blur(16px)' }}
            transition={{ duration: 0.8 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0e0e13]/80"
          >
            <motion.div 
              className="text-[48px] md:text-[64px] font-extrabold tracking-tight flex items-center gap-4 flex-wrap justify-center px-4 text-center overflow-hidden"
              style={{ fontFamily: '"Space Grotesk", sans-serif' }}
            >
              <motion.span 
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 25, delay: 0.1 }}
                className="text-white"
              >
                seja bem vindo,
              </motion.span>
              <motion.span 
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: { opacity: 0 },
                  visible: { opacity: 1, transition: { staggerChildren: 0.04, delayChildren: 0.3 } }
                }}
                className="text-[#C4FF0E] font-serif italic inline-flex px-2"
              >
                {Array.from(loggedInName).map((char, index) => (
                  <motion.span 
                    key={index} 
                    variants={{
                      hidden: { opacity: 0, y: 30 },
                      visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 350, damping: 25 } }
                    }}
                  >
                    {char === ' ' ? '\u00A0' : char}
                  </motion.span>
                ))}
              </motion.span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}