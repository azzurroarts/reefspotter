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

  // Fetch all species
  useEffect(() => {
    const fetchSpecies = async () => {
      const { data } = await supabase.from('species').select('*')
      if (data) setSpecies(data)
    }
    fetchSpecies()
  }, [])

  // Fetch unlocked species for current user
  useEffect(() => {
    if (!user) return
    const fetchUnlocked = async () => {
      const { data } = await supabase.from('sightings').select('species_id').eq('user_id', user.id)
      if (data) setUnlocked(data.map((d) => d.species_id))
    }
    fetchUnlocked()
  }, [user])

  const toggleUnlock = async (speciesId) => {
    if (!user) return

    if (unlocked.includes(speciesId)) {
      await supabase.from('sightings').delete().eq('user_id', user.id).eq('species_id', speciesId)
      setUnlocked(unlocked.filter(id => id !== speciesId))
    } else {
      await supabase.from('sightings').insert({ user_id: user.id, species_id: speciesId })
      setUnlocked([...unlocked, speciesId])
    }
  }

  // Filter species based on location
  const filteredSpecies = species.filter((fish) => {
    if (filter === 'All Species') return true
    if (!fish.location) return true
    return fish.location === filter
  })

  const progressPercentage = filteredSpecies.length
    ? Math.round((unlocked.length / filteredSpecies.length) * 100)
    : 0

  return (
    <div className="relative">
      {/* Progress Bar */}
      <div className="progress-container">
        <div
          className="progress-bar bg-gradient-to-r from-pink-500 via-yellow-500 to-blue-500"
          style={{ width: `${progressPercentage}%` }}
        />
        <div className="absolute top-0 right-2 text-black font-bold">{progressPercentage}%</div>
      </div>

      {/* Left-side stacked buttons */}
      <div className="fixed top-10 left-4 z-50 flex flex-col gap-4">
        {/* Profile button */}
        <button
          onClick={() => setIsProfileOpen(!isProfileOpen)}
          className="p-3 bg-white text-black border-2 border-black rounded-full shadow-md focus:outline-none"
        >
          👤
        </button>

        {/* Filter button */}
        <button
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          className="p-3 bg-white text-black border-2 border-black rounded-full shadow-md focus:outline-none"
        >
          🐟
        </button>
      </div>

      {/* Filter dropdown */}
      {isFilterOpen && (
        <div className="fixed top-24 left-4 z-50 bg-white border-2 border-black rounded-md p-3">
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

      {/* Profile Modal */}
      {isProfileOpen && (
        <div className="profile-modal">
          <div className="profile-modal-content">
            <h2 className="text-black">User Profile</h2>
            <p className="text-black">Email: {user?.email || 'N/A'}</p>
            <p className="text-black">Name: {user?.user_metadata?.nickname || 'GUEST'}</p>
            <div className="flex gap-2 mt-4">
              <button
                className="login-btn"
                onClick={() => alert('Login flow placeholder')}
              >
                LOGIN
              </button>
              <button
                className="login-btn"
                onClick={() => alert('Signup flow placeholder')}
              >
                SIGNUP
              </button>
            </div>
            <button
              className="close-btn mt-4"
              onClick={() => setIsProfileOpen(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Species Cards */}
      <div className="species-grid p-4">
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
