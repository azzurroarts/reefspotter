'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function RootLayout({ children }) {
  const router = useRouter()
  const [darkMode, setDarkMode] = useState(false)

  return (
    <html lang="en" className={darkMode ? 'dark' : ''}>
      <body className="min-h-screen bg-white dark:bg-black text-black dark:text-white">
        <header className="p-4 flex justify-between items-center border-b border-gray-200 dark:border-gray-700">
          <h1 className="text-2xl font-bold cursor-pointer" onClick={() => router.push('/')}>
            ReefSpotter
          </h1>
          <button
            className="px-3 py-1 border rounded"
            onClick={() => setDarkMode(!darkMode)}
          >
            {darkMode ? 'Light Mode' : 'Dark Mode'}
          </button>
        </header>
        <main>{children}</main>
      </body>
    </html>
  )
}
