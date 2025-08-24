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

type User = {
  id: string
  email: string
  user_metadata: {
    full_name: string
    nickname: string
    favourite_fish: string
    location: string
    profile_image: string
  }
}

export default function FishPage() {
  const [species, setSpecies] = useState<Species[]>([])
  const [unlocked, setUnlocked] = useState<number[]>([])
  const [user, setUser] = useState<User | null>(null)
  const [showProfile, setShowProfile] = useState(false)
  const router = useRouter()

  // Fetch current logged-in user
  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUser(user)
      } else {
        router.push('/login') // Redirect to login if no user
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

  // Fetch unlocked species for the current user
  useEffect(() => {
    if (!user) return
    const fetchUnlocked = async () => {
      const { data } = await supabase.from('sightings').select('species_id').eq('user_id', user.id)
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

  const progressPercentage = (unlocked.length / species.length) * 100

  return (
    <div className="relative">
      {/* Profile Icon */}
      <div
        className="profile-icon cursor-pointer absolute top-2 left-2 rounded-full"
        onClick={() => setShowProfile(true)}
      >
        <img
          src={user?.user_metadata?.profile_image || '/default-avatar.jpg'}
          alt="Profile"
          className="w-10 h-10 rounded-full"
        />
      </div>

      {/* Profile Popup */}
      {showProfile && (
        <div className="profile-popup fixed top-1/4 left-1/4 bg-white p-6 rounded-lg shadow-lg z-20">
          <button onClick={() => setShowProfile(false)} className="close-btn">X</button>
          <h2>{user?.user_metadata?.nickname}</h2>
          <p>Favourite Fish: {user?.user_metadata?.favourite_fish}</p>
          <p>Location: {user?.user_metadata?.location}</p>
        </div>
      )}

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
              </div>
            )
          })}
      </div>
    </div>
  )
}
