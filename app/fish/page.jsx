'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase-browser'

export default function FishPage() {
  const [species, setSpecies] = useState([])
  const [unlocked, setUnlocked] = useState([])
  const [user, setUser] = useState(null) // Guest by default
  const [filter, setFilter] = useState('All Species')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)

  // Fetch all species
  useEffect(() => {
    const fetchSpecies = async () => {
      const { data } = await supabase.from('species').select('*')
      if (data) setSpecies(data)
    }
    fetchSpecies()
  }, [])

  // Fetch unlocked species for user (if logged in)
  useEffect(() => {
    if (!user || user.id === 'guest') return
    const fetchUnlocked = async () => {
      const { data } = await supabase
        .from('sightings')
        .select('species_id')
        .eq('user_id', user.id)
      if (data) setUnlocked(data.map(d => d.species_id))
    }
    fetchUnlocked()
  }, [user])

  const toggleUnlock = async (speciesId) => {
    if (!user || user.id === 'guest') return
    if (unlocked.includes(speciesId)) {
      await supabase.from('sightings').delete().eq('user_id', user.id).eq('species_id', speciesId)
      setUnlocked(unlocked.filter(id => id !== speciesId))
    } else {
      await supabase.from('sightings').insert({ user_id: user.id, species_id: speciesId })
      setUnlocked([...unlocked, speciesId])
    }
  }

  const filteredSpecies = species.filter(fish => {
    if (filter === 'All Species') return true
    if (!fish.location) return true
    return fish.location === filter
  })

  const progressPercentage = filteredSpecies.length
    ? (unlocked.length / filteredSpecies.length) * 100
    : 0

  return (
    <div className="relative">
      {/* Progress Bar */}
      <div className="progress-container">
        <div
          className="progress-bar bg-gradient-to-r from-pink-500 via-yellow-500 to-blue-500"
          style={{ width: `${progressPercentage}%` }}
        ></div>
        <div className="absolute top-0 right-2 font-bold text-black">{Math.round(progressPercentage)}%</div>
      </div>

      {/* Profile Icon */}
      <div className="fixed top-4 left-4 z-20">
        <button
          onClick={() => setIsProfileOpen(!isProfileOpen)}
          className="p-3 bg-white text-black border-2 border-black rounded-full shadow-md focus:outline-none"
        >
          👤
        </button>
      </div>

      {/* Mobile Hamburger for Dropdown */}
      <div className="fixed top-4 right-4 z-20">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="mobile-menu-button"
        >
          🐠
        </button>
      </div>

      {/* Mobile Dropdown */}
      {isMobileMenuOpen && (
        <div className="mobile-menu">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="All Species">All Species</option>
            <option value="GBR">Great Barrier Reef (GBR)</option>
            <option value="GSR">Great Southern Reef (GSR)</option>
          </select>
        </div>
      )}

      {/* Profile Modal */}
      {isProfileOpen && (
        <div className="profile-modal">
          <div className="profile-modal-content">
            <h2>User Profile</h2>
            <p>Email: {user?.email || 'N/A'}</p>
            <p>Name: {user?.user_metadata?.nickname || 'GUEST'}</p>
            {!user && (
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => window.location.href = '/login'}
                  className="login-btn"
                >
                  Login
                </button>
                <button
                  onClick={() => window.location.href = '/signup'}
                  className="login-btn"
                >
                  Signup
                </button>
              </div>
            )}
            <button
              onClick={() => setIsProfileOpen(false)}
              className="close-btn"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Species Grid */}
      <div className="species-grid p-4">
        {filteredSpecies
          .sort((a, b) => a.name.localeCompare(b.name))
          .map(fish => {
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
