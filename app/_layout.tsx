import { useEffect } from 'react'
import { Stack, router } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store/authStore'

export default function RootLayout() {
  const setSession = useAuthStore((s) => s.setSession)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session) router.replace('/(host)/dashboard')
    }).catch(() => {})

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session) {
        router.replace('/(host)/dashboard')
      } else {
        router.replace('/(auth)/welcome')
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  return (
    <>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#0a0a0a' } }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(host)" />
        <Stack.Screen name="(guest)" />
        <Stack.Screen name="event/[id]" />
      </Stack>
    </>
  )
}
