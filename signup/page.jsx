'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase-browser'
import { useRouter } from 'next/navigation'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const router = useRouter()

  const handleSignup = async (e) => {
    e.preventDefault()
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName }
      }
    })
    if (error) {
      setErrorMsg(error.message)
    } else {
      router.push('/fish')
    }
  }

  return (
    <div className="login-container">
      <h1 className="login-header">Sign Up</h1>
      <form className="login-form" onSubmit={handleSignup}>
        <input
          className="input-field"
          type="text"
          placeholder="Full Name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />
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
        <button className="login-btn" type="submit">Sign Up</button>
      </form>
      {errorMsg && <p className="text-red-500 mt-2">{errorMsg}</p>}
    </div>
  )
}
