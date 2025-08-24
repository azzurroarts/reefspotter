'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase-browser'
import { useRouter } from 'next/navigation'

type Species = {
  id: number
  name: string
  scientific_name: string
  image_url: string
  location: string | null // Allow NULL for missing location
}

export default function FishPage() {
  const [species, setSpecies] = useState<Species[]>([])
  const [unlocked, setUnlocked] = useState<number[]>([])
  const [userId, setUserId] = useState<string | null>(null)
  const [loadingUser, setLoadingUser] = useState(true)
  const [filter, setFilter] = useState('') // Filter state (GBR, GSR, All Species)
  const router = useRouter()

  // Get current logged-in user
  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) setUserId(user.id)
      else router.push('/login') // redirect if not logged in
      setLoadingUser(false)
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

  // Filter species by location, including NULL as both GBR and GSR
  const filteredSpecies = species.filter(fish => {
    if (filter === '') return true // No filter (All Species)
    if (filter === 'All Species') return true // Include all species
    if (fish.location === null) return true // Include NULL location in both GBR and GSR
    return fish.location === filter
  })

  if (loadingUser) return <p className="text-center mt-10 text-black">Loading user...</p>

  const progressPercentage = (unlocked.length / species.length) * 100

  return (
    <div className="relative">
      {/* Progress Bar */}
      <div className="fixed top-10 left-1/3 w-1/3 h-8 bg-gray-300 border border-black rounded-xl z-10">
        <div
          className="bg-gradient-to-r from-pink-500 via-yellow-500 to-blue-500 h-full rounded-xl"
          style={{
            width: `${progressPercentage}%`, // Progress percentage
          }}
        ></div>
        <div className="absolute top-0 right-2 text-black font-bold">{Math.round(progressPercentage)}%</div>
      </div>

      {/* Filter Dropdown - Positioned at top-right and fixed */}
      <div className="fixed top-10 right-4 z-20">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="p-2 border rounded-full bg-white shadow-md focus:outline-none focus:ring-2 focus:ring-pink-500"
        >
          <option value="All Species">All Species</option>
          <option value="GBR">Great Barrier Reef (GBR)</option>
          <option value="GSR">Great Southern Reef (GSR)</option>
        </select>
      </div>

      {/* Species Cards */}
      <div className="p-4 grid grid-cols-4 gap-4 mt-16">
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
