'use client'

import { useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabase-browser'
import { Search } from 'lucide-react'

export default function FishPage() {
  const [species, setSpecies] = useState([])
  const [unlocked, setUnlocked] = useState([])
  const [filter, setFilter] = useState('All Species')
  const [searchTerm, setSearchTerm] = useState('')
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

  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')
  const letterRefs = useRef({})
  const [activeLetter, setActiveLetter] = useState(null)

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

  const filteredSpecies = species
    .filter((fish) => {
      if (filter === 'All Species') return true
      if (!fish.location) return true
      return fish.location === filter
    })
    .filter((fish) => {
      const term = searchTerm.toLowerCase()
      return (
        fish.name.toLowerCase().includes(term) ||
        fish.scientific_name?.toLowerCase().includes(term) ||
        fish.description?.toLowerCase().includes(term)
      )
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
      .update({ nickname, favorite_fish: favoriteFish, location, bio })
      .eq('id', user.id)
  }

  const scrollToLetter = (letter) => {
    const ref = letterRefs.current[letter]
    if (ref) {
      ref.scrollIntoView({ behavior: 'smooth', block: 'start' })
      setActiveLetter(letter)
    }
  }

  useEffect(() => {
    const handleScroll = () => {
      let closestLetter = null
      let closestOffset = Infinity
      Object.entries(letterRefs.current).forEach(([letter, el]) => {
        if (!el) return
        const offset = Math.abs(el.getBoundingClientRect().top - 120)
        if (offset < closestOffset) {
          closestOffset = offset
          closestLetter = letter
        }
      })
      if (closestLetter) setActiveLetter(closestLetter)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [species])

  const highlightMatch = (text, query) => {
    if (!query) return text
    const regex = new RegExp(`(${query})`, 'gi')
    return text.split(regex).map((part, i) =>
      regex.test(part) ? (
        <mark key={i} className="bg-yellow-300 text-black rounded px-0.5">{part}</mark>
      ) : (
        part
      )
    )
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-blue-500 via-cyan-400 to-white p-4">
      <h1 className="sticky-title text-white text-4xl md:text-5xl font-bold lowercase mb-6">reefspotter</h1>

      {/* Search bar */}
      <div className="absolute top-4 right-4 w-1/5 min-w-[200px]">
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
          <input
            type="text"
            placeholder="Search species..."
            value={searchTerm}  // ✅ FIXED
            onChange={(e) => setSearchTerm(e.target.value)} // ✅ FIXED
            className="w-full pl-10 pr-4 py-3 rounded-full border border-gray-500 bg-black/40 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
      </div>

      {/* Species Grid */}
      <div className="species-grid mt-8">
        {filteredSpecies.sort((a, b) => a.name.localeCompare(b.name)).map((fish, idx, arr) => {
          const firstLetter = fish.name.charAt(0).toUpperCase()
          const prevFirstLetter = idx > 0 ? arr[idx - 1].name.charAt(0).toUpperCase() : null
          const isUnlocked = unlocked.includes(fish.id)
          return (
            <div key={fish.id} ref={(el) => { if (firstLetter !== prevFirstLetter) letterRefs.current[firstLetter] = el }}>
              <div onClick={() => toggleUnlock(fish.id)} className={`species-card ${isUnlocked ? 'unlocked' : 'locked'}`}>
                <img src={fish.image_url} alt={fish.name} />
                <h2 className="font-bold text-center">{highlightMatch(fish.name, searchTerm)}</h2>
                <p className="text-sm italic text-center">{highlightMatch(fish.scientific_name || '', searchTerm)}</p>
                <p className="text-xs text-center">{highlightMatch(fish.description || '', searchTerm)}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
