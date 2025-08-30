'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase-browser'
import { useRouter } from 'next/navigation'
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'
import InfiniteScroll from 'react-infinite-scroll-component'
import Image from 'next/image'

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
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(1)
  const speciesPerPage = 20
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

  // Fetch unlocked species for current user
  useEffect(() => {
    if (!userId) return
    const fetchUnlocked = async () => {
      const { data } = await supabase.from('user_sightings').select('species_id').eq('user_id', userId)
      if (data) setUnlocked(data.map(d => d.species_id))
    }
    fetchUnlocked()
  }, [userId])

  // Fetch species with pagination
  const fetchMoreSpecies = async () => {
    const { data } = await supabase
      .from('species')
      .select('*')
      .range(page * speciesPerPage, (page + 1) * speciesPerPage - 1)

    if (data) {
      setSpecies(prev => [...prev, ...data])
      setPage(prev => prev + 1)
    }

    if (data && data.length < speciesPerPage) setHasMore(false)
  }

  // Toggle species unlocked status
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
    <InfiniteScroll
      dataLength={species.length}
      next={fetchMoreSpecies}
      hasMore={hasMore}
      loader={<div>Loading...</div>}
      endMessage={<div>No more species</div>}
    >
      <div className="p-4 grid grid-cols-4 gap-4">
        {species.map(fish => {
          const isUnlocked = unlocked.includes(fish.id)
          return (
            <div
              key={fish.id}
              onClick={() => toggleUnlock(fish.id)}
              className={`cursor-pointer bg-white border rounded p-2 flex flex-col items-center transition-all duration-300 ${isUnlocked ? 'bg-opacity-100' : 'bg-opacity-30'}`}
            >
              {/* Skeleton if not unlocked */}
              {!isUnlocked ? (
                <Skeleton height={200} width="100%" />
              ) : (
                <Image
                  src={fish.image_url}
                  alt={fish.name}
                  width={500}
                  height={500}
                  className={`w-full aspect-square object-cover mb-2 transition-transform duration-300 ${isUnlocked ? 'scale-100' : 'scale-90 grayscale'}`}
                  loading="lazy"
                />
              )}

              <h2 className="font-bold text-center text-black">{fish.name}</h2>
              <p className="text-sm italic text-center text-black">{fish.scientific_name}</p>
              {isUnlocked && <p className="text-xs text-center mt-2 text-black">{fish.description}</p>}
            </div>
          )
        })}
      </div>
    </InfiniteScroll>
  )
}
