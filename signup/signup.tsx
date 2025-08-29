'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase-browser'
import { useRouter } from 'next/navigation'

export default function SignUpPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) setError(error.message)
    else router.push('/login')
  }

  return (
    <div className="login-container">
      <div className="image-circle">
        <img 
          src="https://csmqqtenglpbdgfobdsi.supabase.co/storage/v1/object/public/species-images/leafyseadragon.png" 
          alt="Fish Species" 
        />
      </div>
      <h1 className="login-header">Sign Up</h1>
      {error && <p className="text-red-500 font-bold">{error}</p>}
      <form onSubmit={handleSignUp} className="login-form">
        <input type="email" placeholder="Email" value={email} 
          onChange={(e) => setEmail(e.target.value)} className="input-field" 
        />
        <input type="password" placeholder="Password" value={password} 
          onChange={(e) => setPassword(e.target.value)} className="input-field" 
        />
        <button type="submit" className="login-btn">Sign Up</button>
      </form>
      <div className="sign-up">
        <p>Already have an account? <a href="/login">Login here</a></p>
      </div>
    </div>
  )
}
