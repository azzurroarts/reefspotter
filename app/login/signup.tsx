const handleSignUp = async (e: React.FormEvent) => {
  e.preventDefault()

  // Create user
  const { data: userData, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
  })

  if (signUpError) {
    console.error(signUpError.message)
  } else {
    // Generate random profile image URL
    const profile_image = `https://csmqqtenglpbdgfobdsi.supabase.co/storage/v1/object/public/species-images/${Math.floor(Math.random() * 5) + 1}.jpg`;

await supabase.from('users').upsert([
  {
    id: userData.user.id, 
    email,
    name,
    favorite_fish: favoriteFish,
    location,
    bio,
    profile_image,  // Handle profile_image (this value can be dynamic or default)
  }
])
if (signUpError) {
  console.error("Sign-up error:", signUpError.message);  // Logs the exact error
}

    
    // Redirect after successful sign up
    router.push('/fish') // Redirect to fish page after successful sign up
  }
}
