'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase-browser'
import { useRouter } from 'next/navigation'

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
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [filter, setFilter] = useState<string>('All Species')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const router = useRouter()

  // Get current logged-in user
  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUser({
          id: user.id,
          email: user.email || null,
          user_metadata: {
            full_name: user.user_metadata?.full_name || '',
            nickname: user.user_metadata?.nickname || '',
            favourite_fish: user.user_metadata?.favourite_fish || '',
            location: user.user_metadata?.location || '',
            profile_image: user.user_metadata?.profile_image || ''
          }
        })
      } else {
        router.push('/login')
      }
    }
    fetchUser()
  }, [router])

  // Fetch all species
  useEffect(() => {
    const fetchSpecies = async () => {
      const { data } = await supabase.from('species').select('*')
      if (data) setSpecies(data)
    }
    fetchSpecies()
  }, [])

  // Fetch unlocked species
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

  // Filtered species
  const filteredSpecies = species.filter(fish => {
    if (filter === 'All Species') return true
    if (!fish.location) return true
    return fish.location === filter
  })

  const progressPercentage = filteredSpecies.length ? (unlocked.length / filteredSpecies.length) * 100 : 0

  return (
    <div className="relative min-h-screen bg-gray-50">
      {/* Progress Bar */}
      <div className="fixed top-8 left-1/2 transform -translate-x-1/2 w-2/3 md:w-1/2 h-8 bg-gray-300 border border-black rounded-full z-10">
        <div
          className="bg-gradient-to-r from-pink-500 via-yellow-500 to-blue-500 h-full rounded-full transition-all duration-500"
          style={{ width: `${progressPercentage}%` }}
        ></div>
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 text-black font-bold">{Math.round(progressPercentage)}%</div>
      </div>

      {/* Mobile Hamburger */}
      <div className="fixed top-8 right-4 z-20 md:hidden">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-3 bg-white text-black border-2 border-black rounded-full shadow-md"
        >
          🍔
        </button>
      </div>

      {/* Mobile Dropdown */}
      {isMobileMenuOpen && (
        <div className="fixed top-16 right-4 bg-white border-2 border-black rounded-md z-20 p-3">
          <select
            value={filter}
            onChange={e => setFilter(e.target.value)}
            className="p-3 bg-white text-black border-2 border-black rounded-full shadow-md cursor-pointer"
          >
            <option value="All Species">All Species</option>
            <option value="GBR">Great Barrier Reef (GBR)</option>
            <option value="GSR">Great Southern Reef (GSR)</option>
          </select>
        </div>
      )}

      {/* Desktop Dropdown */}
      <div className="hidden md:flex fixed top-8 right-4 z-20">
        <select
          value={filter}
          onChange={e => setFilter(e.target.value)}
          className="p-3 bg-white text-black border-2 border-black rounded-full shadow-md cursor-pointer"
        >
          <option value="All Species">All Species</option>
          <option value="GBR">Great Barrier Reef (GBR)</option>
          <option value="GSR">Great Southern Reef (GSR)</option>
        </select>
      </div>

      {/* Profile Modal Button */}
      <div className="fixed top-8 left-4 z-20">
        <button
          onClick={() => setIsProfileOpen(!isProfileOpen)}
          className="p-3 bg-white text-black border-2 border-black rounded-full shadow-md"
        >
          👤
        </button>
      </div>

      {/* Profile Modal */}
      {isProfileOpen && user && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-30">
          <div className="bg-white p-8 rounded-lg w-11/12 md:w-1/3">
            <h2 className="text-2xl font-bold mb-4">User Profile</h2>
            <p className="mb-2">Email: {user.email}</p>
            <p className="mb-2">Name: {user.user_metadata.nickname}</p>
            <button
              onClick={() => setIsProfileOpen(false)}
              className="mt-4 px-4 py-2 bg-red-500 text-white rounded-md"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Species Cards */}
      <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-6 mt-24">
        {filteredSpecies
          .sort((a, b) => a.name.localeCompare(b.name))
          .map(fish => {
            const isUnlocked = unlocked.includes(fish.id)
            return (
              <div
                key={fish.id}
                onClick={() => toggleUnlock(fish.id)}
                className={`cursor-pointer border rounded-2xl p-4 flex flex-col items-center transition-all duration-300
                  ${isUnlocked ? 'bg-white text-black scale-100' : 'bg-black text-white scale-90'}
                `}
              >
                <img
                  src={fish.image_url}
                  alt={fish.name}
                  className={`w-full aspect-square object-cover mb-2 rounded-2xl transition-all duration-300 
                    ${isUnlocked ? 'filter-none' : 'grayscale'}
                    ${isUnlocked ? 'scale-100' : 'scale-90'}
                  `}
                />
                <h2 className="font-bold text-center">{fish.name}</h2>
                <p className="text-sm italic text-center">{fish.scientific_name}</p>
              </div>
            )
          })}
      </div>
    </div>
  )
}
