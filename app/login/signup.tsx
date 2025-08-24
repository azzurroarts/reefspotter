'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase-browser'
import { useRouter } from 'next/navigation'

const SignUpPage = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [favoriteFish, setFavoriteFish] = useState('')
  const [location, setLocation] = useState('')
  const [bio, setBio] = useState('')
  const router = useRouter()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()

    // Basic form validation
    if (!email || !password || !name || !favoriteFish || !location) {
      console.error("All fields are required.")
      return
    }

    // Create user
    const { data: userData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    })

    if (signUpError) {
      console.error("Sign-up error:", signUpError.message)
      return
    }

    // After successful sign-up, handle inserting metadata into users table
    const profile_image = `https://csmqqtenglpbdgfobdsi.supabase.co/storage/v1/object/public/species-images/${Math.floor(Math.random() * 5) + 1}.jpg`

    const { error: upsertError } = await supabase.from('users').upsert([
      {
        id: userData.user.id,
        email: userData.user.email || null,  // Handle optional email
        name,
        favorite_fish: favoriteFish,
        location,
        bio,
        profile_image,
      }
    ])

    if (upsertError) {
      console.error("Error inserting user metadata:", upsertError.message)
    }

    router.push('/fish') // Redirect to fish page after successful sign-up
  }

  return (
    <div className="signup-container">
      <h1>Sign Up</h1>
      <form onSubmit={handleSignUp}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="text"
          placeholder="Favorite Fish"
          value={favoriteFish}
          onChange={(e) => setFavoriteFish(e.target.value)}
        />
        <input
          type="text"
          placeholder="Location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
        <textarea
          placeholder="Bio"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
        />
        <button type="submit">Sign Up</button>
      </form>
    </div>
  )
}

export default SignUpPage
