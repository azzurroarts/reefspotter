'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase-browser'

export default function FishPage() {
  const [species, setSpecies] = useState([])
  const [unlocked, setUnlocked] = useState([])
  const [filter, setFilter] = useState('All Species')
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Guest view: no login required yet
  const user = { id: 'guest', email: null, nickname: 'GUEST' }

  // Fetch species
  useEffect(() => {
    const fetchSpecies = async () => {
      const { data } = await supabase.from('species').select('*')
      if (data) setSpecies(data)
    }
    fetchSpecies()
  }, [])

  // Fetch unlocked species for this user
  useEffect(() => {
    const fetchUnlocked = async () => {
      const { data } = await supabase
        .from('sightings')
        .select('species_id')
        .eq('user_id', user.id)
      if (data) setUnlocked(data.map(d => d.species_id))
    }
    fetchUnlocked()
  }, [user.id])

  const toggleUnlock = async (speciesId) => {
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

  const progress = (unlocked.length / filteredSpecies.length) * 100 || 0

  return (
    <div className="relative">
      {/* Progress Bar */}
      <div className="progress-container">
        <div className="progress-bar" style={{ width: `${progress}%` }}></div>
      </div>

      {/* Mobile Dropdown Button */}
      <div className="fixed top-10 left-4 z-20">
        <button className="mobile-menu-button" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>🐠</button>
      </div>

      {isMobileMenuOpen && (
        <div className="mobile-menu">
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="All Species">All Species</option>
            <option value="GBR">Great Barrier Reef (GBR)</option>
            <option value="GSR">Great Southern Reef (GSR)</option>
          </select>
        </div>
      )}

      {/* Profile Modal */}
      <div className="fixed top-10 right-4 z-20">
        <button className="mobile-menu-button" onClick={() => setIsProfileOpen(!isProfileOpen)}>👤</button>
      </div>

      {isProfileOpen && (
        <div className="profile-modal">
          <div className="profile-modal-content">
            <h2>User Profile</h2>
            <p>Email: {user.email || 'N/A'}</p>
            <p>Name: {user.nickname}</p>
            <button className="close-btn" onClick={() => setIsProfileOpen(false)}>Close</button>
          </div>
        </div>
      )}

      {/* Species Grid */}
      <div className="species-grid p-4">
        {filteredSpecies.sort((a, b) => a.name.localeCompare(b.name)).map(fish => {
          const isUnlocked = unlocked.includes(fish.species_id)
          return (
            <div
              key={fish.species_id}
              className={`species-card ${isUnlocked ? 'unlocked' : 'locked'}`}
              onClick={() => toggleUnlock(fish.species_id)}
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
