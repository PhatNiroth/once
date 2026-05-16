import { useEffect, useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, Share, Alert, ScrollView, Image } from 'react-native'
import { useLocalSearchParams, router } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import QRCode from 'react-native-qrcode-svg'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../store/authStore'
import { Event, Photo } from '../../types'

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const user = useAuthStore((s) => s.user)
  const [event, setEvent] = useState<Event | null>(null)
  const [photos, setPhotos] = useState<Photo[]>([])
  const [photoUrls, setPhotoUrls] = useState<string[]>([])
  const [guestCount, setGuestCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [revealing, setRevealing] = useState(false)

  const joinLink = `once://join/${event?.join_code}`

  useEffect(() => {
    fetchEvent()
  }, [id])

  async function fetchEvent() {
    const { data: ev } = await supabase.from('events').select('*').eq('id', id).single()
    setEvent(ev)

    const { data: guests } = await supabase.from('guests').select('id').eq('event_id', id)
    setGuestCount(guests?.length ?? 0)

    if (ev?.revealed) {
      const { data: p } = await supabase.from('photos').select('*').eq('event_id', id)
      setPhotos(p ?? [])
      const urls = await Promise.all(
        (p ?? []).map(async (photo: Photo) => {
          const { data } = supabase.storage.from('event-photos').getPublicUrl(photo.storage_path)
          return data.publicUrl
        })
      )
      setPhotoUrls(urls)
    }
    setLoading(false)
  }

  async function handleReveal() {
    Alert.alert('Develop Film?', 'All guests will see the photos. This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Develop', style: 'destructive',
        onPress: async () => {
          setRevealing(true)
          await supabase.from('events').update({ revealed: true }).eq('id', id)
          setRevealing(false)
          fetchEvent()
        }
      }
    ])
  }

  async function handleShare() {
    await Share.share({
      message: `You're invited to "${event?.name}"! Join as a guest: ${joinLink}`,
      title: `Join ${event?.name}`,
    })
  }

  if (loading || !event) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </SafeAreaView>
    )
  }

  const isHost = event.host_id === user?.id

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <TouchableOpacity onPress={() => router.back()} style={styles.back}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        <View style={styles.titleRow}>
          <Text style={styles.title}>{event.name}</Text>
          <View style={[styles.badge, event.revealed ? styles.badgeGreen : styles.badgeBlue]}>
            <Text style={styles.badgeText}>{event.revealed ? 'Revealed' : 'Live'}</Text>
          </View>
        </View>
        <Text style={styles.meta}>
          {new Date(event.date).toLocaleDateString()} · {event.type} · {event.shot_limit} shots each
        </Text>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{guestCount}</Text>
            <Text style={styles.statLabel}>Guests</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{photos.length}</Text>
            <Text style={styles.statLabel}>Photos</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{event.shot_limit}</Text>
            <Text style={styles.statLabel}>Shots/guest</Text>
          </View>
        </View>

        {/* QR Code */}
        {!event.revealed && (
          <View style={styles.qrSection}>
            <Text style={styles.sectionTitle}>Share with Guests</Text>
            <View style={styles.qrBox}>
              <QRCode value={joinLink} size={200} backgroundColor="#1a1a1a" color="#ffffff" />
            </View>
            <Text style={styles.joinCode}>Code: {event.join_code}</Text>
            <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
              <Text style={styles.shareBtnText}>Share Invite Link</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Reveal button */}
        {isHost && !event.revealed && (
          <TouchableOpacity style={styles.revealBtn} onPress={handleReveal} disabled={revealing}>
            <Text style={styles.revealBtnText}>
              {revealing ? 'Developing...' : '📸 Develop Film'}
            </Text>
          </TouchableOpacity>
        )}

        {/* Gallery */}
        {event.revealed && (
          <View style={styles.gallerySection}>
            <Text style={styles.sectionTitle}>The Film — {photos.length} photos</Text>
            {photoUrls.length === 0 ? (
              <Text style={styles.emptyGallery}>No photos yet.</Text>
            ) : (
              <View style={styles.grid}>
                {photoUrls.map((url, i) => (
                  <Image key={i} source={{ uri: url }} style={styles.gridPhoto} />
                ))}
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  scroll: { padding: 24 },
  loadingText: { color: '#888', textAlign: 'center', marginTop: 100 },
  back: { marginBottom: 20 },
  backText: { color: '#888', fontSize: 16 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 },
  title: { fontSize: 26, fontWeight: '700', color: '#fff', flex: 1 },
  badge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  badgeBlue: { backgroundColor: '#3b82f622' },
  badgeGreen: { backgroundColor: '#10b98122' },
  badgeText: { fontSize: 12, fontWeight: '600', color: '#10b981' },
  meta: { color: '#888', fontSize: 14, marginBottom: 24, textTransform: 'capitalize' },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 32 },
  statBox: { flex: 1, backgroundColor: '#1a1a1a', borderRadius: 14, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: '#2a2a2a' },
  statNumber: { color: '#fff', fontSize: 24, fontWeight: '700' },
  statLabel: { color: '#888', fontSize: 12, marginTop: 4 },
  qrSection: { alignItems: 'center', marginBottom: 32 },
  sectionTitle: { color: '#aaa', fontSize: 13, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 20, alignSelf: 'flex-start' },
  qrBox: { backgroundColor: '#1a1a1a', borderRadius: 20, padding: 24, marginBottom: 16 },
  joinCode: { color: '#fff', fontSize: 20, fontWeight: '700', letterSpacing: 4, marginBottom: 16 },
  shareBtn: { backgroundColor: '#1a1a1a', borderRadius: 14, paddingVertical: 14, paddingHorizontal: 32, borderWidth: 1, borderColor: '#333' },
  shareBtnText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  revealBtn: { backgroundColor: '#fff', borderRadius: 16, paddingVertical: 18, alignItems: 'center', marginBottom: 32 },
  revealBtnText: { color: '#0a0a0a', fontSize: 17, fontWeight: '700' },
  gallerySection: { marginBottom: 40 },
  emptyGallery: { color: '#888', textAlign: 'center', marginTop: 20 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  gridPhoto: { width: '32%', aspectRatio: 1, borderRadius: 8, backgroundColor: '#1a1a1a' },
})
