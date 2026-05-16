import { useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native'
import { useLocalSearchParams, router } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { supabase } from '../../lib/supabase'
import { getPriceForGuests } from '../../lib/pricing'

export default function PaymentScreen() {
  const { eventId, guestCount } = useLocalSearchParams<{ eventId: string; guestCount: string }>()
  const [loading, setLoading] = useState(false)
  const price = getPriceForGuests(parseInt(guestCount ?? '20'))

  async function handlePay() {
    setLoading(true)
    // In production: call your backend to create a Stripe PaymentIntent,
    // then use @stripe/stripe-react-native to confirm it.
    // Here we simulate a successful payment for development.
    await new Promise((r) => setTimeout(r, 1500))
    const { error } = await supabase.from('events').update({ paid: true }).eq('id', eventId)
    setLoading(false)
    if (error) return Alert.alert('Error', error.message)
    router.replace(`/event/${eventId}`)
  }

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity onPress={() => router.back()} style={styles.back}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Activate Film</Text>
      <Text style={styles.sub}>One-time payment to go live.</Text>

      <View style={styles.priceBox}>
        <Text style={styles.priceLabel}>Event total</Text>
        <Text style={styles.price}>${price}</Text>
        <Text style={styles.priceNote}>For up to {guestCount} guests · Unlimited photos per guest slot</Text>
      </View>

      <View style={styles.features}>
        {['Unlimited photo uploads', 'QR code guest access', 'Delayed film reveal', 'Gallery download'].map((f) => (
          <View key={f} style={styles.featureRow}>
            <Text style={styles.featureCheck}>✓</Text>
            <Text style={styles.featureText}>{f}</Text>
          </View>
        ))}
      </View>

      <TouchableOpacity style={styles.payBtn} onPress={handlePay} disabled={loading}>
        <Text style={styles.payBtnText}>{loading ? 'Processing...' : `Pay $${price}`}</Text>
      </TouchableOpacity>

      <Text style={styles.disclaimer}>Secure payment via Stripe. No recurring charges.</Text>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a', padding: 28 },
  back: { marginBottom: 32 },
  backText: { color: '#888', fontSize: 16 },
  title: { fontSize: 32, fontWeight: '700', color: '#fff', marginBottom: 8 },
  sub: { fontSize: 16, color: '#888', marginBottom: 32 },
  priceBox: { backgroundColor: '#1a1a1a', borderRadius: 20, padding: 28, marginBottom: 28, alignItems: 'center', borderWidth: 1, borderColor: '#2a2a2a' },
  priceLabel: { color: '#888', fontSize: 14, marginBottom: 8 },
  price: { color: '#fff', fontSize: 56, fontWeight: '700', marginBottom: 8 },
  priceNote: { color: '#555', fontSize: 13, textAlign: 'center' },
  features: { gap: 14, marginBottom: 32 },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  featureCheck: { color: '#10b981', fontSize: 16, fontWeight: '700', width: 24 },
  featureText: { color: '#ddd', fontSize: 16 },
  payBtn: { backgroundColor: '#fff', borderRadius: 16, paddingVertical: 18, alignItems: 'center', marginBottom: 16 },
  payBtnText: { color: '#0a0a0a', fontSize: 17, fontWeight: '700' },
  disclaimer: { color: '#555', fontSize: 13, textAlign: 'center' },
})
