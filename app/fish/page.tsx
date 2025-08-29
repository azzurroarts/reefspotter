'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase-browser'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

type Species = {
  id: number
  name: string
  scientific_name: string
  image_url: string
}

type UserType = {
  id: string
  email: string
  user_metadata?: {
    full_name?: string
    nickname?: string
    favourite_fish?: string
    location?: string
    profile_image?: string
  }
}

export default function FishPage() {
  const [species, setSpecies] = useState<Species[]>([])
  const [unlocked, setUnlocked] = useState<number[]>([])
  const [user, setUser] = useState<UserType | null>(null)
  const [showProfile, setShowProfile] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) setUser(user)
      else router.push('/login')
    }
    fetchUser()
  }, [router])

  useEffect(() => {
    const fetchSpecies = async () => {
      const { data } = await supabase.from('species').select('*')
      if (data) setSpecies(data)
    }
    fetchSpecies()
  }, [])

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
      await supabase.from('sightings').insert({ user_id: user.id, species_id })
      setUnlocked([...unlocked, speciesId])
    }
  }

  const progressPercentage = species.length ? (unlocked.length / species.length) * 100 : 0

  return (
    <div className="relative p-4">
      {/* Profile Icon */}
      <div
        className="profile-icon cursor-pointer absolute top-2 left-2 rounded-full"
        onClick={() => setShowProfile(true)}
      >
        <Image
          src={user?.user_metadata?.profile_image ?? '/default-avatar.jpg'}
          alt="Profile"
          width={40}
          height={40}
          className="rounded-full"
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
          style={{ width: `${progressPercentage}%` }}
        ></div>
        <div className="absolute top-0 right-2 text-black font-bold">{Math.round(progressPercentage)}%</div>
      </div>

      {/* Species Cards */}
      <div className="grid grid-cols-4 gap-4 mt-16">
        {species
          .sort((a, b) => a.name.localeCompare(b.name))
          .map(fish => {
            const isUnlocked = unlocked.includes(fish.id)
            return (
              <div
                key={fish.id}
                onClick={() => toggleUnlock(fish.id)}
                className={`cursor-pointer border rounded p-4 flex flex-col items-center transition-all duration-300
                  ${isUnlocked ? 'bg-white text-black scale-100' : 'bg-black text-white scale-90'}`}
              >
                <Image
                  src={fish.image_url}
                  alt={fish.name}
                  width={200}
                  height={200}
                  className={`${isUnlocked ? 'filter-none' : 'grayscale'} transition-all duration-300`}
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
