// app/signup/page.tsx (or pages/signup.tsx if using the pages directory)

'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase-browser' // Ensure you have this set up
import { useRouter } from 'next/navigation'

const SignUpPage = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) {
      setError(error.message)
    } else {
      router.push('/login') // Redirect to login after successful sign up
    }
  }

  return (
    <div className="signup-container">
      <h1>Sign Up</h1>
      {error && <p className="error-text">{error}</p>}
      <form onSubmit={handleSignUp}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">Sign Up</button>
      </form>
      <div>
        <p>Already have an account? <a href="/login">Login here</a></p>
      </div>
    </div>
  )
}

export default SignUpPage
