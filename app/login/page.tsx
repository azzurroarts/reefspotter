'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase-browser'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setError(error.message)
    else router.push('/fish')
  }

  const handleSignUp = async () => {
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) setError(error.message)
    else router.push('/fish')
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-2xl font-bold mb-4">ReefSpotter Login / Sign Up</h1>
      {error && <p className="text-red-600 mb-2">{error}</p>}
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        className="mb-2 p-2 border rounded w-64"
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        className="mb-2 p-2 border rounded w-64"
      />
      <div className="flex gap-4 mt-2">
        <button onClick={handleLogin} className="bg-blue-500 text-white px-4 py-2 rounded">Login</button>
        <button onClick={handleSignUp} className="bg-green-500 text-white px-4 py-2 rounded">Sign Up</button>
      </div>
    </div>
  )
}
