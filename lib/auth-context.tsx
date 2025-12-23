"use client"

import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from './supabase'
import type { User } from '@supabase/supabase-js'

interface AuthUser extends User {
  role?: 'admin' | 'closer' | 'setter'
  closerId?: string
  setterId?: string
}

interface AuthContextType {
  user: AuthUser | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, name: string, role: 'admin' | 'closer' | 'setter') => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchUserRole(session.user)
      } else {
        setLoading(false)
      }
    }).catch((error) => {
      console.error('Error getting session:', error)
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        fetchUserRole(session.user)
      } else {
        setUser(null)
        setLoading(false)
      }
    })

    return () => {
      try {
        subscription.unsubscribe()
      } catch (error) {
        console.error('Error unsubscribing:', error)
      }
    }
  }, [])

  const fetchUserRole = async (authUser: User) => {
    try {
      // Fetch user role via API route (bypasses RLS)
      const response = await fetch('/api/user-role', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: authUser.email }),
      })

      if (!response.ok) {
        console.error('Error fetching user role:', response.statusText)
        setUser(authUser as AuthUser)
        setLoading(false)
        return
      }

      const data = await response.json()

      if (!data.role) {
        // User exists in auth but has no role assigned yet
        setUser(authUser as AuthUser)
        setLoading(false)
        return
      }

      setUser({
        ...authUser,
        role: data.role,
        closerId: data.closerId,
        setterId: data.setterId
      })
    } catch (error) {
      console.error('Error in fetchUserRole:', error)
      setUser(authUser as AuthUser)
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
  }

  const signUp = async (rawEmail: string, password: string, name: string, role: 'admin' | 'closer' | 'setter') => {
    // Normalize email to lowercase
    const email = rawEmail.toLowerCase().trim()

    // Create auth user
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })
    if (error) throw error

    if (data.user) {
      // Create user record in users table
      const { error: userError } = await supabase
        .from('users')
        .insert({
          email,
          name,
          role
        })

      if (userError) throw userError

      // If closer, create closer record
      if (role === 'closer') {
        await supabase.from('closers').insert({ name, email })
      }
      // If setter, create setter record
      else if (role === 'setter') {
        await supabase.from('setters').insert({ name, email })
      }
    }
  }

  const signOut = async () => {
    // Clear user state first to prevent redirects
    setUser(null)

    try {
      await supabase.auth.signOut({ scope: 'local' })
    } catch (error) {
      console.error('Error during signOut:', error)
      // Clear Supabase storage manually if signOut fails
      if (typeof window !== 'undefined') {
        localStorage.removeItem('sb-tavxhyiuxzvvjylhedir-auth-token')
        // Clear any other supabase keys
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith('sb-')) {
            localStorage.removeItem(key)
          }
        })
      }
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
