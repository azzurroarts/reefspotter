'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase-browser'
import { useRouter } from 'next/navigation'

/* Local user shape — we map Supabase's user into this to avoid TS mismatches */
type LocalUser = {
  id: string
  email: string | null
  user_metadata: {
    full_name: string | null
    nickname: string | null
    favourite_fish: string | null
    location: string | null
    profile_image: string | null
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
  const [user, setUser] = useState<LocalUser | null>(null) // now LocalUser
  const [filter, setFilter] = useState<string>('All Species')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [userName, setUserName] = useState<string | null>(null)
  const router = useRouter()

  // Fetch current logged-in user and map to LocalUser to avoid TS mismatch
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data, error } = await supabase.auth.getUser()
        if (error) {
          console.error('getUser error:', error)
          router.push('/login')
          return
        }

        const sUser = data?.user ?? null
        if (sUser) {
          const mapped: LocalUser = {
            id: sUser.id,
            email: sUser.email ?? null,
            user_metadata: {
              full_name: sUser.user_metadata?.full_name ?? null,
              nickname: sUser.user_metadata?.nickname ?? null,
              favourite_fish: sUser.user_metadata?.favourite_fish ?? null,
              location: sUser.user_metadata?.location ?? null,
              profile_image: sUser.user_metadata?.profile_image ?? null,
            },
          }
          setUser(mapped)
          setUserEmail(mapped.email)
          setUserName(mapped.user_metadata.full_name)
        } else {
          router.push('/login')
        }
      } catch (err) {
        console.error('Unexpected error fetching user:', err)
        router.push('/login')
      }
    }

    fetchUser()
  }, [router])

  // Fetch all species
  useEffect(() => {
    const fetchSpecies = async () => {
      try {
        const { data, error } = await supabase.from('species').select('*')
        if (error) {
          console.error('fetchSpecies error:', error)
          return
        }
        if (data) setSpecies(data as Species[])
      } catch (err) {
        console.error('Unexpected fetchSpecies error:', err)
      }
    }
    fetchSpecies()
  }, [])

  // Fetch unlocked species for current user
  useEffect(() => {
    if (!user) return
    const fetchUnlocked = async () => {
      try {
        const { data, error } = await supabase
          .from('sightings')
          .select('species_id')
          .eq('user_id', user.id)
        if (error) {
          console.error('fetchUnlocked error:', error)
          return
        }
        if (data) {
          // data likely an array of objects like { species_id: number }
          setUnlocked((data as any[]).map((d) => d.species_id))
        }
      } catch (err) {
        console.error('Unexpected fetchUnlocked error:', err)
      }
    }
    fetchUnlocked()
  }, [user])

  const toggleUnlock = async (speciesId: number) => {
    if (!user) return

    try {
      if (unlocked.includes(speciesId)) {
        const { error } = await supabase
          .from('sightings')
          .delete()
          .eq('user_id', user.id)
          .eq('species_id', speciesId)
        if (error) {
          console.error('delete sighting error:', error)
        } else {
          setUnlocked((prev) => prev.filter((id) => id !== speciesId))
        }
      } else {
        const { error } = await supabase
          .from('sightings')
          .insert({ user_id: user.id, species_id: speciesId })
        if (error) {
          console.error('insert sighting error:', error)
        } else {
          setUnlocked((prev) => [...prev, speciesId])
        }
      }
    } catch (err) {
      console.error('toggleUnlock unexpected error:', err)
    }
  }

  // Filter species based on location
  const filteredSpecies = species.filter((fish) => {
    if (filter === 'All Species') return true
    if (fish.location === null) return true // Show species with NULL location in both filters
    return fish.location === filter
  })

  // guard against division by zero
  const progressPercentage = filteredSpecies.length ? (unlocked.length / filteredSpecies.length) * 100 : 0

  return (
    <div className="relative">
      {/* Progress Bar */}
      <div className="fixed top-10 left-1/3 w-1/3 md:w-1/4 h-10 bg-gray-300 border border-black rounded-xl z-10">
        <div
          className="bg-gradient-to-r from-pink-500 via-yellow-500 to-blue-500 h-full rounded-xl"
          style={{
            width: `${progressPercentage}%`,
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
          🐠
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
      {isProfileOpen && user && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-30">
          <div className="bg-white p-8 rounded-lg w-1/3">
            <h2 className="text-2xl font-bold mb-4">User Profile</h2>
            <p className="mb-2">Email: {user.email ?? 'No email'}</p>
            <p className="mb-2">Name: {user.user_metadata?.nickname ?? 'Unknown'}</p>
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
          .map((fish) => {
            const isUnlocked = unlocked.includes(fish.id)
            return (
              <div
                key={fish.id}
                onClick={() => toggleUnlock(fish.id)}
                className={`cursor-pointer border rounded p-4 flex flex-col items-center transition-all duration-300
                  ${isUnlocked ? 'bg-white text-black scale-100' : 'bg-black text-white scale-90'}
                `}
              >
                <img
                  src={fish.image_url}
                  alt={fish.name}
                  className={`w-full aspect-square object-cover mb-2 transition-all duration-300 
                    ${isUnlocked ? 'filter-none scale-100' : 'grayscale scale-90'}
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
