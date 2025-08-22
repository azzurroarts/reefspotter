'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase-browser'
import { useRouter } from 'next/navigation'

type Species = {
  id: number
  name: string
  scientific_name: string
  image_url: string
  description: string
}

export default function FishPage() {
  const [species, setSpecies] = useState<Species[]>([])
  const [unlocked, setUnlocked] = useState<number[]>([])
  const [userId, setUserId] = useState<string | null>(null)
  const [loadingUser, setLoadingUser] = useState(true)
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
      const { data } = await supabase.from('user_sightings').select('species_id').eq('user_id', userId)
      if (data) setUnlocked(data.map(d => d.species_id))
    }
    fetchUnlocked()
  }, [userId])

  const toggleUnlock = async (speciesId: number) => {
    if (!userId) return

    if (unlocked.includes(speciesId)) {
      await supabase.from('user_sightings').delete().eq('user_id', userId).eq('species_id', speciesId)
      setUnlocked(unlocked.filter(id => id !== speciesId))
    } else {
      await supabase.from('user_sightings').insert({ user_id: userId, species_id: speciesId })
      setUnlocked([...unlocked, speciesId])
    }
  }

  if (loadingUser) return <p className="text-center mt-10 text-black">Loading user...</p>

  return (
    <div className="relative">
      {/* Progress Bar */}
      <div className="fixed top-10 left-1/3 w-1/3 h-4 bg-gray-300 border border-black rounded-xl z-10">
        <div
          className="bg-gradient-to-r from-pink-500 via-yellow-500 to-blue-500 h-full rounded-xl"
          style={{
            width: `${(unlocked.length / species.length) * 100}%`, // Progress percentage
          }}
        ></div>
      </div>

      {/* Species Cards */}
      <div className="p-4 grid grid-cols-4 gap-4 mt-16">
        {species
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

                {isUnlocked && (
                  <div className="relative">
                    {/* Info Icon */}
                    <span
                      className="cursor-pointer text-xl absolute top-2 right-2 text-blue-500"
                      title="Click for description"
                    >
                      ℹ️
                    </span>

                    {/* Tooltip with description */}
                    <div className="absolute top-0 left-0 w-full h-full bg-white bg-opacity-90 p-4 text-black rounded opacity-0 hover:opacity-100 transition-opacity duration-300">
                      <p className="text-xs text-center mt-2">{fish.description}</p>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
      </div>
    </div>
  )
}
