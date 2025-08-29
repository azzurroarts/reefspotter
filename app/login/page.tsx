'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase-browser'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (!error) router.push('/fish')
    else console.error(error.message)
  }

  return (
    <div className="flex justify-center items-center h-screen bg-blue-100">
      <form onSubmit={handleLogin} className="bg-white p-8 rounded-xl shadow-md flex flex-col gap-4 w-80">
        <h1 className="text-center text-2xl font-bold">Login</h1>
        <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="p-2 border rounded" />
        <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} className="p-2 border rounded" />
        <button type="submit" className="bg-blue-500 text-white py-2 rounded">Login</button>
      </form>
    </div>
  )
}
