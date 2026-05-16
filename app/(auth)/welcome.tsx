import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native'
import { router } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function WelcomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.hero}>
        <Text style={styles.logo}>once.</Text>
        <Text style={styles.tagline}>A disposable camera{'\n'}for your events.</Text>
        <Text style={styles.sub}>
          Capture candid moments with guests.{'\n'}Reveal them together when it's over.
        </Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.primaryBtn} onPress={() => router.push('/(auth)/signup')}>
          <Text style={styles.primaryBtnText}>Create an Event</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondaryBtn} onPress={() => router.push('/(auth)/login')}>
          <Text style={styles.secondaryBtnText}>Sign In</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.guestBtn} onPress={() => router.push('/(guest)/join')}>
          <Text style={styles.guestBtnText}>Join as Guest →</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a', justifyContent: 'space-between', padding: 28 },
  hero: { flex: 1, justifyContent: 'center' },
  logo: { fontSize: 52, fontWeight: '700', color: '#fff', letterSpacing: -2, marginBottom: 24 },
  tagline: { fontSize: 30, fontWeight: '600', color: '#fff', lineHeight: 38, marginBottom: 16 },
  sub: { fontSize: 16, color: '#888', lineHeight: 24 },
  actions: { gap: 12 },
  primaryBtn: { backgroundColor: '#fff', borderRadius: 16, paddingVertical: 18, alignItems: 'center' },
  primaryBtnText: { color: '#0a0a0a', fontSize: 17, fontWeight: '700' },
  secondaryBtn: { backgroundColor: '#1a1a1a', borderRadius: 16, paddingVertical: 18, alignItems: 'center', borderWidth: 1, borderColor: '#333' },
  secondaryBtnText: { color: '#fff', fontSize: 17, fontWeight: '600' },
  guestBtn: { alignItems: 'center', paddingVertical: 12 },
  guestBtnText: { color: '#888', fontSize: 15 },
})
