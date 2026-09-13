import { useState, useEffect } from 'react'
import type { User, Session } from '@supabase/supabase-js'
import { supabase, isSupabaseConfigured } from './supabase'
import { isDemoMode } from './runtime'

export interface AuthUser {
  id: string
  email: string
  fullName: string
  agencyName?: string
}

export interface AuthState {
  user: User | null
  session: Session | null
  loading: boolean
  isConfigured: boolean
  profile: AuthUser | null
}

const LOCAL_USER_KEY = 'openhouse_current_user'

function getSavedLocalUser(): AuthUser | null {
  if (!isDemoMode) return null
  try {
    const saved = localStorage.getItem(LOCAL_USER_KEY)
    if (saved) return JSON.parse(saved)
  } catch {
    // ignore
  }
  return {
    id: 'usr-default-01',
    email: 'david@openhouse.com',
    fullName: 'David Olabowale',
    agencyName: 'OpenHouse Realty Advisors',
  }
}

export async function signIn(email: string, password: string): Promise<{ user: AuthUser | null; error: string | null }> {
  const cleanEmail = email.trim().toLowerCase()

  // A local identity is only valid in the explicitly labelled demo environment.
  if (isDemoMode && (cleanEmail === 'david@openhouse.com' || cleanEmail.includes('demo') || !isSupabaseConfigured)) {
    const mockUser: AuthUser = {
      id: 'usr-david-01',
      email: email.trim(),
      fullName: cleanEmail.includes('david') ? 'David Olabowale' : (email.split('@')[0] ? email.split('@')[0].replace('.', ' ') : 'Realtor'),
      agencyName: 'OpenHouse Realty Advisors',
    }
    localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(mockUser))
    window.dispatchEvent(new Event('auth_state_changed'))
    window.dispatchEvent(new Event('storage'))
    return { user: mockUser, error: null }
  }
  if (!isSupabaseConfigured) {
    return { user: null, error: 'Sign-in is unavailable until production services are configured.' }
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return { user: null, error: error.message }
    if (data.user) {
      const authUser: AuthUser = {
        id: data.user.id,
        email: data.user.email || email,
        fullName: (data.user.user_metadata?.full_name as string) || 'Realtor',
        agencyName: (data.user.user_metadata?.agency_name as string) || 'OpenHouse Realty',
      }
      if (isDemoMode) localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(authUser))
      window.dispatchEvent(new Event('auth_state_changed'))
      window.dispatchEvent(new Event('storage'))
      return { user: authUser, error: null }
    }
    return { user: null, error: 'Unknown authentication error' }
  } catch (err: unknown) {
    return { user: null, error: err instanceof Error ? err.message : 'Unable to sign in.' }
  }
}

export async function signUp(
  email: string,
  password: string,
  fullName: string,
  agencyName?: string
): Promise<{ user: AuthUser | null; error: string | null }> {
  if (isDemoMode && !isSupabaseConfigured) {
    const mockUser: AuthUser = {
      id: 'usr-' + Date.now(),
      email: email.trim(),
      fullName: fullName.trim() || 'Realtor',
      agencyName: agencyName?.trim() || 'OpenHouse Realty',
    }
    localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(mockUser))
    window.dispatchEvent(new Event('auth_state_changed'))
    window.dispatchEvent(new Event('storage'))
    return { user: mockUser, error: null }
  }
  if (!isSupabaseConfigured) return { user: null, error: 'Account creation is unavailable until production services are configured.' }

  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          agency_name: agencyName || '',
        },
      },
    })
    if (error) return { user: null, error: error.message }
    if (data.user) {
      const authUser: AuthUser = {
        id: data.user.id,
        email: data.user.email || email,
        fullName: fullName || 'Realtor',
        agencyName: agencyName || 'OpenHouse Realty',
      }
      if (isDemoMode) localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(authUser))
      return { user: authUser, error: null }
    }
    return { user: null, error: 'Failed to create account' }
  } catch (err: any) {
    return { user: null, error: err.message || 'Failed to sign up' }
  }
}

export async function signOut(): Promise<void> {
  localStorage.removeItem(LOCAL_USER_KEY)
  if (isSupabaseConfigured) {
    await supabase.auth.signOut().catch(() => {})
  }
}

export function useAuth(): AuthState {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<AuthUser | null>(getSavedLocalUser())

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false)
      return
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        setProfile({
          id: session.user.id,
          email: session.user.email || '',
          fullName: (session.user.user_metadata?.full_name as string) || 'Realtor',
          agencyName: (session.user.user_metadata?.agency_name as string) || 'OpenHouse Realty',
        })
      }
      setLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        setProfile({
          id: session.user.id,
          email: session.user.email || '',
          fullName: (session.user.user_metadata?.full_name as string) || 'Realtor',
          agencyName: (session.user.user_metadata?.agency_name as string) || 'OpenHouse Realty',
        })
      }
      setLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return { user, session, loading, isConfigured: isSupabaseConfigured, profile }
}
