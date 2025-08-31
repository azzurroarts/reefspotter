'use client'

import { useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabase-browser'

export default function FishPage() {
  const [species, setSpecies] = useState([])
  const [unlocked, setUnlocked] = useState([])
  const [filter, setFilter] = useState('All Species')
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [user, setUser] = useState(null)
  const [authEmail, setAuthEmail] = useState('')
  const [authPassword, setAuthPassword] = useState('')
  const [authError, setAuthError] = useState('')

  const [nickname, setNickname] = useState('')
  const [favoriteFish, setFavoriteFish] = useState('')
  const [location, setLocation] = useState('')
  const [bio, setBio] = useState('')

  const letterRefs = useRef({})
  const [activeLetter, setActiveLetter] = useState<string | null>(null)

  useEffect(() => {
    const fetchSpecies = async () => {
      const { data } = await supabase.from('species').select('*')
      if (data) setSpecies(data)
    }
    fetchSpecies()
  }, [])

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

  useEffect(() => {
    if (!user) return
    const fetchProfile = async () => {
      const { data } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()
      if (data) {
        setNickname(data.nickname || '')
        setFavoriteFish(data.favorite_fish || '')
        setLocation(data.location || '')
        setBio(data.bio || '')
      }
    }
    fetchProfile()
  }, [user, isProfileOpen])

  const toggleUnlock = async (speciesId) => {
    if (!user) {
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

  const handleLogin = async () => {
    setAuthError('')
    const { data: loginData, error } = await supabase.auth.signInWithPassword({
      email: authEmail,
      password: authPassword
    })
    if (error) return setAuthError(error.message)
    if (loginData.user) {
      const { data: existingUser } = await supabase
        .from('users')
        .select('*')
        .eq('id', loginData.user.id)
        .single()
      if (!existingUser) {
        await supabase.from('users').insert({ id: loginData.user.id, email: loginData.user.email })
      }
      setUser(loginData.user)
      setAuthEmail('')
      setAuthPassword('')
    }
  }

  const handleSignup = async () => {
    setAuthError('')
    const { data, error } = await supabase.auth.signUp({
      email: authEmail,
      password: authPassword
    })
    if (error) return setAuthError(error.message)
    if (data.user) {
      await supabase.from('users').insert({ id: data.user.id, email: data.user.email })
      setUser(data.user)
      setAuthEmail('')
      setAuthPassword('')
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setUnlocked([])
  }

  const handleProfileUpdate = async () => {
    if (!user) return
    await supabase
      .from('users')
      .update({
        nickname,
        favorite_fish: favoriteFish,
        location,
        bio
      })
      .eq('id', user.id)
  }

  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

  const scrollToLetter = (letter) => {
    const ref = letterRefs.current[letter]
    if (ref) {
      ref.scrollIntoView({ behavior: 'smooth', block: 'start' })
      setActiveLetter(letter)
    }
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-blue-500 via-cyan-400 to-white p-4">
      <h1 className="sticky-title text-white text-4xl md:text-5xl font-bold lowercase mb-6">reefspotter</h1>

      <div className="sticky-button-container">
        <button onClick={() => setIsProfileOpen(!isProfileOpen)} className="sticky-button">👤</button>
        <button onClick={() => setIsFilterOpen(!isFilterOpen)} className="sticky-button">🐟</button>

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

      <div className="progress-container mt-4 relative">
        <div className="progress-bar bg-gradient-to-r from-pink-500 via-yellow-500 to-blue-500"
             style={{ width: `${progressPercentage}%` }} />
        <div className="absolute top-0 right-2 text-black font-bold">{progressPercentage}%</div>
      </div>

      {/* Profile Modal */}
      {isProfileOpen && (
        <div className="profile-modal">
          <div className="profile-modal-content">
            <h2 className="text-black text-2xl font-bold mb-4">User Profile</h2>

            {user ? (
              <>
                <input type="text" placeholder="Nickname" value={nickname} onChange={(e) => setNickname(e.target.value)}
                       className="w-full p-3 mb-3 rounded-full border-2 border-black text-black" />
                <input type="text" placeholder="Fave Fish" value={favoriteFish} onChange={(e) => setFavoriteFish(e.target.value)}
                       className="w-full p-3 mb-3 rounded-full border-2 border-black text-black" />
                <input type="text" placeholder="Location" value={location} onChange={(e) => setLocation(e.target.value)}
                       className="w-full p-3 mb-3 rounded-full border-2 border-black text-black" />
                <textarea placeholder="Bio" value={bio} onChange={(e) => setBio(e.target.value)}
                          className="w-full p-3 mb-3 rounded-xl border-2 border-black text-black" />

                <div className="flex gap-2 mb-3">
                  <button onClick={handleProfileUpdate} className="w-1/2 p-3 rounded-full bg-green-500 text-white font-bold">Save</button>
                  <button onClick={handleLogout} className="w-1/2 p-3 rounded-full bg-red-500 text-white font-bold">Logout</button>
                </div>
              </>
            ) : (
              <>
                <input type="email" placeholder="Email" value={authEmail} onChange={(e) => setAuthEmail(e.target.value)}
                       className="w-full p-3 mb-3 rounded-full border-2 border-black text-black" />
                <input type="password" placeholder="Password" value={authPassword} onChange={(e) => setAuthPassword(e.target.value)}
                       className="w-full p-3 mb-3 rounded-full border-2 border-black text-black" />
                {authError && <p className="text-red-600 mb-3">{authError}</p>}
                <div className="flex gap-2 mb-3">
                  <button onClick={handleLogin} className="w-1/2 p-3 rounded-full bg-green-500 text-white font-bold">LOGIN</button>
                  <button onClick={handleSignup} className="w-1/2 p-3 rounded-full bg-blue-500 text-white font-bold">SIGNUP</button>
                </div>
              </>
            )}

            <button onClick={() => setIsProfileOpen(false)} className="close-btn p-3 rounded-full bg-gray-700 text-white w-full font-bold">Close</button>
          </div>
        </div>
      )}

      {/* Species Cards */}
      <div className="species-grid mt-8">
        {filteredSpecies
          .sort((a, b) => a.name.localeCompare(b.name))
          .map((fish, idx, arr) => {
            const firstLetter = fish.name.charAt(0).toUpperCase()
            const prevFirstLetter = idx > 0 ? arr[idx - 1].name.charAt(0).toUpperCase() : null
            const isUnlocked = unlocked.includes(fish.id)

            return (
              <div key={fish.id} ref={(el) => {
                if (firstLetter !== prevFirstLetter) letterRefs.current[firstLetter] = el
              }}>
                <div onClick={() => toggleUnlock(fish.id)}
                     className={`species-card ${isUnlocked ? 'unlocked' : 'locked'}`}>
                  <img src={fish.image_url} alt={fish.name} />
                  <h2 className="font-bold text-center">{fish.name}</h2>
                  <p className="text-sm italic text-center">{fish.scientific_name}</p>
                </div>
              </div>
            )
          })}
      </div>

      {/* Alphabet Sidebar */}
      <div className="vertical-alphabet">
        {alphabet.map((letter) => (
          <span
            key={letter}
            onClick={() => scrollToLetter(letter)}
            className={activeLetter === letter ? 'active' : ''}
          >
            {letter}
          </span>
        ))}
      </div>
    </div>
  )
}
