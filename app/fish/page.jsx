'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase-browser'

export default function FishPage() {
  const [species, setSpecies] = useState([])
  const [unlocked, setUnlocked] = useState([]) // guest or logged in
  const [filter, setFilter] = useState('All Species')
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [user, setUser] = useState(null) // Supabase user

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [nickname, setNickname] = useState('')

  // Fetch species
  useEffect(() => {
    const fetchSpecies = async () => {
      const { data } = await supabase.from('species').select('*')
      if (data) setSpecies(data)
    }
    fetchSpecies()
  }, [])

  // Fetch unlocked sightings for logged in users
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

  // Toggle unlock for guest or logged in
  const toggleUnlock = async (speciesId) => {
    if (user) {
      // Logged in: sync to DB
      const exists = unlocked.includes(speciesId)
      if (exists) {
        await supabase
          .from('sightings')
          .delete()
          .eq('user_id', user.id)
          .eq('species_id', speciesId)
        setUnlocked(unlocked.filter((id) => id !== speciesId))
      } else {
        await supabase.from('sightings').insert({ user_id: user.id, species_id: speciesId })
        setUnlocked([...unlocked, speciesId])
      }
    } else {
      // Guest
      if (unlocked.includes(speciesId)) {
        setUnlocked(unlocked.filter((id) => id !== speciesId))
      } else {
        setUnlocked([...unlocked, speciesId])
      }
    }
  }

  // Signup
  const handleSignup = async () => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { nickname } },
    })

    if (error) return alert(error.message)
    if (!data.user) return alert('Signup failed')

    setUser(data.user)

    // Sync guest progress
    const sync = unlocked.map(fishId =>
      supabase.from('sightings').insert({ user_id: data.user.id, species_id: fishId })
    )
    await Promise.all(sync)
    alert('Signed up and synced progress!')
  }

  // Login
  const handleLogin = async () => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return alert(error.message)
    if (!data.user) return alert('Login failed')

    setUser(data.user)

    // Sync guest progress
    const existing = await supabase.from('sightings').select('species_id').eq('user_id', data.user.id)
    const existingIds = existing.data.map(d => d.species_id)
    const newIds = unlocked.filter(id => !existingIds.includes(id))

    const sync = newIds.map(fishId =>
      supabase.from('sightings').insert({ user_id: data.user.id, species_id: fishId })
    )
    await Promise.all(sync)
    alert('Logged in and synced progress!')
  }

  // Filtered species
  const filteredSpecies = species.filter(fish => {
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
      <h1 className="sticky-title text-white text-4xl md:text-5xl font-bold lowercase mb-4">
        reefspotter
      </h1>

      {/* Sticky Buttons + Filter */}
      <div className="sticky-button-container">
        <button className="sticky-button" onClick={() => setIsProfileOpen(!isProfileOpen)}>👤</button>
        <button className="sticky-button" onClick={() => setIsFilterOpen(!isFilterOpen)}>🐟</button>

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
        <div className="progress-bar" style={{ width: `${progressPercentage}%` }} />
        <div className="absolute top-0 right-2 text-black font-bold">{progressPercentage}%</div>
      </div>

      {/* Profile Modal */}
      {isProfileOpen && (
        <div className="profile-modal">
          <div className="profile-modal-content">
            <h2>User Profile</h2>
            <input
              className="p-2 border-2 border-black rounded mb-2 w-full"
              placeholder="Nickname"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
            />
            <input
              className="p-2 border-2 border-black rounded mb-2 w-full"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              className="p-2 border-2 border-black rounded mb-4 w-full"
              placeholder="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <div className="flex gap-2">
              <button className="login-btn" onClick={handleLogin}>LOGIN</button>
              <button className="login-btn" onClick={handleSignup}>SIGNUP</button>
            </div>
            <button className="close-btn mt-4" onClick={() => setIsProfileOpen(false)}>Close</button>
          </div>
        </div>
      )}

      {/* Species Cards */}
      <div className="species-grid mt-8">
        {filteredSpecies.sort((a, b) => a.name.localeCompare(b.name)).map(fish => {
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
