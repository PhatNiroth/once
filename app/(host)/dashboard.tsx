import { useEffect, useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Alert } from 'react-native'
import { router } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../store/authStore'
import { Event } from '../../types'

export default function DashboardScreen() {
  const user = useAuthStore((s) => s.user)
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchEvents()
  }, [])

  async function fetchEvents() {
    const { data } = await supabase
      .from('events')
      .select('*')
      .eq('host_id', user?.id)
      .order('created_at', { ascending: false })
    setEvents(data ?? [])
    setLoading(false)
  }

  async function handleSignOut() {
    await supabase.auth.signOut()
  }

  function getStatusLabel(event: Event) {
    if (!event.paid) return { label: 'Unpaid', color: '#f59e0b' }
    if (event.revealed) return { label: 'Revealed', color: '#10b981' }
    return { label: 'Live', color: '#3b82f6' }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.logo}>once.</Text>
        <TouchableOpacity onPress={handleSignOut}>
          <Text style={styles.signout}>Sign out</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.greeting}>Your Films</Text>

      <TouchableOpacity style={styles.createBtn} onPress={() => router.push('/(host)/create-event')}>
        <Text style={styles.createBtnText}>+ Create New Film</Text>
      </TouchableOpacity>

      {loading ? (
        <Text style={styles.empty}>Loading...</Text>
      ) : events.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>No films yet</Text>
          <Text style={styles.emptyText}>Create your first event and start capturing memories.</Text>
        </View>
      ) : (
        <FlatList
          data={events}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => {
            const status = getStatusLabel(item)
            return (
              <TouchableOpacity
                style={styles.eventCard}
                onPress={() => router.push(`/event/${item.id}`)}
              >
                <View style={styles.eventTop}>
                  <Text style={styles.eventName}>{item.name}</Text>
                  <View style={[styles.badge, { backgroundColor: status.color + '22' }]}>
                    <Text style={[styles.badgeText, { color: status.color }]}>{status.label}</Text>
                  </View>
                </View>
                <Text style={styles.eventMeta}>
                  {new Date(item.date).toLocaleDateString()} · {item.guest_count} guests · {item.shot_limit} shots each
                </Text>
                <Text style={styles.eventType}>{item.type}</Text>
              </TouchableOpacity>
            )
          }}
        />
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 24, paddingBottom: 8 },
  logo: { fontSize: 28, fontWeight: '700', color: '#fff', letterSpacing: -1 },
  signout: { color: '#888', fontSize: 15 },
  greeting: { fontSize: 22, fontWeight: '700', color: '#fff', paddingHorizontal: 24, marginBottom: 16 },
  createBtn: { marginHorizontal: 24, backgroundColor: '#fff', borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginBottom: 24 },
  createBtnText: { color: '#0a0a0a', fontSize: 16, fontWeight: '700' },
  list: { paddingHorizontal: 24, gap: 12 },
  eventCard: { backgroundColor: '#1a1a1a', borderRadius: 16, padding: 20, borderWidth: 1, borderColor: '#2a2a2a' },
  eventTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  eventName: { fontSize: 18, fontWeight: '700', color: '#fff', flex: 1 },
  badge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  badgeText: { fontSize: 12, fontWeight: '600' },
  eventMeta: { color: '#888', fontSize: 13, marginBottom: 4 },
  eventType: { color: '#555', fontSize: 12, textTransform: 'capitalize' },
  empty: { color: '#888', textAlign: 'center', marginTop: 40 },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  emptyTitle: { color: '#fff', fontSize: 20, fontWeight: '700', marginBottom: 8 },
  emptyText: { color: '#888', fontSize: 15, textAlign: 'center', lineHeight: 22 },
})
