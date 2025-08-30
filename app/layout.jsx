'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase-browser'

export default function Layout({ children }) {
  const [user, setUser] = useState(null)

  return (
    <div className="min-h-screen flex flex-col">
      <header className="p-4 bg-blue-500 text-white">
        <h1>My Reef App</h1>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="p-4 bg-gray-200 text-center">
        &copy; 2025 Reef App
      </footer>
    </div>
  )
}
