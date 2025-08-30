'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase-browser'
import { useRouter } from 'next/navigation'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const router = useRouter()

  const handleSignup = async (e) => {
    e.preventDefault()
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } }
    })
    if (!error) router.push('/fish')
    else alert(error.message)
  }

  return (
    <div className="login-container">
      <h1 className="login-header">Sign Up</h1>
      <form className="login-form" onSubmit={handleSignup}>
        <input
          type="text"
          placeholder="Full Name"
          className="input-field"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />
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
        <button type="submit" className="login-btn">Sign Up</button>
      </form>
      <div className="sign-up">
        <a href="../login">Back to Login</a>
      </div>
    </div>
  )
}
