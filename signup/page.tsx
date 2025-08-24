const handleSignUp = async (e: React.FormEvent) => {
  e.preventDefault()

  // Create user
  const { data: userData, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
  })
type User = {
  id: string;
  email: string;
  user_metadata: {
    full_name: string;
    nickname: string;
    favourite_fish: string;
    location: string;
    profile_image: string;
  };
};

  if (signUpError) {
    console.error(signUpError.message)
  } else {
    // Generate random profile image URL
    const profile_image = `https://csmqqtenglpbdgfobdsi.supabase.co/storage/v1/object/public/species-images/${Math.floor(Math.random() * 5) + 1}.jpg`

    // Store additional user data in the 'users' table
    await supabase.from('users').upsert([
      {
        id: userData.user.id,  // Correct reference to userData
        email,
        name,
        favorite_fish: favoriteFish,
        location,
        bio,
        profile_image  // Include profile image URL
      }
    ])
    
    // Redirect after successful sign up
    router.push('/fish') // Redirect to fish page after successful sign up
  }
}
