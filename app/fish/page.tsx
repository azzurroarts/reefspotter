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
    <div className="p-4 grid grid-cols-4 gap-4">
      {species
        .sort((a, b) => a.name.localeCompare(b.name))
        .map(fish => {
          const isUnlocked = unlocked.includes(fish.id)
          return (
            <div
              key={fish.id}
              onClick={() => toggleUnlock(fish.id)}
              className={`cursor-pointer bg-white border rounded p-4 flex flex-col items-center transition-all duration-300 ${isUnlocked ? 'bg-opacity-100 bg-pink-200' : 'bg-opacity-30'} max-w-xs h-[350px]`} // Card background color change
            >
              <div className="w-full h-[200px]"> {/* Fixed height for image */}
                <img
                  src={fish.image_url}
                  alt={fish.name}
                  className={`w-full h-full object-cover transition-all duration-300 ${isUnlocked ? 'scale-100' : 'scale-90 grayscale'}`} // Image color transition (grayscale to full color)
                />
              </div>
              <h2 className="font-bold text-center text-black mt-2">{fish.name}</h2>
              <p className="text-sm italic text-center text-black">{fish.scientific_name}</p>
              {isUnlocked && <p className="text-xs text-center mt-2 text-black">{fish.description}</p>}
            </div>
          )
        })}
    </div>
  )
}
