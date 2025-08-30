'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase-browser'

export default function FishPage() {
  const [species, setSpecies] = useState([])
  const [unlocked, setUnlocked] = useState([])
  const [filter, setFilter] = useState('All Species')
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [user, setUser] = useState(null) // guest by default

  useEffect(() => {
    const fetchSpecies = async () => {
      const { data } = await supabase.from('species').select('*')
      if (data) setSpecies(data)
    }
    fetchSpecies()
  }, [])

  // Guest-based unlocked logic
  const toggleUnlock = (speciesId) => {
    if (unlocked.includes(speciesId)) {
      setUnlocked(unlocked.filter((id) => id !== speciesId))
    } else {
      setUnlocked([...unlocked, speciesId])
    }
  }

  const filteredSpecies = species.filter((fish) => {
    if (filter === 'All Species') return true
    if (!fish.location) return true
    return fish.location === filter
  })

  const progressPercentage = filteredSpecies.length
    ? Math.round((unlocked.length / filteredSpecies.length) * 100)
    : 0

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-blue-500 via-cyan-400 to-white p-4">
      {/* Page Title */}
      <h1 className="sticky-title text-white text-4xl md:text-5xl font-bold lowercase mb-6">
  reefspotter
</h1>


      {/* Top-left buttons side by side, larger */}
     <div className="sticky-buttons mb-4">

        <button
          onClick={() => setIsProfileOpen(!isProfileOpen)}
          className="p-6 md:p-8 bg-white text-black border-2 border-black rounded-full shadow-md text-4xl md:text-5xl focus:outline-none"
        >
          👤
        </button>
        <button
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          className="p-6 md:p-8 bg-white text-black border-2 border-black rounded-full shadow-md text-4xl md:text-5xl focus:outline-none"
        >
          🐟
        </button>
      </div>

      {/* Filter Dropdown (below buttons, left-aligned) */}
      {isFilterOpen && (
        <div className="bg-white border-2 border-black rounded-xl p-4 w-72 mt-2 z-50 shadow-lg">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="p-3 bg-white text-black border-2 border-black rounded-full shadow-md w-full"
          >
            <option value="All Species">All Species</option>
            <option value="GBR">Great Barrier Reef (GBR)</option>
            <option value="GSR">Great Southern Reef (GSR)</option>
          </select>
        </div>
      )}

      {/* Progress Bar */}
      <div className="progress-container mt-4 relative">
        <div
          className="progress-bar bg-gradient-to-r from-pink-500 via-yellow-500 to-blue-500"
          style={{ width: `${progressPercentage}%` }}
        />
        <div className="absolute top-0 right-2 text-black font-bold">{progressPercentage}%</div>
      </div>

      {/* Profile Modal */}
      {isProfileOpen && (
        <div className="profile-modal">
          <div className="profile-modal-content">
            <h2 className="text-black">User Profile</h2>
            <p className="text-black">Email: {user?.email || 'N/A'}</p>
            <p className="text-black">Name: {user?.nickname || 'GUEST'}</p>
            <div className="flex gap-2 mt-4">
              <button className="login-btn" onClick={() => alert('Login placeholder')}>
                LOGIN
              </button>
              <button className="login-btn" onClick={() => alert('Signup placeholder')}>
                SIGNUP
              </button>
            </div>
            <button className="close-btn mt-4" onClick={() => setIsProfileOpen(false)}>
              Close
            </button>
          </div>
        </div>
      )}

      {/* Species Cards */}
      <div className="species-grid mt-8">
        {filteredSpecies
          .sort((a, b) => a.name.localeCompare(b.name))
          .map((fish) => {
            const isUnlocked = unlocked.includes(fish.id)
            return (
              <div
                key={fish.id}
                onClick={() => toggleUnlock(fish.id)}
                className={`species-card ${isUnlocked ? 'unlocked' : 'locked'}`}
              >
                <img src={fish.image_url} alt={fish.name} />
                <h2 className="font-bold text-center">{fish.name}</h2>
                <p className="text-sm italic text-center">{fish.scientific_name}</p>
              </div>
            )
          })}
      </div>
    </div>
  )
}
