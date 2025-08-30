'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase-browser'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [user, setUser] = useState<any | null>(null) // replace 'any' with your proper type if you define it
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const handleEmailLogin = async () => {
    setLoading(true)
    setErrorMsg(null)
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        setErrorMsg(error.message)
        return
      }

      if ('user' in data && data.user) {
        setUser(data.user)
      }

    } catch (err: any) {
      setErrorMsg(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleGithubLogin = async () => {
    setLoading(true)
    setErrorMsg(null)
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'github'
      })

      if (error) {
        setErrorMsg(error.message)
        return
      }

      if ('user' in data && data.user) {
        setUser(data.user)
      } else {
        console.log('Redirecting to OAuth provider...')
      }

    } catch (err: any) {
      setErrorMsg(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-container">
      <h1 className="login-header">Login</h1>

      {errorMsg && <p className="text-red-500">{errorMsg}</p>}

      <div className="login-form">
        <input
          className="input-field"
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        <input
          className="input-field"
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
        <button
          className="login-btn"
          onClick={handleEmailLogin}
          disabled={loading}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>

        <button
          className="login-btn mt-4 bg-gray-800 hover:bg-gray-700"
          onClick={handleGithubLogin}
          disabled={loading}
        >
          {loading ? 'Redirecting...' : 'Login with GitHub'}
        </button>

        <p className="sign-up">
          Don’t have an account? <a href="/signup">Sign up here</a>
        </p>
      </div>
    </div>
  )
}
