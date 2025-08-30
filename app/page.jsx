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

  // Auth modal fields
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [authError, setAuthError] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  // Fetch species on mount
  useEffect(() => {
    const fetchSpecies = async () => {
      const { data } = await supabase.from('species').select('*')
      if (data) setSpecies(data)
    }
    fetchSpecies()
  }, [])

  // Fetch unlocked species for logged-in user
  useEffect(() => {
    if (!user) return
    const fetchUnlocked = async () => {
      const { data } = await supabase
        .from('sightings')
        .select('species_id')
        .eq('user_id', user.id)
      if (data) setUnlocked(data.map((d) => d.species_id))
    }
    fetchUnlocked()
  }, [user])

  // Toggle unlock for guest or logged-in user
  const toggleUnlock = async (speciesId) => {
    if (user) {
      // Logged-in: update Supabase
      if (unlocked.includes(speciesId)) {
        await supabase
          .from('sightings')
          .delete()
          .eq('user_id', user.id)
          .eq('species_id', speciesId)
        setUnlocked(unlocked.filter((id) => id !== speciesId))
      } else {
        await supabase
          .from('sightings')
          .insert({ user_id: user.id, species_id: speciesId })
        setUnlocked([...unlocked, speciesId])
      }
    } else {
      // Guest: update local state
      if (unlocked.includes(speciesId)) {
        setUnlocked(unlocked.filter((id) => id !== speciesId))
      } else {
        setUnlocked([...unlocked, speciesId])
      }
    }
  }

  // Sync guest progress to Supabase after login/signup
  const syncGuestProgress = async (newUser) => {
    if (!newUser || !unlocked.length) return
    const existing = await supabase
      .from('sightings')
      .select('species_id')
      .eq('user_id', newUser.id)
    const existingIds = existing.data?.map((d) => d.species_id) || []

    const newSightings = unlocked
      .filter((id) => !existingIds.includes(id))
      .map((species_id) => ({ user_id: newUser.id, species_id }))

    if (newSightings.length) {
      await supabase.from('sightings').insert(newSightings)
    }
  }

  // Login
  const handleLogin = async () => {
    setIsLoading(true)
    setAuthError(null)
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    setIsLoading(false)
    if (error) {
      setAuthError(error.message)
    } else {
      setUser(data.user)
      await syncGuestProgress(data.user)
      setIsProfileOpen(false)
    }
  }

  // Signup
  const handleSignup = async () => {
    setIsLoading(true)
    setAuthError(null)
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })
    setIsLoading(false)
    if (error) {
      setAuthError(error.message)
    } else {
      alert('Signup successful! Check your email to confirm your account.')
      setUser(data.user)
      await syncGuestProgress(data.user)
      setIsProfileOpen(false)
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
      {/* Sticky Title */}
      <h1 className="sticky-title text-white text-4xl md:text-5xl font-bold lowercase mb-6">
        reefspotter
      </h1>

      {/* Sticky Buttons + Filter Bubble */}
      <div className="sticky-button-container">
        <button onClick={() => setIsProfileOpen(!isProfileOpen)} className="sticky-button">
          👤
        </button>
        <button onClick={() => setIsFilterOpen(!isFilterOpen)} className="sticky-button">
          🐟
        </button>

        {isFilterOpen && (
          <div className="filter-bubble">
            <select value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option value="All Species">All Species</option>
              <option value="GBR">Great Barrier Reef (GBR)</option>
              <option value="GSR">Great Southern Reef (GSR)</option>
            </select>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      <div className="progress-container mt-4 relative">
        <div className="progress-bar bg-gradient-to-r from-pink-500 via-yellow-500 to-blue-500" style={{ width: `${progressPercentage}%` }} />
        <div className="absolute top-0 right-2 text-black font-bold">{progressPercentage}%</div>
      </div>

      {/* Profile Modal */}
      {isProfileOpen && (
        <div className="profile-modal">
          <div className="profile-modal-content">
            <h2 className="text-black">User Profile</h2>
            <p className="text-black">Email: {user?.email || 'N/A'}</p>
            <p className="text-black">Name: {user?.nickname || 'GUEST'}</p>

            <div className="flex flex-col gap-2 mt-4">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="p-2 border-2 border-black rounded-md"
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="p-2 border-2 border-black rounded-md"
              />
              {authError && <p className="text-red-600 font-bold">{authError}</p>}
              <div className="flex gap-2">
                <button onClick={handleLogin} className="login-btn bg-green-500 text-white p-2 rounded-md" disabled={isLoading}>
                  {isLoading ? 'Logging in...' : 'LOGIN'}
                </button>
                <button onClick={handleSignup} className="login-btn bg-blue-500 text-white p-2 rounded-md" disabled={isLoading}>
                  {isLoading ? 'Signing up...' : 'SIGNUP'}
                </button>
              </div>
            </div>

            <button className="close-btn mt-4 bg-red-500 text-white p-2 rounded-md" onClick={() => setIsProfileOpen(false)}>Close</button>
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
