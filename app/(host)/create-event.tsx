import { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native'
import { router } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../store/authStore'
import { getPriceForGuests, getPricingTier } from '../../lib/pricing'
import { EventType } from '../../types'

const EVENT_TYPES: EventType[] = ['wedding', 'birthday', 'party', 'corporate', 'trip', 'other']

function generateJoinCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase()
}

export default function CreateEventScreen() {
  const user = useAuthStore((s) => s.user)
  const [name, setName] = useState('')
  const [type, setType] = useState<EventType>('party')
  const [date, setDate] = useState('')
  const [shotLimit, setShotLimit] = useState('10')
  const [guestCount, setGuestCount] = useState('20')
  const [revealDelay, setRevealDelay] = useState('immediately')
  const [loading, setLoading] = useState(false)

  const price = getPriceForGuests(parseInt(guestCount) || 20)
  const priceTier = getPricingTier(parseInt(guestCount) || 20)

  async function handleCreate() {
    if (!name || !date) return Alert.alert('Please fill in name and date')
    setLoading(true)

    const guests = parseInt(guestCount) || 20
    const shots = parseInt(shotLimit) || 10

    let revealAt: string | null = null
    if (revealDelay === '1h') revealAt = new Date(Date.now() + 3600000).toISOString()
    else if (revealDelay === '24h') revealAt = new Date(Date.now() + 86400000).toISOString()
    else if (revealDelay === '48h') revealAt = new Date(Date.now() + 172800000).toISOString()

    const { data, error } = await supabase.from('events').insert({
      host_id: user?.id,
      name,
      type,
      date,
      shot_limit: shots,
      guest_count: guests,
      reveal_at: revealAt,
      join_code: generateJoinCode(),
    }).select().single()

    setLoading(false)
    if (error) return Alert.alert('Error', error.message)
    router.replace(`/event/${data.id}`)
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <TouchableOpacity onPress={() => router.back()} style={styles.back}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        <Text style={styles.title}>New Film</Text>
        <Text style={styles.sub}>Set up your disposable camera event.</Text>

        <View style={styles.section}>
          <Text style={styles.label}>Event Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Sarah & Tom's Wedding"
            placeholderTextColor="#555"
            value={name}
            onChangeText={setName}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Event Type</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typeRow}>
            {EVENT_TYPES.map((t) => (
              <TouchableOpacity
                key={t}
                style={[styles.typeChip, type === t && styles.typeChipActive]}
                onPress={() => setType(t)}
              >
                <Text style={[styles.typeChipText, type === t && styles.typeChipTextActive]}>
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Date (YYYY-MM-DD)</Text>
          <TextInput
            style={styles.input}
            placeholder="2026-06-15"
            placeholderTextColor="#555"
            value={date}
            onChangeText={setDate}
          />
        </View>

        <View style={styles.row}>
          <View style={[styles.section, { flex: 1 }]}>
            <Text style={styles.label}>Guests</Text>
            <TextInput
              style={styles.input}
              placeholder="20"
              placeholderTextColor="#555"
              value={guestCount}
              onChangeText={setGuestCount}
              keyboardType="number-pad"
            />
          </View>
          <View style={{ width: 12 }} />
          <View style={[styles.section, { flex: 1 }]}>
            <Text style={styles.label}>Shots each</Text>
            <TextInput
              style={styles.input}
              placeholder="10"
              placeholderTextColor="#555"
              value={shotLimit}
              onChangeText={setShotLimit}
              keyboardType="number-pad"
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Reveal Photos</Text>
          {['immediately', '1h', '24h', '48h'].map((opt) => (
            <TouchableOpacity
              key={opt}
              style={[styles.radioRow, revealDelay === opt && styles.radioRowActive]}
              onPress={() => setRevealDelay(opt)}
            >
              <View style={[styles.radio, revealDelay === opt && styles.radioActive]} />
              <Text style={styles.radioText}>
                {opt === 'immediately' ? 'When host taps "Develop"' :
                 opt === '1h' ? '1 hour after event' :
                 opt === '24h' ? '24 hours after event' : '48 hours after event'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.pricingBox}>
          <Text style={styles.pricingLabel}>Pricing: {priceTier}</Text>
          <Text style={styles.pricingAmount}>${price}</Text>
        </View>

        <TouchableOpacity style={styles.btn} onPress={handleCreate} disabled={loading}>
          <Text style={styles.btnText}>{loading ? 'Creating...' : `Continue — $${price}`}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  scroll: { padding: 24 },
  back: { marginBottom: 24 },
  backText: { color: '#888', fontSize: 16 },
  title: { fontSize: 32, fontWeight: '700', color: '#fff', marginBottom: 8 },
  sub: { fontSize: 16, color: '#888', marginBottom: 32 },
  section: { marginBottom: 24 },
  label: { color: '#aaa', fontSize: 13, fontWeight: '600', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 },
  input: { backgroundColor: '#1a1a1a', borderRadius: 14, padding: 18, color: '#fff', fontSize: 16, borderWidth: 1, borderColor: '#2a2a2a' },
  row: { flexDirection: 'row', marginBottom: 0 },
  typeRow: { marginHorizontal: -4 },
  typeChip: { backgroundColor: '#1a1a1a', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, marginHorizontal: 4, borderWidth: 1, borderColor: '#2a2a2a' },
  typeChipActive: { backgroundColor: '#fff', borderColor: '#fff' },
  typeChipText: { color: '#888', fontSize: 14, fontWeight: '600' },
  typeChipTextActive: { color: '#0a0a0a' },
  radioRow: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: '#1a1a1a', borderRadius: 12, marginBottom: 8, borderWidth: 1, borderColor: '#2a2a2a' },
  radioRowActive: { borderColor: '#fff' },
  radio: { width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: '#555', marginRight: 12 },
  radioActive: { borderColor: '#fff', backgroundColor: '#fff' },
  radioText: { color: '#ddd', fontSize: 15 },
  pricingBox: { backgroundColor: '#1a1a1a', borderRadius: 14, padding: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, borderWidth: 1, borderColor: '#2a2a2a' },
  pricingLabel: { color: '#888', fontSize: 15 },
  pricingAmount: { color: '#fff', fontSize: 24, fontWeight: '700' },
  btn: { backgroundColor: '#fff', borderRadius: 14, paddingVertical: 18, alignItems: 'center', marginBottom: 40 },
  btnText: { color: '#0a0a0a', fontSize: 17, fontWeight: '700' },
})
