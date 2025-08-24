'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase-browser'
import { useRouter } from 'next/navigation'

const LoginPage = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      console.error("Login error:", error.message)
    } else {
      router.push('/fish') // Redirect to fish page after successful login
    }
  }

  return (
    <div className="login-container">
      <div className="image-circle">
        <img 
          src="https://csmqqtenglpbdgfobdsi.supabase.co/storage/v1/object/public/species-images/leafyseadragon.png" 
          alt="Fish Species" 
        />
      </div>
      <h1 className="login-header">reefspotter</h1>
      <form onSubmit={handleLogin} className="login-form">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="input-field"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="input-field"
        />
        <button type="submit" className="login-btn">Login</button>
        <div className="sign-up">
          {/* Ensure correct path to the Sign Up page */}
          <p>Don&apos;t have an account? <a href="/signup">Sign up</a></p>
        </div>
      </form>
    </div>
  )
}

export default LoginPage
