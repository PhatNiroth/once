import { useEffect, useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, Image, ScrollView } from 'react-native'
import { router } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { supabase } from '../../lib/supabase'
import { useGuestStore } from '../../store/guestStore'
import { Photo } from '../../types'

export default function WaitingScreen() {
  const { currentEvent, guestName, shotsTaken, reset } = useGuestStore()
  const [revealed, setRevealed] = useState(false)
  const [photoUrls, setPhotoUrls] = useState<string[]>([])

  useEffect(() => {
    checkReveal()
    const interval = setInterval(checkReveal, 5000)
    return () => clearInterval(interval)
  }, [])

  async function checkReveal() {
    if (!currentEvent) return
    const { data } = await supabase.from('events').select('revealed').eq('id', currentEvent.id).single()
    if (data?.revealed) {
      setRevealed(true)
      loadPhotos()
    }
  }

  async function loadPhotos() {
    if (!currentEvent) return
    const { data } = await supabase.from('photos').select('*').eq('event_id', currentEvent.id)
    const urls = await Promise.all(
      (data ?? []).map(async (p: Photo) => {
        const { data: urlData } = supabase.storage.from('event-photos').getPublicUrl(p.storage_path)
        return urlData.publicUrl
      })
    )
    setPhotoUrls(urls)
  }

  function handleLeave() {
    reset()
    router.replace('/(auth)/welcome')
  }

  if (revealed) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <Text style={styles.revealEmoji}>📸</Text>
          <Text style={styles.revealTitle}>Film Developed!</Text>
          <Text style={styles.revealSub}>
            {currentEvent?.name} · {photoUrls.length} photos
          </Text>

          <View style={styles.grid}>
            {photoUrls.map((url, i) => (
              <Image key={i} source={{ uri: url }} style={styles.gridPhoto} />
            ))}
          </View>

          <TouchableOpacity style={styles.leaveBtn} onPress={handleLeave}>
            <Text style={styles.leaveBtnText}>Leave Event</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.inner}>
        <Text style={styles.filmEmoji}>🎞</Text>
        <Text style={styles.title}>Film in the Dark</Text>
        <Text style={styles.sub}>
          Hey {guestName}, your {shotsTaken} photo{shotsTaken !== 1 ? 's' : ''} are safe.{'\n'}
          Waiting for the host to develop the film...
        </Text>

        <View style={styles.infoBox}>
          <Text style={styles.infoText}>📍 {currentEvent?.name}</Text>
          <Text style={styles.infoText}>📷 {shotsTaken} / {currentEvent?.shot_limit} shots used</Text>
          {currentEvent?.reveal_at && (
            <Text style={styles.infoText}>
              ⏰ Reveals {new Date(currentEvent.reveal_at).toLocaleString()}
            </Text>
          )}
        </View>

        <TouchableOpacity style={styles.cameraBtn} onPress={() => router.back()}>
          <Text style={styles.cameraBtnText}>Back to Camera</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.leaveBtn} onPress={handleLeave}>
          <Text style={styles.leaveBtnText}>Leave Event</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  inner: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  scroll: { padding: 24 },
  filmEmoji: { fontSize: 64, marginBottom: 24 },
  title: { fontSize: 28, fontWeight: '700', color: '#fff', marginBottom: 12, textAlign: 'center' },
  sub: { fontSize: 16, color: '#888', textAlign: 'center', lineHeight: 24, marginBottom: 32 },
  infoBox: { backgroundColor: '#1a1a1a', borderRadius: 16, padding: 20, width: '100%', gap: 12, marginBottom: 32, borderWidth: 1, borderColor: '#2a2a2a' },
  infoText: { color: '#ddd', fontSize: 15 },
  cameraBtn: { backgroundColor: '#fff', borderRadius: 14, paddingVertical: 16, paddingHorizontal: 40, marginBottom: 12 },
  cameraBtnText: { color: '#0a0a0a', fontSize: 16, fontWeight: '700' },
  leaveBtn: { paddingVertical: 12 },
  leaveBtnText: { color: '#888', fontSize: 15 },
  revealEmoji: { fontSize: 64, textAlign: 'center', marginBottom: 16 },
  revealTitle: { fontSize: 32, fontWeight: '700', color: '#fff', textAlign: 'center', marginBottom: 8 },
  revealSub: { color: '#888', fontSize: 15, textAlign: 'center', marginBottom: 24 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginBottom: 32 },
  gridPhoto: { width: '32%', aspectRatio: 1, borderRadius: 8, backgroundColor: '#1a1a1a' },
})
