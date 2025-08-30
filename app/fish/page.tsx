'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase-browser'

type SupabaseUser = {
  id: string
  email: string | null
  user_metadata: {
    full_name: string
    nickname: string
    favourite_fish: string
    location: string
    profile_image: string
  }
}

type Species = {
  id: number
  name: string
  scientific_name: string
  image_url: string
  location: string | null
}

export default function FishPage() {
  const [species, setSpecies] = useState<Species[]>([])
  const [unlocked, setUnlocked] = useState<number[]>([])
  const [user] = useState<SupabaseUser | null>(null) // local mode: no login first
  const [filter, setFilter] = useState<string>('All Species')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)

// Fetch all species
useEffect(() => {
  const fetchSpecies = async () => {
    const { data } = await supabase.from<'species', Species>('species').select('*')
    if (data) setSpecies(data)
  }
  fetchSpecies()
}, [])



  // Fetch unlocked species for current user
  useEffect(() => {
    if (!user) return
    const fetchUnlocked = async () => {
      const { data } = await supabase
        .from<{ species_id: number }>('sightings')
        .select('species_id')
        .eq('user_id', user.id)
      if (data) setUnlocked(data.map(d => d.species_id))
    }
    fetchUnlocked()
  }, [user])

  const toggleUnlock = async (speciesId: number) => {
    if (!user) return
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
    if (fish.location === null) return true
    return fish.location === filter
  })

  const progressPercentage = filteredSpecies.length > 0 ? (unlocked.length / filteredSpecies.length) * 100 : 0

  return (
    <div className="relative">
      {/* Progress Bar */}
      <div className="progress-container">
        <div
          className="progress-bar bg-gradient-to-r from-pink-500 via-yellow-500 to-blue-500"
          style={{ width: `${progressPercentage}%` }}
        ></div>
        <div className="absolute top-0 right-2 text-black font-bold">{Math.round(progressPercentage)}%</div>
      </div>

      {/* Mobile Hamburger Icon */}
      <div className="md:hidden fixed top-10 right-4 z-20">
        <button className="mobile-menu-button" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          🐠
        </button>
      </div>

      {/* Mobile Dropdown */}
      {isMobileMenuOpen && (
        <div className="mobile-menu">
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="All Species">All Species</option>
            <option value="GBR">Great Barrier Reef (GBR)</option>
            <option value="GSR">Great Southern Reef (GSR)</option>
          </select>
        </div>
      )}

      {/* Desktop Dropdown */}
      <div className="hidden md:flex fixed top-10 right-4">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="p-3 bg-white text-black border-2 border-black rounded-full shadow-md appearance-none focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all duration-300 cursor-pointer"
        >
          <option value="All Species">All Species</option>
          <option value="GBR">Great Barrier Reef (GBR)</option>
          <option value="GSR">Great Southern Reef (GSR)</option>
        </select>
      </div>

      {/* Profile Icon */}
      <div className="fixed top-10 left-4 z-20">
        <button onClick={() => setIsProfileOpen(!isProfileOpen)} className="mobile-menu-button">
          👤
        </button>
      </div>

      {/* Profile Modal */}
      {isProfileOpen && (
        <div className="profile-modal">
          <div className="profile-modal-content">
            <h2>User Profile</h2>
            <p>Email: {user?.email || 'Guest'}</p>
            <p>Name: {user?.user_metadata.nickname || 'Guest'}</p>
            <div className="flex justify-end mt-2">
              <button onClick={() => setIsProfileOpen(false)} className="close-btn">
                Close
              </button>
            </div>
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
                <h2 className="font-bold text-center mt-2">{fish.name}</h2>
                <p className="text-sm italic text-center mb-2">{fish.scientific_name}</p>
              </div>
            )
          })}
      </div>
    </div>
  )
}
