import { supabase } from "./supabase"


// ========================
// SIGN IN
// ========================

export async function signIn(email: string, password: string) {

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })

  if (error) {
    console.error("Sign in error:", error.message)
    throw error
  }

  return data.user
}


// ========================
// SIGN UP
// ========================

export async function signUp(email: string, password: string, name: string) {

  const { data, error } = await supabase.auth.signUp({
    email,
    password
  })

  if (error) {
    console.error("Sign up error:", error.message)
    throw error
  }

  // create reviewer profile row
  if (data.user) {

    await supabase
      .from("reviewers")
      .insert({
        id: data.user.id,
        email: email,
        name: name
      })

  }

  return data.user
}


// ========================
// SIGN OUT
// ========================

export async function signOut() {

  await supabase.auth.signOut()

}


// ========================
// GET CURRENT USER
// ========================

export async function getCurrentUser() {

  const { data } = await supabase.auth.getUser()

  return data.user

}
