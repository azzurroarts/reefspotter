'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase-browser'
import { useRouter } from 'next/navigation'

export default function FishPage() {
  const [species, setSpecies] = useState([])
  const [unlocked, setUnlocked] = useState([])
  const [user, setUser] = useState(null) // plain JS, no types
  const [filter, setFilter] = useState('All Species')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const router = useRouter()

  // Fetch user (guest mode by default)
  useEffect(() => {
    setUser({ id: 'guest', email: null, user_metadata: { nickname: 'GUEST' } })
  }, [])

  // Fetch all species
  useEffect(() => {
    const fetchSpecies = async () => {
      const { data } = await supabase.from('species').select('*')
      if (data) setSpecies(data)
    }
    fetchSpecies()
  }, [])

  // Fetch unlocked species (if user exists)
  useEffect(() => {
    if (!user) return
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
    if (!fish.location) return true
    return fish.location === filter
  })

  const progressPercentage = filteredSpecies.length ? (unlocked.length / filteredSpecies.length) * 100 : 0

  return (
    <div className="relative">
      {/* Progress Bar */}
      <div className="progress-container">
        <div
          className="progress-bar bg-gradient-to-r from-pink-500 via-yellow-500 to-blue-500"
          style={{ width: `${progressPercentage}%` }}
        />
        <div className="absolute top-0 right-2 text-black font-bold">{Math.round(progressPercentage)}%</div>
      </div>

      {/* Mobile Hamburger */}
      <div className="fixed top-10 right-4 md:hidden z-20">
        <button className="mobile-menu-button" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>🐠</button>
      </div>

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

      {/* Desktop Dropdown */}
      <div className="hidden md:flex fixed top-10 right-4 z-20">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="p-3 bg-white text-black border-2 border-black rounded-full shadow-md cursor-pointer"
        >
          <option value="All Species">All Species</option>
          <option value="GBR">Great Barrier Reef (GBR)</option>
          <option value="GSR">Great Southern Reef (GSR)</option>
        </select>
      </div>

      {/* Profile Icon */}
      <div className="fixed top-10 left-4 z-20">
        <button
          onClick={() => setIsProfileOpen(!isProfileOpen)}
          className="p-3 bg-white text-black border-2 border-black rounded-full shadow-md focus:outline-none"
        >
          👤
        </button>
      </div>

      {/* Profile Modal */}
      {isProfileOpen && (
        <div className="profile-modal">
          <div className="profile-modal-content">
            <h2>User Profile</h2>
            <p>Email: {user?.email || 'N/A'}</p>
            <p>Name: {user?.user_metadata.nickname}</p>
            <button className="close-btn" onClick={() => setIsProfileOpen(false)}>Close</button>
          </div>
        </div>
      )}

      {/* Species Cards */}
      <div className="species-grid p-4">
        {filteredSpecies.sort((a, b) => a.name.localeCompare(b.name)).map(fish => {
          const isUnlocked = unlocked.includes(fish.id)
          return (
            <div
              key={fish.id}
              className={`species-card ${isUnlocked ? 'unlocked' : 'locked'}`}
              onClick={() => toggleUnlock(fish.id)}
            >
              <img src={fish.image_url || '/placeholder.png'} alt={fish.name || 'Species image'} />
              <h2 className="font-bold text-center">{fish.name}</h2>
              <p className="text-sm italic text-center">{fish.scientific_name}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
