'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase-browser'

export default function FishPage() {
  const [species, setSpecies] = useState([])
  const [unlocked, setUnlocked] = useState([])
  const [filter, setFilter] = useState('All Species')
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [user, setUser] = useState({ id: 'guest', email: null, nickname: 'GUEST' })

  useEffect(() => {
    const fetchSpecies = async () => {
      const { data } = await supabase.from('species').select('*')
      if (data) setSpecies(data)
    }
    fetchSpecies()
  }, [])

  useEffect(() => {
    if (user.id === 'guest') return
    const fetchUnlocked = async () => {
      const { data } = await supabase.from('sightings').select('species_id').eq('user_id', user.id)
      if (data) setUnlocked(data.map(d => d.species_id))
    }
    fetchUnlocked()
  }, [user])

  const toggleUnlock = (speciesId) => {
    if (unlocked.includes(speciesId)) {
      setUnlocked(unlocked.filter(id => id !== speciesId))
    } else {
      setUnlocked([...unlocked, speciesId])
    }
  }

  const filteredSpecies = species.filter(fish => {
    if (filter === 'All Species') return true
    if (!fish.location) return true
    return fish.location === filter
  })

  const progress = filteredSpecies.length > 0 ? Math.round((unlocked.length / filteredSpecies.length) * 100) : 0

  return (
    <div className="relative min-h-screen p-4 bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      {/* Progress Bar */}
      <div className="progress-container">
        <div
          className="progress-bar bg-gradient-to-r from-pink-500 via-yellow-400 to-blue-500"
          style={{ width: `${progress}%` }}
        ></div>
        <div className="absolute top-0 right-2 font-bold text-black">{progress}%</div>
      </div>

     {/* Filter button (top-right) */}
<div className="fixed top-10 right-16 z-50">
  <button
    className="mobile-menu-button"
    onClick={() => setIsFilterOpen(!isFilterOpen)}
  >
    🐟 Filter
  </button>
</div>

{/* Filter dropdown */}
{isFilterOpen && (
  <div className="mobile-menu fixed top-16 right-16 z-50">
    <select
      value={filter}
      onChange={(e) => setFilter(e.target.value)}
      className="w-full"
    >
      <option value="All Species">All Species</option>
      <option value="GBR">Great Barrier Reef (GBR)</option>
      <option value="GSR">Great Southern Reef (GSR)</option>
    </select>
  </div>
)}

      {/* Profile Icon */}
      <div className="fixed top-10 right-4 z-50">
        <button
          className="mobile-menu-button"
          onClick={() => setIsProfileOpen(true)}
        >
          👤
        </button>
      </div>

      {/* Profile Modal */}
      {isProfileOpen && (
        <div className="profile-modal">
          <div className="profile-modal-content text-black">
            <h2>User Profile</h2>
            <p>Email: {user.email || 'N/A'}</p>
            <p>Name: {user.nickname || 'GUEST'}</p>

            <div className="flex justify-end mt-4 gap-2">
              <button
                className="login-btn"
                onClick={() => alert('Login modal placeholder')}
              >
                Login
              </button>
              <button
                className="login-btn"
                onClick={() => alert('Signup modal placeholder')}
              >
                Signup
              </button>
              <button
                className="close-btn"
                onClick={() => setIsProfileOpen(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Species Grid */}
      <div className="species-grid mt-16">
        {filteredSpecies.sort((a, b) => a.name.localeCompare(b.name)).map(fish => {
          const isUnlocked = unlocked.includes(fish.id)
          return (
            <div
              key={fish.id}
              className={`species-card ${isUnlocked ? 'unlocked' : 'locked'}`}
              onClick={() => toggleUnlock(fish.id)}
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
