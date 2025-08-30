'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase-browser'

export default function FishPage() {
  const [species, setSpecies] = useState([])
  const [unlocked, setUnlocked] = useState([])
  const [filter, setFilter] = useState('All Species')
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [user, setUser] = useState(null) // current logged-in user
  const [authEmail, setAuthEmail] = useState('')
  const [authPassword, setAuthPassword] = useState('')
  const [authError, setAuthError] = useState('')

  // Fetch species
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

  // Toggle fish unlocked
  const toggleUnlock = async (speciesId) => {
    if (!user) {
      // For guests, just local state
      if (unlocked.includes(speciesId)) {
        setUnlocked(unlocked.filter((id) => id !== speciesId))
      } else {
        setUnlocked([...unlocked, speciesId])
      }
      return
    }

    const isUnlocked = unlocked.includes(speciesId)
    if (isUnlocked) {
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
  }

  const filteredSpecies = species.filter((fish) => {
    if (filter === 'All Species') return true
    if (!fish.location) return true
    return fish.location === filter
  })

  const progressPercentage = filteredSpecies.length
    ? Math.round((unlocked.length / filteredSpecies.length) * 100)
    : 0

  // Login
  const handleLogin = async () => {
    setAuthError('')
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: authEmail,
      password: authPassword
    })
    if (loginError) {
      setAuthError(loginError.message)
      return
    }
    if (loginData.user) {
      // Ensure user exists in 'users' table
      const { data: existingUser } = await supabase
        .from('users')
        .select('*')
        .eq('id', loginData.user.id)
        .single()

      if (!existingUser) {
        await supabase.from('users').insert({
          id: loginData.user.id,
          email: loginData.user.email
        })
      }
      setUser(loginData.user)
      setAuthEmail('')
      setAuthPassword('')
    }
  }

  // Signup
  const handleSignup = async () => {
    setAuthError('')
    const { data: signupData, error: signupError } = await supabase.auth.signUp({
      email: authEmail,
      password: authPassword
    })
    if (signupError) {
      setAuthError(signupError.message)
      return
    }
    if (signupData.user) {
      // Add user to 'users' table
      await supabase.from('users').insert({
        id: signupData.user.id,
        email: signupData.user.email
      })
      setUser(signupData.user)
      setAuthEmail('')
      setAuthPassword('')
    }
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-blue-500 via-cyan-400 to-white p-4">
      {/* Page Title */}
      <h1 className="sticky-title text-white text-4xl md:text-5xl font-bold lowercase mb-6">
        reefspotter
      </h1>

      {/* Sticky Buttons + Filter */}
      <div className="sticky-button-container">
        <button
          onClick={() => setIsProfileOpen(!isProfileOpen)}
          className="sticky-button"
        >
          👤
        </button>
        <button
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          className="sticky-button"
        >
          🐟
        </button>

        {isFilterOpen && (
          <div className="filter-bubble">
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
      </div>

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
            <h2 className="text-black text-2xl font-bold mb-4">User Profile</h2>

            {user ? (
              <>
                <p className="text-black mb-2">Email: {user.email}</p>
                <p className="text-black mb-2">Name: {user.user_metadata?.nickname || 'GUEST'}</p>
              </>
            ) : (
              <>
                <input
                  type="email"
                  placeholder="Email"
                  className="w-full p-3 mb-3 rounded-full border-2 border-black text-black"
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                />
                <input
                  type="password"
                  placeholder="Password"
                  className="w-full p-3 mb-3 rounded-full border-2 border-black text-black"
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                />
                {authError && <p className="text-red-600 mb-3">{authError}</p>}
                <div className="flex gap-2 mb-3">
                  <button
                    onClick={handleLogin}
                    className="w-1/2 p-3 rounded-full bg-green-500 text-white font-bold"
                  >
                    LOGIN
                  </button>
                  <button
                    onClick={handleSignup}
                    className="w-1/2 p-3 rounded-full bg-blue-500 text-white font-bold"
                  >
                    SIGNUP
                  </button>
                </div>
              </>
            )}

            <button
              onClick={() => setIsProfileOpen(false)}
              className="close-btn p-3 rounded-full bg-red-500 text-white w-full font-bold"
            >
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
