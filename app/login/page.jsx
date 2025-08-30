'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase-browser'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const router = useRouter()

  const handleLogin = async (e) => {
    e.preventDefault()
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    if (error) {
      setErrorMsg(error.message)
    } else {
      router.push('/fish')
    }
  }

  return (
    <div className="login-container">
      <h1 className="login-header">Login</h1>
      <form className="login-form" onSubmit={handleLogin}>
        <input
          className="input-field"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="input-field"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button className="login-btn" type="submit">Login</button>
      </form>
      {errorMsg && <p className="text-red-500 mt-2">{errorMsg}</p>}
      <p className="sign-up">
        No account? <a href="/signup">Sign up</a>
      </p>
    </div>
  )
}
