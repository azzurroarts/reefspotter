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
  const [loadingUser, setLoadingUser] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const router = useRouter()

  // Get logged-in user
  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) setUserId(user.id)
      else router.push('/login')
      setLoadingUser(false)
    }
    fetchUser()
  }, [router])

  // Fetch species
  useEffect(() => {
    const fetchSpecies = async () => {
      const { data } = await supabase.from('species').select('*')
      if (data) setSpecies(data)
    }
    fetchSpecies()
  }, [])

  if (loadingUser) return <p className="text-center mt-10 text-black">Loading user...</p>

  return (
    <div className="p-4 grid grid-cols-4 gap-4">
      {species.map(fish => (
        <div key={fish.id} className="cursor-pointer border rounded p-4 flex flex-col items-center bg-white">
          <img src={fish.image_url} alt={fish.name} className="w-full aspect-square object-cover mb-2" />
          <h2 className="font-bold text-center text-black">{fish.name}</h2>
          <p className="text-sm italic text-center text-black">{fish.scientific_name}</p>
        </div>
      ))}
    </div>
  )
}
