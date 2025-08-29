'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase-browser'
import { useRouter } from 'next/navigation'

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
  const [userId, setUserId] = useState<string | null>(null)
  const [filter, setFilter] = useState<string>('All Species')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false) // State to toggle mobile menu
  const [isProfileOpen, setIsProfileOpen] = useState(false) // State for profile modal
  const [userEmail, setUserEmail] = useState<string | null>(null) // To store user email
  const [userName, setUserName] = useState<string | null>(null) // To store user name
  const router = useRouter()

  // Get current logged-in user
  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) {
        setUserId(user.id)
        setUserEmail(user.email || null) // handle undefined by setting null if undefined
        setUserName(user.user_metadata.full_name || null) // same for user name
      } else {
        router.push('/login') // redirect if not logged in
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

  // Fetch unlocked species for current user
  useEffect(() => {
    if (!userId) return
    const fetchUnlocked = async () => {
      const { data } = await supabase.from('sightings').select('species_id').eq('user_id', userId)
      if (data) setUnlocked(data.map(d => d.species_id))
    }
    fetchUnlocked()
  }, [userId])

  const toggleUnlock = async (speciesId: number) => {
    if (!userId) return

    if (unlocked.includes(speciesId)) {
      await supabase.from('sightings').delete().eq('user_id', userId).eq('species_id', speciesId)
      setUnlocked(unlocked.filter(id => id !== speciesId))
    } else {
      await supabase.from('sightings').insert({ user_id: userId, species_id: speciesId })
      setUnlocked([...unlocked, speciesId])
    }
  }

  // Filter species based on location
  const filteredSpecies = species.filter((fish) => {
    if (filter === 'All Species') return true
    if (fish.location === null) return true // Show species with NULL location in both filters
    return fish.location === filter
  })

  const progressPercentage = (unlocked.length / filteredSpecies.length) * 100

  return (
    <div className="relative">
      {/* Progress Bar */}
      <div className="fixed top-10 left-1/3 w-1/3 md:w-1/4 h-10 bg-gray-300 border border-black rounded-xl z-10">
        <div
          className="bg-gradient-to-r from-pink-500 via-yellow-500 to-blue-500 h-full rounded-xl"
          style={{
            width: `${progressPercentage}%`, // Progress percentage
          }}
        ></div>
        <div className="absolute top-0 right-2 text-black font-bold">{Math.round(progressPercentage)}%</div>
      </div>

      {/* Mobile Hamburger Icon for Location Filter */}
      <div className="fixed top-10 right-4 z-20 md:hidden">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-3 bg-white text-black border-2 border-black rounded-full shadow-md focus:outline-none"
        >
          🍔
        </button>
      </div>

      {/* Mobile Dropdown */}
      {isMobileMenuOpen && (
        <div className="fixed top-16 right-4 bg-white border-2 border-black rounded-md z-20 p-3">
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
      )}

      {/* Desktop Dropdown */}
      <div className="hidden md:flex fixed top-10 right-4 z-20">
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
        <button
          onClick={() => setIsProfileOpen(!isProfileOpen)}
          className="p-3 bg-white text-black border-2 border-black rounded-full shadow-md focus:outline-none"
        >
          👤
        </button>
      </div>

      {/* Profile Modal */}
      {isProfileOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-30">
          <div className="bg-white p-8 rounded-lg w-1/3">
            <h2 className="text-2xl font-bold mb-4">User Profile</h2>
            <p className="mb-2">Email: {userEmail}</p>
            <p className="mb-2">Name: {userName}</p>
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
      <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-4 mt-16">
        {filteredSpecies
          .sort((a, b) => a.name.localeCompare(b.name))
          .map(fish => {
            const isUnlocked = unlocked.includes(fish.id)
            return (
              <div
                key={fish.id}
                onClick={() => toggleUnlock(fish.id)}
                className={`cursor-pointer border rounded p-4 flex flex-col items-center transition-all duration-300
                  ${isUnlocked ? 'bg-white' : 'bg-black'}
                  ${isUnlocked ? 'text-black' : 'text-white'}
                  ${isUnlocked ? 'scale-100' : 'scale-90'}
                `}
              >
                <img
                  src={fish.image_url}
                  alt={fish.name}
                  className={`w-full aspect-square object-cover mb-2 transition-all duration-300 
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
