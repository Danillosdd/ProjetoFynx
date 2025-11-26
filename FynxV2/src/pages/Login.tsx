"use client"

import type React from "react"

import { useState } from "react"
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Eye, EyeOff, Mail, Lock, User, Apple, ArrowRight, Check, X } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"
import { api } from "@/services/api"
import { toast } from "sonner"
import fynxLogo from "@/assets/FYNX CABRA SF.png"

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [focusedInput, setFocusedInput] = useState<string | null>(null)
  const [rememberMe, setRememberMe] = useState(false)
  const navigate = useNavigate()

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

  /*
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const rotateX = useTransform(mouseY, [-300, 300], [5, -5])
  const rotateY = useTransform(mouseX, [-300, 300], [-5, 5])

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect()
    mouseX.set(e.clientX - rect.left - rect.width / 2)
    mouseY.set(e.clientY - rect.top - rect.height / 2)
  }

  const handleMouseLeave = () => {
    mouseX.set(0)
    mouseY.set(0)
  }
  */

  const handleSocialLogin = (provider: string) => {
    setIsLoading(true)
    // Simulate loading
    setTimeout(() => {
      setIsLoading(false)
      navigate("/dashboard")
    }, 2000)
  }

  const handleLogin = async () => {
    try {
      setIsLoading(true)
      console.log('[Login] Attempting login with:', email)
      const response = await api.post('/auth/login', { email, password })
      console.log('[Login] Success:', response.data)

      login(response.data.token, response.data.user)
      navigate("/dashboard")
    } catch (error: any) {
      console.error('[Login] Error:', error)
      toast.error("Erro ao fazer login", {
        description: error.response?.data?.error || 'Credenciais inválidas. Verifique seu email e senha.'
      })
    } finally {
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
      console.log('[Register] Attempting register with:', registerEmail)
      const response = await api.post('/auth/register', {
        name,
        email: registerEmail,
        password: registerPassword
      })
      console.log('[Register] Success:', response.data)

      login(response.data.token, response.data.user)
      navigate("/dashboard")
    } catch (error: any) {
      console.error('[Register] Error:', error)
      alert(error.response?.data?.error || 'Erro ao criar conta')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-3">
      {/* Left Side - Animated Background with Logo and Text */}
      <div className="lg:col-span-2 gradient-bg-dark flex items-center justify-center p-8 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-lime-400/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-lime-300/15 rounded-full blur-3xl animate-pulse delay-500"></div>
        </div>

        {/* Logo and Branding */}
        <div className="text-center relative z-10">
          <div className="flex items-center justify-center gap-8 mb-12">
            {/* Logo sem borda colorida */}
            <div className="animate-float">
              <img
                src={fynxLogo}
                alt="FYNX Logo"
                className="w-32 h-32"
              />
            </div>
            {/* Texto FYNX alinhado com a logo */}
            <div>
              <h1 className="text-8xl font-bold text-white drop-shadow-lg animate-text-bounce">
                {"fynx".split("").map((letter, index) => (
                  <span
                    key={index}
                    className="inline-block animate-letter-bounce text-white"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    {letter}
                  </span>
                ))}
              </h1>
            </div>
          </div>

          {/* Slogan centralizado abaixo */}
          <div className="mx-auto max-w-fit">
            <p className="text-2xl font-medium animate-text-float text-white">
              {"seu dinheiro no modo G.O.A.T".split("").map((char, index) => (
                <span
                  key={index}
                  className="inline-block animate-letter-float"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  {char === " " ? "\u00A0" : char}
                </span>
              ))}
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Forms with Animated Effects */}
      <div className="flex items-center justify-center p-6" style={{ backgroundColor: "#14141A" }}>
        <motion.div className="w-full max-w-sm" style={{ perspective: 1500 }}>
          <motion.div
          // style={{ rotateX, rotateY }}
          // onMouseMove={handleMouseMove}
          // onMouseLeave={handleMouseLeave}
          >
            <div className="relative group">
              {/* Card glow effect */}
              <motion.div
                className="absolute -inset-[1px] rounded-2xl opacity-0 group-hover:opacity-50 transition-opacity duration-700 pointer-events-none"
                animate={{
                  boxShadow: [
                    "0 0 10px 2px rgba(168,85,247,0.1)",
                    "0 0 15px 5px rgba(168,85,247,0.2)",
                    "0 0 10px 2px rgba(168,85,247,0.1)",
                  ],
                }}
                transition={{
                  duration: 4,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeInOut",
                  repeatType: "mirror",
                }}
              />

              {/* Traveling light beam effect */}
              <div className="absolute -inset-[1px] rounded-2xl overflow-hidden pointer-events-none">
                <motion.div
                  className="absolute top-0 left-0 h-[2px] w-[30%] bg-gradient-to-r from-transparent via-purple-400 to-transparent opacity-60"
                  animate={{
                    left: ["-30%", "100%"],
                  }}
                  transition={{
                    duration: 3,
                    ease: "easeInOut",
                    repeat: Number.POSITIVE_INFINITY,
                    repeatDelay: 2,
                  }}
                />

                <motion.div
                  className="absolute top-0 right-0 h-[30%] w-[2px] bg-gradient-to-b from-transparent via-lime-400 to-transparent opacity-60"
                  animate={{
                    top: ["-30%", "100%"],
                  }}
                  transition={{
                    duration: 3,
                    ease: "easeInOut",
                    repeat: Number.POSITIVE_INFINITY,
                    repeatDelay: 2,
                    delay: 0.8,
                  }}
                />

                <motion.div
                  className="absolute bottom-0 right-0 h-[2px] w-[30%] bg-gradient-to-r from-transparent via-purple-400 to-transparent opacity-60"
                  animate={{
                    right: ["-30%", "100%"],
                  }}
                  transition={{
                    duration: 3,
                    ease: "easeInOut",
                    repeat: Number.POSITIVE_INFINITY,
                    repeatDelay: 2,
                    delay: 1.6,
                  }}
                />

                <motion.div
                  className="absolute bottom-0 left-0 h-[30%] w-[2px] bg-gradient-to-b from-transparent via-lime-400 to-transparent opacity-60"
                  animate={{
                    bottom: ["-30%", "100%"],
                  }}
                  transition={{
                    duration: 3,
                    ease: "easeInOut",
                    repeat: Number.POSITIVE_INFINITY,
                    repeatDelay: 2,
                    delay: 2.4,
                  }}
                />
              </div>

              <Card className="bg-gray-900/40 backdrop-blur-xl border-purple-800/30 shadow-2xl relative overflow-hidden">
                <div
                  className="absolute inset-0 opacity-[0.02] pointer-events-none"
                  style={{
                    backgroundImage: `linear-gradient(135deg, white 0.5px, transparent 0.5px), linear-gradient(45deg, white 0.5px, transparent 0.5px)`,
                    backgroundSize: "20px 20px",
                  }}
                />

                <CardHeader className="text-center pb-6">
                  <CardTitle className="text-2xl font-bold text-white">Bem-vindo</CardTitle>
                  <CardDescription className="text-gray-400">Entre na sua conta ou crie uma nova</CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="login" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-6 bg-gray-800/50 border-purple-700/30">
                      <TabsTrigger
                        value="login"
                        className="text-gray-300 data-[state=active]:bg-purple-600 data-[state=active]:text-white"
                      >
                        Entrar
                      </TabsTrigger>
                      <TabsTrigger
                        value="register"
                        className="text-gray-300 data-[state=active]:bg-purple-600 data-[state=active]:text-white"
                      >
                        Cadastrar
                      </TabsTrigger>
                    </TabsList>

                    <div className="space-y-3 mb-6">
                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button
                          variant="outline"
                          className="w-full bg-gray-800/50 border-purple-700/30 text-white hover:bg-purple-900/20 hover:border-purple-600/50 transition-all duration-300 relative group/google"
                          onClick={() => handleSocialLogin("google")}
                          disabled={isLoading}
                        >
                          <div className="absolute inset-0 bg-purple-500/5 rounded-md blur opacity-0 group-hover/google:opacity-70 transition-opacity duration-300 pointer-events-none" />
                          <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                            <path
                              fill="currentColor"
                              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            />
                            <path
                              fill="currentColor"
                              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            />
                            <path
                              fill="currentColor"
                              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                            />
                            <path
                              fill="currentColor"
                              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            />
                          </svg>
                          Google
                          <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-purple-500/10 to-purple-500/0 pointer-events-none"
                            initial={{ x: "-100%" }}
                            whileHover={{ x: "100%" }}
                            transition={{ duration: 1, ease: "easeInOut" }}
                          />
                        </Button>
                      </motion.div>

                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button
                          variant="outline"
                          className="w-full bg-gray-800/50 border-purple-700/30 text-white hover:bg-purple-900/20 hover:border-purple-600/50 transition-all duration-300 relative group/apple"
                          onClick={() => handleSocialLogin("apple")}
                          disabled={isLoading}
                        >
                          <div className="absolute inset-0 bg-purple-500/5 rounded-md blur opacity-0 group-hover/apple:opacity-70 transition-opacity duration-300 pointer-events-none" />
                          <Apple className="w-4 h-4 mr-2" />
                          Apple
                          <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-purple-500/10 to-purple-500/0 pointer-events-none"
                            initial={{ x: "-100%" }}
                            whileHover={{ x: "100%" }}
                            transition={{ duration: 1, ease: "easeInOut" }}
                          />
                        </Button>
                      </motion.div>
                    </div>

                    <div className="relative mb-6">
                      <Separator className="bg-purple-700/30" />
                      <span className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-[#14141A] px-3 text-gray-400 text-sm">
                        ou
                      </span>
                    </div>

                    <TabsContent value="login" className="space-y-4">
                      <motion.div
                        className="space-y-2"
                        whileFocus={{ scale: 1.01 }}
                        transition={{ type: "spring", stiffness: 400, damping: 25 }}
                      >
                        <Label htmlFor="email" className="text-gray-300 text-sm">
                          Email
                        </Label>
                        <div className="relative group">
                          <div className="absolute -inset-[0.5px] bg-gradient-to-r from-purple-500/20 via-purple-500/10 to-purple-500/20 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none" />
                          <Mail
                            className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 transition-all duration-300 ${focusedInput === "email" ? "text-purple-400" : "text-purple-400"
                              }`}
                          />
                          <Input
                            id="email"
                            type="email"
                            placeholder="seu@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            onFocus={() => setFocusedInput("email")}
                            onBlur={() => setFocusedInput(null)}
                            className="pl-10 bg-gray-800/50 border-purple-700/30 text-white placeholder:text-gray-500 focus:border-purple-500 focus:bg-gray-800 transition-all duration-300"
                          />
                          {focusedInput === "email" && (
                            <motion.div
                              layoutId="input-highlight"
                              className="absolute inset-0 bg-purple-500/5 rounded-lg -z-10"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              transition={{ duration: 0.2 }}
                            />
                          )}
                        </div>
                      </motion.div>

                      <motion.div
                        className="space-y-2"
                        whileFocus={{ scale: 1.01 }}
                        transition={{ type: "spring", stiffness: 400, damping: 25 }}
                      >
                        <Label htmlFor="password" className="text-gray-300 text-sm">
                          Senha
                        </Label>
                        <div className="relative group">
                          <div className="absolute -inset-[0.5px] bg-gradient-to-r from-purple-500/20 via-purple-500/10 to-purple-500/20 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none" />
                          <Lock
                            className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 transition-all duration-300 ${focusedInput === "password" ? "text-purple-400" : "text-purple-400"
                              }`}
                          />
                          <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            onFocus={() => setFocusedInput("password")}
                            onBlur={() => setFocusedInput(null)}
                            className="pl-10 pr-10 bg-gray-800/50 border-purple-700/30 text-white placeholder:text-gray-500 focus:border-purple-500 focus:bg-gray-800 transition-all duration-300"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-purple-400 hover:text-purple-300 transition-colors duration-300"
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                          {focusedInput === "password" && (
                            <motion.div
                              layoutId="input-highlight"
                              className="absolute inset-0 bg-purple-500/5 rounded-lg -z-10"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              transition={{ duration: 0.2 }}
                            />
                          )}
                        </div>
                      </motion.div>

                      <div className="flex items-center justify-between pt-1">
                        <div className="flex items-center space-x-2">
                          <div className="relative">
                            <input
                              id="remember-me"
                              name="remember-me"
                              type="checkbox"
                              checked={rememberMe}
                              onChange={() => setRememberMe(!rememberMe)}
                              className="appearance-none h-4 w-4 rounded border border-purple-700/30 bg-gray-800/50 checked:bg-purple-600 checked:border-purple-600 focus:outline-none focus:ring-1 focus:ring-purple-500/30 transition-all duration-200"
                            />
                            {rememberMe && (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.5 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="absolute inset-0 flex items-center justify-center text-white pointer-events-none"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="12"
                                  height="12"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="3"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <polyline points="20 6 9 17 4 12"></polyline>
                                </svg>
                              </motion.div>
                            )}
                          </div>
                          <label
                            htmlFor="remember-me"
                            className="text-xs text-gray-400 hover:text-gray-300 transition-colors duration-200"
                          >
                            Lembrar de mim
                          </label>
                        </div>

                        <button className="text-xs text-lime-400 hover:text-lime-300 font-medium transition-colors duration-200">
                          Esqueceu sua senha?
                        </button>
                      </div>

                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="relative group/button"
                      >
                        <div className="absolute inset-0 bg-purple-500/20 rounded-lg blur-lg opacity-0 group-hover/button:opacity-70 transition-opacity duration-300" />
                        <Button
                          className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 transition-all duration-300 relative overflow-hidden"
                          disabled={isLoading}
                          onClick={handleLogin}
                        >
                          <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-purple-600/0 via-purple-400/30 to-purple-600/0 -z-10"
                            animate={{
                              x: ["-100%", "100%"],
                            }}
                            transition={{
                              duration: 1.5,
                              ease: "easeInOut",
                              repeat: Number.POSITIVE_INFINITY,
                              repeatDelay: 1,
                            }}
                            style={{
                              opacity: isLoading ? 1 : 0,
                              transition: "opacity 0.3s ease",
                            }}
                          />
                          <AnimatePresence mode="wait">
                            {isLoading ? (
                              <motion.div
                                key="loading"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="flex items-center justify-center"
                              >
                                <div className="w-4 h-4 border-2 border-white/70 border-t-transparent rounded-full animate-spin" />
                              </motion.div>
                            ) : (
                              <motion.span
                                key="button-text"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="flex items-center justify-center gap-1"
                              >
                                Entrar
                                <ArrowRight className="w-3 h-3 group-hover/button:translate-x-1 transition-transform duration-300" />
                              </motion.span>
                            )}
                          </AnimatePresence>
                        </Button>
                      </motion.div>
                    </TabsContent>

                    <TabsContent value="register" className="space-y-4">
                      <motion.div
                        className="space-y-2"
                        whileFocus={{ scale: 1.01 }}
                        transition={{ type: "spring", stiffness: 400, damping: 25 }}
                      >
                        <Label htmlFor="name" className="text-gray-300 text-sm">
                          Nome completo
                        </Label>
                        <div className="relative group">
                          <div className="absolute -inset-[0.5px] bg-gradient-to-r from-purple-500/20 via-purple-500/10 to-purple-500/20 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none" />
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400 w-4 h-4" />
                          <Input
                            id="name"
                            type="text"
                            placeholder="Seu nome"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="pl-10 bg-gray-800/50 border-purple-700/30 text-white placeholder:text-gray-500 focus:border-purple-500 focus:bg-gray-800 transition-all duration-300"
                          />
                        </div>
                      </motion.div>

                      <motion.div
                        className="space-y-2"
                        whileFocus={{ scale: 1.01 }}
                        transition={{ type: "spring", stiffness: 400, damping: 25 }}
                      >
                        <Label htmlFor="register-email" className="text-gray-300 text-sm">
                          Email
                        </Label>
                        <div className="relative group">
                          <div className="absolute -inset-[0.5px] bg-gradient-to-r from-purple-500/20 via-purple-500/10 to-purple-500/20 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none" />
                          <Mail
                            className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 transition-all duration-300 ${focusedInput === "register-email" ? "text-purple-400" : "text-purple-400"
                              }`}
                          />
                          <Input
                            id="register-email"
                            type="email"
                            placeholder="seu@email.com"
                            value={registerEmail}
                            onChange={(e) => setRegisterEmail(e.target.value)}
                            onFocus={() => setFocusedInput("register-email")}
                            onBlur={() => setFocusedInput(null)}
                            className="pl-10 bg-gray-800/50 border-purple-700/30 text-white placeholder:text-gray-500 focus:border-purple-500 focus:bg-gray-800 transition-all duration-300"
                          />
                          {focusedInput === "register-email" && (
                            <motion.div
                              layoutId="input-highlight"
                              className="absolute inset-0 bg-purple-500/5 rounded-lg -z-10"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              transition={{ duration: 0.2 }}
                            />
                          )}
                        </div>
                      </motion.div>

                      <motion.div
                        className="space-y-2"
                        whileFocus={{ scale: 1.01 }}
                        transition={{ type: "spring", stiffness: 400, damping: 25 }}
                      >
                        <Label htmlFor="register-password" className="text-gray-300 text-sm">
                          Senha
                        </Label>
                        <div className="relative group">
                          <div className="absolute -inset-[0.5px] bg-gradient-to-r from-purple-500/20 via-purple-500/10 to-purple-500/20 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none" />
                          <Lock
                            className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 transition-all duration-300 ${focusedInput === "register-password" ? "text-purple-400" : "text-purple-400"
                              }`}
                          />
                          <Input
                            id="register-password"
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            value={registerPassword}
                            onChange={handlePasswordChange}
                            onFocus={() => setFocusedInput("register-password")}
                            onBlur={() => setFocusedInput(null)}
                            className="pl-10 pr-10 bg-gray-800/50 border-purple-700/30 text-white placeholder:text-gray-500 focus:border-purple-500 focus:bg-gray-800 transition-all duration-300"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-purple-400 hover:text-purple-300 transition-colors duration-300"
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                          {focusedInput === "register-password" && (
                            <motion.div
                              layoutId="input-highlight"
                              className="absolute inset-0 bg-purple-500/5 rounded-lg -z-10"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              transition={{ duration: 0.2 }}
                            />
                          )}
                        </div>

                        {/* Password Criteria Feedback */}
                        <div className="space-y-1 mt-2">
                          <p className="text-xs text-gray-400 mb-2">A senha deve conter:</p>
                          <div className="grid grid-cols-2 gap-2">
                            <div className={`flex items-center text-xs ${passwordCriteria.minLength ? "text-green-400" : "text-gray-500"}`}>
                              {passwordCriteria.minLength ? <Check className="w-3 h-3 mr-1" /> : <X className="w-3 h-3 mr-1" />}
                              Mínimo 8 caracteres
                            </div>
                            <div className={`flex items-center text-xs ${passwordCriteria.hasUpperCase ? "text-green-400" : "text-gray-500"}`}>
                              {passwordCriteria.hasUpperCase ? <Check className="w-3 h-3 mr-1" /> : <X className="w-3 h-3 mr-1" />}
                              Letra maiúscula
                            </div>
                            <div className={`flex items-center text-xs ${passwordCriteria.hasNumber ? "text-green-400" : "text-gray-500"}`}>
                              {passwordCriteria.hasNumber ? <Check className="w-3 h-3 mr-1" /> : <X className="w-3 h-3 mr-1" />}
                              Número
                            </div>
                            <div className={`flex items-center text-xs ${passwordCriteria.hasSpecialChar ? "text-green-400" : "text-gray-500"}`}>
                              {passwordCriteria.hasSpecialChar ? <Check className="w-3 h-3 mr-1" /> : <X className="w-3 h-3 mr-1" />}
                              Caractere especial
                            </div>
                          </div>
                        </div>
                      </motion.div>

                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="relative group/button"
                      >
                        <div className="absolute inset-0 bg-purple-500/20 rounded-lg blur-lg opacity-0 group-hover/button:opacity-70 transition-opacity duration-300" />
                        <Button
                          className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 transition-all duration-300 relative overflow-hidden"
                          onClick={handleRegister}
                          disabled={isLoading}
                        >
                          <span className="flex items-center justify-center gap-1">
                            Criar conta
                            <ArrowRight className="w-3 h-3 group-hover/button:translate-x-1 transition-transform duration-300" />
                          </span>
                        </Button>
                      </motion.div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}