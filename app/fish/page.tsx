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
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const router = useRouter()

  // Get current logged-in user
  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) setUserId(user.id)
      else router.push('/login')
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

  // Fetch unlocked species
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
    <div className="relative min-h-screen bg-black text-white">
      {/* Hamburger */}
      <button
        className="fixed top-4 left-4 z-50 p-2 bg-white text-black rounded-md"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        ☰
      </button>

      {/* Sidebar Skeleton */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-gray-900 text-white p-4 z-40 transform transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <h2 className="font-bold text-xl mb-4">Collector's Sidebar</h2>
        <p className="text-sm">Progress / Stats / Achievements</p>
      </div>

      {/* Fish Grid */}
      <div className={`p-4 grid gap-4 transition-all duration-300 ${sidebarOpen ? 'grid-cols-3 ml-64' : 'grid-cols-4'}`}>
        {species
          .sort((a, b) => a.name.localeCompare(b.name))
          .map(fish => {
            const isUnlocked = unlocked.includes(fish.id)
            return (
              <div
                key={fish.id}
                onClick={() => toggleUnlock(fish.id)}
                className={`cursor-pointer bg-white border rounded p-2 flex flex-col items-center transition-all duration-300 ${
                  isUnlocked ? 'bg-opacity-100 text-black' : 'bg-opacity-30 text-white'
                }`}
              >
                <img
                  src={fish.image_url}
                  alt={fish.name}
                  className={`w-full aspect-square object-cover mb-2 transition-transform duration-300 ${
                    isUnlocked ? 'scale-100' : 'scale-90 grayscale'
                  }`}
                />
                <h2 className="font-bold text-center text-black">{fish.name}</h2>
                <p className="text-sm italic text-center text-black">{fish.scientific_name}</p>
              </div>
            )
          })}
      </div>
    </div>
  )
}
