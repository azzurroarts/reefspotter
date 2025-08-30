'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase-browser'

type UserProfile = {
  id: string
  email: string | null
  full_name: string
  nickname: string
  favourite_fish: string
  location: string
  profile_image: string
}

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) console.error(error.message)
    setLoading(false)
  }

  const handleSignup = async () => {
    setLoading(true)
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) console.error(error.message)
    setLoading(false)
  }

  return (
    <div className="login-container">
      <h1 className="login-header">Login</h1>
      <div className="login-form">
        <input
          type="email"
          placeholder="Email"
          className="input-field"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          className="input-field"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button onClick={handleLogin} disabled={loading} className="login-btn">
          {loading ? 'Logging in...' : 'Login'}
        </button>
        <button onClick={handleSignup} disabled={loading} className="login-btn mt-2">
          {loading ? 'Signing up...' : 'Sign Up'}
        </button>
      </div>
    </div>
  )
}
