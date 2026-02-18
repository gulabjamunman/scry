import { supabase } from "./supabase";

import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import type { User } from "@supabase/supabase-js";


// ========================
// AUTH CONTEXT TYPE
// ========================

type AuthContextType = {
  user: User | null;
  loading: boolean;
};


// ========================
// CREATE CONTEXT
// ========================

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
});


// ========================
// AUTH PROVIDER
// ========================

export function AuthProvider({ children }: { children: ReactNode }) {

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    // Get current user on load
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };

  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}


// ========================
// USE AUTH HOOK
// ========================

export function useAuth() {
  return useContext(AuthContext);
}


// ========================
// SIGN IN
// ========================

export async function signIn(email: string, password: string) {

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error("Sign in error:", error.message);
    throw error;
  }

  return data.user;
}


// ========================
// SIGN UP
// ========================

export async function signUp(email: string, password: string, name: string) {

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    console.error("Sign up error:", error.message);
    throw error;
  }

  if (data.user) {

    await supabase
      .from("reviewers")
      .insert({
        id: data.user.id,
        email: email,
        name: name,
      });

  }

  return data.user;
}


// ========================
// SIGN OUT
// ========================

export async function signOut() {
  await supabase.auth.signOut();
}


// ========================
// GET CURRENT USER
// ========================

export async function getCurrentUser() {

  const { data } = await supabase.auth.getUser();

  return data.user;
}
