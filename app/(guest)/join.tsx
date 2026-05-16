import { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform } from 'react-native'
import { router } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { supabase } from '../../lib/supabase'
import { useGuestStore } from '../../store/guestStore'

export default function JoinScreen() {
  const [code, setCode] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const { setGuest, setEvent } = useGuestStore()

  async function handleJoin() {
    if (!code.trim() || !name.trim()) return Alert.alert('Enter your name and the event code')
    setLoading(true)

    const { data: event, error } = await supabase
      .from('events')
      .select('*')
      .eq('join_code', code.toUpperCase().trim())
      .single()

    if (error || !event) {
      setLoading(false)
      return Alert.alert('Event not found', 'Check the code and try again.')
    }

    if (event.revealed) {
      setLoading(false)
      return Alert.alert('Film already revealed', 'This event has already ended.')
    }

    const { data: guest, error: gErr } = await supabase
      .from('guests')
      .insert({ event_id: event.id, name: name.trim() })
      .select()
      .single()

    setLoading(false)
    if (gErr) return Alert.alert('Error', gErr.message)

    setGuest(guest.id, name.trim())
    setEvent(event)
    router.replace('/(guest)/camera')
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.inner}>
        <TouchableOpacity onPress={() => router.back()} style={styles.back}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Join Event</Text>
        <Text style={styles.sub}>Enter the code from the host to start shooting.</Text>

        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Your name"
            placeholderTextColor="#555"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
          />
          <TextInput
            style={[styles.input, styles.codeInput]}
            placeholder="EVENT CODE"
            placeholderTextColor="#555"
            value={code}
            onChangeText={setCode}
            autoCapitalize="characters"
            maxLength={6}
          />
          <TouchableOpacity style={styles.btn} onPress={handleJoin} disabled={loading}>
            <Text style={styles.btnText}>{loading ? 'Joining...' : 'Join & Shoot'}</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  inner: { flex: 1, padding: 28 },
  back: { marginBottom: 32 },
  backText: { color: '#888', fontSize: 16 },
  title: { fontSize: 32, fontWeight: '700', color: '#fff', marginBottom: 8 },
  sub: { fontSize: 16, color: '#888', marginBottom: 40, lineHeight: 24 },
  form: { gap: 14 },
  input: { backgroundColor: '#1a1a1a', borderRadius: 14, padding: 18, color: '#fff', fontSize: 16, borderWidth: 1, borderColor: '#2a2a2a' },
  codeInput: { fontSize: 24, fontWeight: '700', letterSpacing: 6, textAlign: 'center' },
  btn: { backgroundColor: '#fff', borderRadius: 14, paddingVertical: 18, alignItems: 'center', marginTop: 8 },
  btnText: { color: '#0a0a0a', fontSize: 17, fontWeight: '700' },
})
