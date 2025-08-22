'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase-browser'
import { useRouter } from 'next/navigation'

type Species = {
  id: number
  name: string
  scientific_name: string
  image_url: string
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
      <div className="fixed top-10 left-1/4 w-1/2 h-3 bg-gray-700 rounded-lg">
        <div
          className="h-full bg-gradient-to-r from-pink-300 to-indigo-400"
          style={{ width: `${(unlocked.length / species.length) * 100}%` }}
        />
      </div>

      {/* Species Cards */}
      <div className="p-4 grid grid-cols-4 gap-4 mt-20">
        {species
          .sort((a, b) => a.name.localeCompare(b.name))
          .map(fish => {
            const isUnlocked = unlocked.includes(fish.id)
            return (
              <div
                key={fish.id}
                onClick={() => toggleUnlock(fish.id)}
                className={`relative cursor-pointer bg-black border rounded-lg p-2 flex flex-col items-center transition-all duration-300 ${isUnlocked ? 'bg-white' : 'bg-opacity-30'}`}
              >
                <div className="relative w-full aspect-square">
                  {/* Fish Image */}
                  <img
                    src={fish.image_url}
                    alt={fish.name}
                    className={`w-full h-full object-cover transition-all duration-300 ${isUnlocked ? 'scale-100' : 'scale-90 grayscale'}`}
                  />
                </div>
                {/* Name and Scientific Name */}
                <h2 className="font-bold text-center text-black">{fish.name}</h2>
                <p className="text-sm italic text-center text-black">{fish.scientific_name}</p>
              </div>
            )
          })}
      </div>
    </div>
  )
}
