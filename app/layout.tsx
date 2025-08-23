'use client'

import { useState } from 'react'

export default function Layout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  // Function to toggle sidebar visibility
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  return (
    <>
      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full bg-black text-white p-4 transition-transform transform ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ width: '250px', zIndex: 40 }}
      >
        <h2 className="text-2xl mb-6">Sidebar</h2>
        <ul>
          <li><a href="#">Link 1</a></li>
          <li><a href="#">Link 2</a></li>
          <li><a href="#">Link 3</a></li>
        </ul>
      </div>

      {/* Main Content */}
      <div className={`transition-all ${isSidebarOpen ? 'ml-64' : 'ml-0'} w-full`}>
        <div className="relative">
          {/* Hamburger Menu */}
          <button
            onClick={toggleSidebar}
            className="fixed top-4 left-4 z-50 text-white"
          >
            ☰
          </button>

          {/* Layout Content */}
          <main className="min-h-screen">
            {children}
          </main>
        </div>
      </div>
    </>
  )
}
